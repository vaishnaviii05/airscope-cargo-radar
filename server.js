import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const cacheMs = Number(process.env.CACHE_MS || 15000);
const providerTimeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || 6500);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

let cachedToken = null;
let tokenExpiresAt = 0;
let lastPayload = null;
let lastFetchAt = 0;
let lastSecondaryPayload = null;
let lastSecondaryFetchAt = 0;

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function clampNumber(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function buildOpenSkyUrl(searchParams) {
  const lamin = searchParams.get("lamin");
  const lomin = searchParams.get("lomin");
  const lamax = searchParams.get("lamax");
  const lomax = searchParams.get("lomax");
  const url = new URL("https://opensky-network.org/api/states/all");

  if ([lamin, lomin, lamax, lomax].every((value) => value !== null)) {
    url.searchParams.set("lamin", String(clampNumber(lamin, -90, -90, 90)));
    url.searchParams.set("lomin", String(clampNumber(lomin, -180, -180, 180)));
    url.searchParams.set("lamax", String(clampNumber(lamax, 90, -90, 90)));
    url.searchParams.set("lomax", String(clampNumber(lomax, 180, -180, 180)));
  }

  return url;
}

function getBounds(searchParams) {
  const lamin = clampNumber(searchParams.get("lamin"), -90, -90, 90);
  const lomin = clampNumber(searchParams.get("lomin"), -180, -180, 180);
  const lamax = clampNumber(searchParams.get("lamax"), 90, -90, 90);
  const lomax = clampNumber(searchParams.get("lomax"), 180, -180, 180);
  return { lamin, lomin, lamax, lomax };
}

function buildAirplanesLiveUrl(searchParams) {
  const { lamin, lomin, lamax, lomax } = getBounds(searchParams);
  const lat = (lamin + lamax) / 2;
  const lon = (lomin + lomax) / 2;
  const latKm = Math.abs(lamax - lamin) * 111;
  const lonKm = Math.abs(lomax - lomin) * 111 * Math.max(0.25, Math.cos(lat * Math.PI / 180));
  const radiusNm = Math.max(25, Math.min(250, Math.ceil(Math.hypot(latKm, lonKm) / 2 / 1.852)));
  return new URL(`https://api.airplanes.live/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/${radiusNm}`);
}

async function getOpenSkyToken() {
  if (process.env.OPENSKY_TOKEN) return process.env.OPENSKY_TOKEN;

  const clientId = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (cachedToken && Date.now() < tokenExpiresAt - 30000) return cachedToken;

  const response = await fetch("https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(providerTimeoutMs),
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`OpenSky token request failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  cachedToken = payload.access_token;
  tokenExpiresAt = Date.now() + Number(payload.expires_in || 300) * 1000;
  return cachedToken;
}

function normalizeState(row) {
  const [
    icao24,
    callsign,
    originCountry,
    timePosition,
    lastContact,
    longitude,
    latitude,
    baroAltitude,
    onGround,
    velocity,
    trueTrack,
    verticalRate,
    sensors,
    geoAltitude,
    squawk,
    spi,
    positionSource,
    category
  ] = row;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    id: icao24,
    callsign: callsign?.trim() || icao24?.toUpperCase() || "UNKNOWN",
    originCountry: originCountry || "Unknown",
    lastContact,
    timePosition,
    latitude,
    longitude,
    altitudeMeters: Number.isFinite(geoAltitude) ? geoAltitude : baroAltitude,
    baroAltitudeMeters: baroAltitude,
    onGround: Boolean(onGround),
    velocityMetersPerSecond: velocity,
    headingDegrees: trueTrack,
    verticalRateMetersPerSecond: verticalRate,
    squawk,
    spi: Boolean(spi),
    positionSource,
    category
  };
}

async function fetchOpenSky(searchParams) {
  const now = Date.now();
  const cacheKey = buildOpenSkyUrl(searchParams).toString();

  if (lastPayload && lastPayload.cacheKey === cacheKey && now - lastFetchAt < cacheMs) {
    return { ...lastPayload.body, cached: true };
  }

  const url = buildOpenSkyUrl(searchParams);
  const token = await getOpenSkyToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(providerTimeoutMs)
  });

  if (!response.ok) {
    throw new Error(`OpenSky returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  const aircraft = Array.isArray(payload.states) ? payload.states.map(normalizeState).filter(Boolean) : [];
  const body = {
    source: "OpenSky Network",
    generatedAt: payload.time ? payload.time * 1000 : Date.now(),
    count: aircraft.length,
    aircraft
  };

  lastPayload = { cacheKey, body };
  lastFetchAt = now;
  return { ...body, cached: false };
}

function normalizeAirplanesLive(item, generatedAt) {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const altitudeFeet = Number(item.alt_geom ?? item.alt_baro);
  const verticalRateFeet = Number(item.baro_rate ?? item.geom_rate);
  const speedKnots = Number(item.gs);
  const seen = Number(item.seen_pos ?? item.seen ?? 0);
  const lastContact = Math.floor((generatedAt - seen * 1000) / 1000);
  const id = String(item.hex || item.icao || item.r || "unknown").toLowerCase();

  return {
    id,
    callsign: String(item.flight || item.r || id.toUpperCase()).trim() || id.toUpperCase(),
    originCountry: item.dbFlags ? "Live ADS-B" : "Unknown",
    lastContact,
    timePosition: lastContact,
    latitude,
    longitude,
    altitudeMeters: Number.isFinite(altitudeFeet) ? altitudeFeet / 3.28084 : null,
    baroAltitudeMeters: Number.isFinite(altitudeFeet) ? altitudeFeet / 3.28084 : null,
    onGround: item.alt_baro === "ground" || item.gnd === true,
    velocityMetersPerSecond: Number.isFinite(speedKnots) ? speedKnots / 1.94384 : null,
    headingDegrees: Number.isFinite(Number(item.track)) ? Number(item.track) : null,
    verticalRateMetersPerSecond: Number.isFinite(verticalRateFeet) ? verticalRateFeet / 196.8504 : null,
    squawk: item.squawk || null,
    spi: false,
    positionSource: "airplanes.live",
    category: item.category || null
  };
}

async function fetchAirplanesLive(searchParams) {
  const now = Date.now();
  const url = buildAirplanesLiveUrl(searchParams);
  const cacheKey = url.toString();

  if (lastSecondaryPayload && lastSecondaryPayload.cacheKey === cacheKey && now - lastSecondaryFetchAt < cacheMs) {
    return { ...lastSecondaryPayload.body, cached: true };
  }

  const response = await fetch(url, {
    headers: {
      "User-Agent": "AirScopeCargoRadar/1.0 contact: local-development"
    },
    signal: AbortSignal.timeout(providerTimeoutMs)
  });

  if (!response.ok) {
    throw new Error(`Airplanes.live returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  const generatedAt = Number(payload.now) ? Number(payload.now) * 1000 : Date.now();
  const aircraft = Array.isArray(payload.ac)
    ? payload.ac.map((item) => normalizeAirplanesLive(item, generatedAt)).filter(Boolean)
    : [];
  const body = {
    source: "Airplanes.live",
    generatedAt,
    count: aircraft.length,
    aircraft
  };

  lastSecondaryPayload = { cacheKey, body };
  lastSecondaryFetchAt = now;
  return { ...body, cached: false };
}

function demoAircraft() {
  const now = Date.now();
  const seed = Math.floor(now / 10000);
  const bases = [
    ["demo001", "IGO621", "India", 21.15, 76.10, 10600, 232, 238],
    ["demo002", "AIC411", "India", 24.10, 80.10, 11200, 226, 286],
    ["demo003", "AXB704", "India", 14.50, 76.80, 9200, 210, 42],
    ["demo004", "VTI882", "India", 18.60, 77.90, 10100, 238, 320],
    ["demo005", "SEJ219", "India", 26.50, 84.20, 8600, 190, 251],
    ["demo006", "AKJ518", "India", 20.80, 73.70, 9700, 216, 95]
  ];

  return bases.map(([id, callsign, originCountry, lat, lon, altitude, speed, heading], index) => {
    const drift = (seed % 360) * 0.01745 + index;
    return {
      id,
      callsign,
      originCountry,
      lastContact: Math.floor(now / 1000),
      timePosition: Math.floor(now / 1000),
      latitude: lat + Math.sin(drift) * 1.25,
      longitude: lon + Math.cos(drift) * 1.75,
      altitudeMeters: altitude,
      baroAltitudeMeters: altitude - 120,
      onGround: false,
      velocityMetersPerSecond: speed,
      headingDegrees: (heading + seed * 3) % 360,
      verticalRateMetersPerSecond: Math.sin(drift) * 3,
      squawk: null,
      spi: false,
      positionSource: 0,
      category: 0
    };
  });
}

async function handleAircraft(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  try {
    const payload = await fetchOpenSky(requestUrl.searchParams);
    sendJson(res, 200, payload);
  } catch (error) {
    try {
      const payload = await fetchAirplanesLive(requestUrl.searchParams);
      sendJson(res, 200, { ...payload, warning: error.message });
    } catch (secondaryError) {
      sendJson(res, 200, {
        source: "Demo fallback",
        generatedAt: Date.now(),
        count: demoAircraft().length,
        aircraft: demoAircraft(),
        warning: `${error.message}; ${secondaryError.message}`
      });
    }
  }
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : decodeURIComponent(requestUrl.pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const contents = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(contents);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/api/aircraft")) {
    handleAircraft(req, res);
    return;
  }

  serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`Aircraft tracker running at http://localhost:${port}`);
});
