let map = null;
const elements = {
  frontTab: document.querySelector("#frontTab"),
  dashboardTab: document.querySelector("#dashboardTab"),
  frontPage: document.querySelector("#frontPage"),
  dashboardView: document.querySelector("#dashboardView"),
  openDashboardButton: document.querySelector("#openDashboardButton"),
  frontRefreshButton: document.querySelector("#frontRefreshButton"),
  frontSource: document.querySelector("#frontSource"),
  frontAircraft: document.querySelector("#frontAircraft"),
  frontDrawn: document.querySelector("#frontDrawn"),
  statusDot: document.querySelector("#statusDot"),
  sourceLabel: document.querySelector("#sourceLabel"),
  refreshButton: document.querySelector("#refreshButton"),
  fitButton: document.querySelector("#fitButton"),
  trailButton: document.querySelector("#trailButton"),
  themeButton: document.querySelector("#themeButton"),
  zoomInButton: document.querySelector("#zoomInButton"),
  zoomOutButton: document.querySelector("#zoomOutButton"),
  searchInput: document.querySelector("#searchInput"),
  aircraftCount: document.querySelector("#aircraftCount"),
  movingCount: document.querySelector("#movingCount"),
  avgAltitude: document.querySelector("#avgAltitude"),
  drawnCount: document.querySelector("#drawnCount"),
  updatedAt: document.querySelector("#updatedAt"),
  flightList: document.querySelector("#flightList"),
  radarCanvas: document.querySelector("#radarCanvas"),
  selectedCallsign: document.querySelector("#selectedCallsign"),
  selectedStatus: document.querySelector("#selectedStatus"),
  closeDetails: document.querySelector("#closeDetails"),
  missionTitle: document.querySelector("#missionTitle"),
  coordinateLine: document.querySelector("#coordinateLine"),
  fromCode: document.querySelector("#fromCode"),
  fromName: document.querySelector("#fromName"),
  observedTime: document.querySelector("#observedTime"),
  toCode: document.querySelector("#toCode"),
  toName: document.querySelector("#toName"),
  headingValue: document.querySelector("#headingValue"),
  routeTimer: document.querySelector("#routeTimer"),
  originCity: document.querySelector("#originCity"),
  originDate: document.querySelector("#originDate"),
  destCity: document.querySelector("#destCity"),
  destDate: document.querySelector("#destDate"),
  airportCount: document.querySelector("#airportCount"),
  airportList: document.querySelector("#airportList")
};

const ctx = elements.radarCanvas.getContext("2d");
const INDIA_BOUNDS = {
  south: 6.0,
  west: 68.0,
  north: 36.5,
  east: 98.5
};
const INDIA_CENTER = [22.8, 79.5];
const INDIA_OUTLINE = [
  [35.6, 74.2], [34.3, 78.4], [32.3, 79.0], [30.4, 81.3], [29.0, 80.2],
  [27.2, 88.2], [26.0, 89.8], [27.8, 94.2], [26.2, 97.3], [24.2, 94.7],
  [22.0, 92.6], [22.2, 88.5], [21.3, 87.0], [19.0, 84.8], [17.7, 82.4],
  [15.8, 80.2], [13.1, 80.3], [10.0, 78.3], [8.1, 77.5], [9.9, 76.2],
  [12.6, 74.8], [15.0, 73.8], [18.8, 72.7], [21.8, 69.0], [23.8, 68.3],
  [25.7, 70.2], [27.8, 70.6], [29.8, 73.2], [32.0, 74.1], [35.6, 74.2]
];
const MAP_LABELS = [
  { text: "INDIA", lat: 22.8, lon: 79.5, size: 30, color: "rgba(255,255,255,0.13)" },
  { text: "Pakistan", lat: 29.5, lon: 69.5, size: 13, color: "rgba(255,255,255,0.12)" },
  { text: "Nepal", lat: 28.2, lon: 84.0, size: 13, color: "rgba(255,255,255,0.12)" },
  { text: "Bangladesh", lat: 23.8, lon: 90.2, size: 13, color: "rgba(255,255,255,0.12)" },
  { text: "Arabian Sea", lat: 15.2, lon: 67.2, size: 15, color: "rgba(255,255,255,0.10)" },
  { text: "Bay of Bengal", lat: 15.0, lon: 88.8, size: 15, color: "rgba(255,255,255,0.10)" }
];
const INDIA_AIRPORTS = [
  { code: "DEL", iata: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", state: "Delhi", lat: 28.5562, lon: 77.1000 },
  { code: "BOM", iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", state: "Maharashtra", lat: 19.0896, lon: 72.8656 },
  { code: "BLR", iata: "BLR", name: "Kempegowda International Airport", city: "Bengaluru", state: "Karnataka", lat: 13.1986, lon: 77.7066 },
  { code: "MAA", iata: "MAA", name: "Chennai International Airport", city: "Chennai", state: "Tamil Nadu", lat: 12.9941, lon: 80.1709 },
  { code: "HYD", iata: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad", state: "Telangana", lat: 17.2403, lon: 78.4294 },
  { code: "CCU", iata: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", state: "West Bengal", lat: 22.6547, lon: 88.4467 },
  { code: "COK", iata: "COK", name: "Cochin International Airport", city: "Kochi", state: "Kerala", lat: 10.1520, lon: 76.4019 },
  { code: "AMD", iata: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad", state: "Gujarat", lat: 23.0772, lon: 72.6347 },
  { code: "PNQ", iata: "PNQ", name: "Pune Airport", city: "Pune", state: "Maharashtra", lat: 18.5821, lon: 73.9197 },
  { code: "GOX", iata: "GOX", name: "Manohar International Airport", city: "Mopa", state: "Goa", lat: 15.7443, lon: 73.8606 },
  { code: "GOI", iata: "GOI", name: "Dabolim Airport", city: "Vasco da Gama", state: "Goa", lat: 15.3808, lon: 73.8314 },
  { code: "JAI", iata: "JAI", name: "Jaipur International Airport", city: "Jaipur", state: "Rajasthan", lat: 26.8242, lon: 75.8122 },
  { code: "LKO", iata: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow", state: "Uttar Pradesh", lat: 26.7606, lon: 80.8893 },
  { code: "GAU", iata: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati", state: "Assam", lat: 26.1061, lon: 91.5859 },
  { code: "TRV", iata: "TRV", name: "Thiruvananthapuram International Airport", city: "Thiruvananthapuram", state: "Kerala", lat: 8.4821, lon: 76.9201 },
  { code: "BBI", iata: "BBI", name: "Biju Patnaik International Airport", city: "Bhubaneswar", state: "Odisha", lat: 20.2444, lon: 85.8178 },
  { code: "IXC", iata: "IXC", name: "Shaheed Bhagat Singh International Airport", city: "Chandigarh", state: "Chandigarh", lat: 30.6735, lon: 76.7885 },
  { code: "IXR", iata: "IXR", name: "Birsa Munda Airport", city: "Ranchi", state: "Jharkhand", lat: 23.3143, lon: 85.3217 },
  { code: "PAT", iata: "PAT", name: "Jay Prakash Narayan Airport", city: "Patna", state: "Bihar", lat: 25.5913, lon: 85.0870 },
  { code: "IDR", iata: "IDR", name: "Devi Ahilya Bai Holkar Airport", city: "Indore", state: "Madhya Pradesh", lat: 22.7218, lon: 75.8011 },
  { code: "NAG", iata: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur", state: "Maharashtra", lat: 21.0922, lon: 79.0472 },
  { code: "VNS", iata: "VNS", name: "Lal Bahadur Shastri Airport", city: "Varanasi", state: "Uttar Pradesh", lat: 25.4524, lon: 82.8593 },
  { code: "ATQ", iata: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar", state: "Punjab", lat: 31.7096, lon: 74.7973 },
  { code: "SXR", iata: "SXR", name: "Srinagar Airport", city: "Srinagar", state: "Jammu and Kashmir", lat: 33.9871, lon: 74.7742 },
  { code: "IXJ", iata: "IXJ", name: "Jammu Airport", city: "Jammu", state: "Jammu and Kashmir", lat: 32.6891, lon: 74.8374 },
  { code: "DED", iata: "DED", name: "Dehradun Airport", city: "Dehradun", state: "Uttarakhand", lat: 30.1897, lon: 78.1803 },
  { code: "RPR", iata: "RPR", name: "Swami Vivekananda Airport", city: "Raipur", state: "Chhattisgarh", lat: 21.1804, lon: 81.7388 },
  { code: "VTZ", iata: "VTZ", name: "Visakhapatnam Airport", city: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.7212, lon: 83.2245 },
  { code: "IXE", iata: "IXE", name: "Mangaluru International Airport", city: "Mangaluru", state: "Karnataka", lat: 12.9613, lon: 74.8901 },
  { code: "CJB", iata: "CJB", name: "Coimbatore International Airport", city: "Coimbatore", state: "Tamil Nadu", lat: 11.0300, lon: 77.0434 },
  { code: "TRZ", iata: "TRZ", name: "Tiruchirappalli International Airport", city: "Tiruchirappalli", state: "Tamil Nadu", lat: 10.7654, lon: 78.7097 },
  { code: "IXM", iata: "IXM", name: "Madurai Airport", city: "Madurai", state: "Tamil Nadu", lat: 9.8345, lon: 78.0934 },
  { code: "VGA", iata: "VGA", name: "Vijayawada Airport", city: "Vijayawada", state: "Andhra Pradesh", lat: 16.5304, lon: 80.7968 },
  { code: "TIR", iata: "TIR", name: "Tirupati Airport", city: "Tirupati", state: "Andhra Pradesh", lat: 13.6325, lon: 79.5433 },
  { code: "IXZ", iata: "IXZ", name: "Veer Savarkar International Airport", city: "Port Blair", state: "Andaman and Nicobar Islands", lat: 11.6412, lon: 92.7297 },
  { code: "IMF", iata: "IMF", name: "Imphal Airport", city: "Imphal", state: "Manipur", lat: 24.7600, lon: 93.8967 },
  { code: "AJL", iata: "AJL", name: "Lengpui Airport", city: "Aizawl", state: "Mizoram", lat: 23.8406, lon: 92.6197 },
  { code: "DMU", iata: "DMU", name: "Dimapur Airport", city: "Dimapur", state: "Nagaland", lat: 25.8839, lon: 93.7711 },
  { code: "SHL", iata: "SHL", name: "Shillong Airport", city: "Shillong", state: "Meghalaya", lat: 25.7036, lon: 91.9787 },
  { code: "IXA", iata: "IXA", name: "Maharaja Bir Bikram Airport", city: "Agartala", state: "Tripura", lat: 23.8869, lon: 91.2404 },
  { code: "DIB", iata: "DIB", name: "Dibrugarh Airport", city: "Dibrugarh", state: "Assam", lat: 27.4839, lon: 95.0169 },
  { code: "JRH", iata: "JRH", name: "Jorhat Airport", city: "Jorhat", state: "Assam", lat: 26.7315, lon: 94.1755 },
  { code: "IXB", iata: "IXB", name: "Bagdogra Airport", city: "Siliguri", state: "West Bengal", lat: 26.6812, lon: 88.3286 },
  { code: "GAY", iata: "GAY", name: "Gaya Airport", city: "Gaya", state: "Bihar", lat: 24.7443, lon: 84.9512 },
  { code: "BDQ", iata: "BDQ", name: "Vadodara Airport", city: "Vadodara", state: "Gujarat", lat: 22.3362, lon: 73.2263 },
  { code: "STV", iata: "STV", name: "Surat Airport", city: "Surat", state: "Gujarat", lat: 21.1141, lon: 72.7418 },
  { code: "RAJ", iata: "RAJ", name: "Rajkot Airport", city: "Rajkot", state: "Gujarat", lat: 22.3092, lon: 70.7795 },
  { code: "JDH", iata: "JDH", name: "Jodhpur Airport", city: "Jodhpur", state: "Rajasthan", lat: 26.2511, lon: 73.0489 },
  { code: "UDR", iata: "UDR", name: "Maharana Pratap Airport", city: "Udaipur", state: "Rajasthan", lat: 24.6177, lon: 73.8961 },
  { code: "BHO", iata: "BHO", name: "Raja Bhoj Airport", city: "Bhopal", state: "Madhya Pradesh", lat: 23.2875, lon: 77.3374 },
  { code: "JLR", iata: "JLR", name: "Jabalpur Airport", city: "Jabalpur", state: "Madhya Pradesh", lat: 23.1778, lon: 80.0520 },
  { code: "GWL", iata: "GWL", name: "Gwalior Airport", city: "Gwalior", state: "Madhya Pradesh", lat: 26.2933, lon: 78.2278 },
  { code: "IXD", iata: "IXD", name: "Prayagraj Airport", city: "Prayagraj", state: "Uttar Pradesh", lat: 25.4401, lon: 81.7339 },
  { code: "KNU", iata: "KNU", name: "Kanpur Airport", city: "Kanpur", state: "Uttar Pradesh", lat: 26.4414, lon: 80.3649 },
  { code: "GOP", iata: "GOP", name: "Gorakhpur Airport", city: "Gorakhpur", state: "Uttar Pradesh", lat: 26.7397, lon: 83.4497 },
  { code: "AGR", iata: "AGR", name: "Agra Airport", city: "Agra", state: "Uttar Pradesh", lat: 27.1558, lon: 77.9609 },
  { code: "MYQ", iata: "MYQ", name: "Mysuru Airport", city: "Mysuru", state: "Karnataka", lat: 12.2308, lon: 76.6558 },
  { code: "HBX", iata: "HBX", name: "Hubballi Airport", city: "Hubballi", state: "Karnataka", lat: 15.3617, lon: 75.0849 },
  { code: "IXG", iata: "IXG", name: "Belagavi Airport", city: "Belagavi", state: "Karnataka", lat: 15.8593, lon: 74.6183 },
  { code: "CNN", iata: "CNN", name: "Kannur International Airport", city: "Kannur", state: "Kerala", lat: 11.9186, lon: 75.5472 },
  { code: "CCJ", iata: "CCJ", name: "Calicut International Airport", city: "Kozhikode", state: "Kerala", lat: 11.1368, lon: 75.9553 }
];
const INDIAN_DOMESTIC_CALLSIGNS = [
  "IGO", "AIC", "AXB", "VTI", "SEJ", "AKJ", "GOW", "LLR", "SVD", "TRJ", "FHY", "BDA", "QO"
];

const state = {
  aircraft: [],
  selectedId: null,
  search: "",
  trailsEnabled: true,
  trailHistory: new Map(),
  renderCache: [],
  refreshTimer: null,
  renderLimit: 900,
  activeView: "front",
  mapReady: false
};

function initMap() {
  if (map) return;

  map = L.map("map", {
    zoomControl: false,
    attributionControl: false,
    maxBounds: [[INDIA_BOUNDS.south - 2, INDIA_BOUNDS.west - 2], [INDIA_BOUNDS.north + 2, INDIA_BOUNDS.east + 2]],
    maxBoundsViscosity: 0.9,
    minZoom: 4,
    worldCopyJump: false,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false
  }).setView(INDIA_CENTER, 5);

  L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri'
  }
).addTo(map);

  map.on("move", () => drawRadar());
  map.on("zoom", () => drawRadar());
  map.on("tileload", () => drawRadar());
  map.on("load", () => drawRadar());
  map.on("moveend", debounce(() => {
    drawRadar();
    loadAircraft();
  }, 650));
}

function metersToFeet(value) {
  return Number.isFinite(value) ? Math.round(value * 3.28084) : null;
}

function metersPerSecondToKnots(value) {
  return Number.isFinite(value) ? Math.round(value * 1.94384) : null;
}

function formatAltitude(meters) {
  const feet = metersToFeet(meters);
  return feet === null ? "--" : `${feet.toLocaleString()} ft`;
}

function formatSpeed(value) {
  const knots = metersPerSecondToKnots(value);
  return knots === null ? "--" : `${knots.toLocaleString()} kt`;
}

function formatTime(timestamp) {
  if (!timestamp) return "--";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(timestamp));
}

function visibleAircraft() {
  const query = state.search.toLowerCase();
  return domesticAircraft()
    .filter((aircraft) => {
      if (!query) return true;
      const route = domesticRouteFor(aircraft);
      return `${aircraft.callsign} ${aircraft.id} ${aircraft.originCountry} ${route?.origin.code || ""} ${route?.destination.code || ""}`.toLowerCase().includes(query);
    })
    .sort((a, b) => (Number(b.velocityMetersPerSecond) || 0) - (Number(a.velocityMetersPerSecond) || 0))
    .slice(0, state.renderLimit);
}

function domesticAircraft() {
  return state.aircraft
    .filter(isInIndia)
    .filter(isLikelyDomesticIndiaFlight)
    .filter((aircraft) => domesticRouteFor(aircraft));
}

function buildApiUrl() {
  const url = new URL("/api/aircraft", window.location.origin);
  url.searchParams.set("lamin", INDIA_BOUNDS.south.toFixed(4));
  url.searchParams.set("lomin", INDIA_BOUNDS.west.toFixed(4));
  url.searchParams.set("lamax", INDIA_BOUNDS.north.toFixed(4));
  url.searchParams.set("lomax", INDIA_BOUNDS.east.toFixed(4));
  return url;
}

function isInIndia(aircraft) {
  return aircraft.latitude >= INDIA_BOUNDS.south &&
    aircraft.latitude <= INDIA_BOUNDS.north &&
    aircraft.longitude >= INDIA_BOUNDS.west &&
    aircraft.longitude <= INDIA_BOUNDS.east;
}

function isLikelyDomesticIndiaFlight(aircraft) {
  const callsign = String(aircraft.callsign || "").toUpperCase();
  return INDIAN_DOMESTIC_CALLSIGNS.some((prefix) => callsign.startsWith(prefix));
}

function resizeCanvas() {
  const rect = elements.radarCanvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));

  if (elements.radarCanvas.width !== width || elements.radarCanvas.height !== height) {
    elements.radarCanvas.width = width;
    elements.radarCanvas.height = height;
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function projectedLatLng(aircraft, directionOffset, distanceKm) {
  const heading = Number.isFinite(aircraft.headingDegrees) ? aircraft.headingDegrees : 0;
  const radians = (heading + directionOffset) * Math.PI / 180;
  const latDelta = Math.cos(radians) * distanceKm / 111;
  const lonScale = Math.max(0.25, Math.cos(aircraft.latitude * Math.PI / 180));
  const lonDelta = Math.sin(radians) * distanceKm / (111 * lonScale);
  return [aircraft.latitude + latDelta, aircraft.longitude + lonDelta];
}

function distanceKmBetween(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDegrees(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const lambda1 = lon1 * Math.PI / 180;
  const lambda2 = lon2 * Math.PI / 180;
  const y = Math.sin(lambda2 - lambda1) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(lambda2 - lambda1);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function angleDifference(a, b) {
  return Math.abs(((a - b + 540) % 360) - 180);
}

function routeCandidateScore(aircraft, airport, targetHeading) {
  const distance = distanceKmBetween(aircraft.latitude, aircraft.longitude, airport.lat, airport.lon);
  if (distance < 35 || distance > 1800) return Number.POSITIVE_INFINITY;
  const bearing = bearingDegrees(aircraft.latitude, aircraft.longitude, airport.lat, airport.lon);
  const angle = angleDifference(bearing, targetHeading);
  if (angle > 82) return Number.POSITIVE_INFINITY;
  return angle * 6 + distance * 0.22;
}

function bestAirportForHeading(aircraft, targetHeading) {
  return INDIA_AIRPORTS
    .map((airport) => ({ airport, score: routeCandidateScore(aircraft, airport, targetHeading) }))
    .filter((item) => Number.isFinite(item.score))
    .sort((a, b) => a.score - b.score)[0]?.airport || null;
}

function domesticRouteFor(aircraft) {
  if (!aircraft || !isInIndia(aircraft) || !Number.isFinite(aircraft.headingDegrees)) return null;

  const destination = bestAirportForHeading(aircraft, aircraft.headingDegrees);
  const origin = bestAirportForHeading(aircraft, (aircraft.headingDegrees + 180) % 360);
  if (!origin || !destination || origin.code === destination.code) return null;

  return {
    origin,
    current: [aircraft.latitude, aircraft.longitude],
    destination
  };
}

function projectedTrail(aircraft) {
  const point = [aircraft.latitude, aircraft.longitude];
  const previous = state.trailHistory.get(aircraft.id) || [];
  const next = [...previous, point].slice(-26);
  state.trailHistory.set(aircraft.id, next);

  if (next.length > 1) return next;
  const speed = Math.max(80, Number(aircraft.velocityMetersPerSecond) || 160);
  const distanceKm = Math.min(42, speed * 0.12);
  return [projectedLatLng(aircraft, 180, distanceKm), point];
}

function selectedRoutePoints(aircraft) {
  const route = domesticRouteFor(aircraft);
  if (!route) return null;
  return {
    origin: [route.origin.lat, route.origin.lon],
    current: route.current,
    destination: [route.destination.lat, route.destination.lon],
    originAirport: route.origin,
    destinationAirport: route.destination
  };
}

function drawSelectedRoute(aircraft) {
  if (!aircraft || !map) return;

  const route = selectedRoutePoints(aircraft);
  if (!route) return;
  const origin = map.latLngToContainerPoint(route.origin);
  const current = map.latLngToContainerPoint(route.current);
  const destination = map.latLngToContainerPoint(route.destination);
  const inboundControl = routeControlPoint(origin, current, -0.18);
  const outboundControl = routeControlPoint(current, destination, 0.18);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.quadraticCurveTo(inboundControl.x, inboundControl.y, current.x, current.y);
  ctx.quadraticCurveTo(outboundControl.x, outboundControl.y, destination.x, destination.y);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.72)";
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.quadraticCurveTo(inboundControl.x, inboundControl.y, current.x, current.y);
  ctx.quadraticCurveTo(outboundControl.x, outboundControl.y, destination.x, destination.y);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.86)";
  ctx.setLineDash([9, 8]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(current.x, current.y);
  ctx.quadraticCurveTo(outboundControl.x, outboundControl.y, destination.x, destination.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255, 138, 0, 0.9)";
  ctx.setLineDash([12, 8]);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(current.x - 26, current.y);
  ctx.lineTo(current.x + 26, current.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#ff8a00";
  ctx.setLineDash([]);
  ctx.stroke();

  drawRoutePoint(origin, route.originAirport.code);
  drawRoutePoint(destination, route.destinationAirport.code);
  ctx.restore();
}

function routeControlPoint(start, end, bend) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const offset = Math.min(140, Math.max(24, distance * Math.abs(bend)));
  const direction = bend < 0 ? -1 : 1;

  if (!distance) return { x: midX, y: midY };

  return {
    x: midX + (-dy / distance) * offset * direction,
    y: midY + (dx / distance) * offset * direction
  };
}

function drawRoutePoint(point, label) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, 9, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#f6c400";
  ctx.fill();
  ctx.font = "800 10px Inter, Segoe UI, sans-serif";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.strokeText(label, point.x + 12, point.y - 10);
  ctx.fillStyle = "#f5f5f2";
  ctx.fillText(label, point.x + 12, point.y - 10);
}

function drawAircraftShape(point, heading, selected, onGround) {
  const size = selected ? 18 : 12;
  const radians = (heading || 0) * Math.PI / 180;
  const color = onGround ? "#9aa0a3" : selected ? "#ff8a00" : "#f6c400";

  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.rotate(radians);

  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.42, size * 0.26);
  ctx.lineTo(size * 1.35, size * 0.68);
  ctx.lineTo(size * 1.35, size * 1.02);
  ctx.lineTo(size * 0.26, size * 0.78);
  ctx.lineTo(size * 0.2, size * 1.18);
  ctx.lineTo(size * 0.55, size * 1.48);
  ctx.lineTo(size * 0.55, size * 1.75);
  ctx.lineTo(0, size * 1.54);
  ctx.lineTo(-size * 0.55, size * 1.75);
  ctx.lineTo(-size * 0.55, size * 1.48);
  ctx.lineTo(-size * 0.2, size * 1.18);
  ctx.lineTo(-size * 0.26, size * 0.78);
  ctx.lineTo(-size * 1.35, size * 1.02);
  ctx.lineTo(-size * 1.35, size * 0.68);
  ctx.lineTo(-size * 0.42, size * 0.26);
  ctx.closePath();
  ctx.lineWidth = selected ? 4 : 3;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawAirports() {
  if (!map) return;
  ctx.save();
  ctx.font = "800 10px Inter, Segoe UI, sans-serif";
  INDIA_AIRPORTS.forEach((airport) => {
    const point = map.latLngToContainerPoint([airport.lat, airport.lon]);
    const rect = elements.radarCanvas.getBoundingClientRect();
    if (point.x < -20 || point.y < -20 || point.x > rect.width + 20 || point.y > rect.height + 20) return;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = "#42d5a5";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
    ctx.strokeText(airport.code, point.x + 7, point.y - 6);
    ctx.fillStyle = "#dffdf2";
    ctx.fillText(airport.code, point.x + 7, point.y - 6);
  });
  ctx.restore();
}

function drawVectorMap(rect) {
  drawMapBackground(rect);
  drawIndiaShape();
  drawMapLabels();
  drawMajorCityDots();
}

function drawMapBackground(rect) {
  const gradient = ctx.createRadialGradient(
    rect.width * 0.58,
    rect.height * 0.48,
    20,
    rect.width * 0.58,
    rect.height * 0.48,
    Math.max(rect.width, rect.height) * 0.8
  );
  gradient.addColorStop(0, "#252b29");
  gradient.addColorStop(1, "#111515");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, rect.width, rect.height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
  ctx.lineWidth = 1;
  const spacing = 88;
  const offsetX = map ? ((map.getCenter().lng * 7) % spacing) : 0;
  const offsetY = map ? ((map.getCenter().lat * 7) % spacing) : 0;
  for (let x = -spacing + offsetX; x < rect.width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rect.height);
    ctx.stroke();
  }
  for (let y = -spacing + offsetY; y < rect.height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rect.width, y);
    ctx.stroke();
  }
}

function drawIndiaShape() {
  const points = INDIA_OUTLINE.map(([lat, lon]) => map.latLngToContainerPoint([lat, lon]));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = "rgba(90, 99, 94, 0.52)";
  ctx.strokeStyle = "rgba(235, 237, 229, 0.42)";
  ctx.lineWidth = 1.6;
  ctx.fill();
  ctx.stroke();

  ctx.clip();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
  ctx.lineWidth = 1;
  for (let lon = 68; lon <= 98; lon += 3) {
    const a = map.latLngToContainerPoint([6, lon]);
    const b = map.latLngToContainerPoint([36, lon]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (let lat = 8; lat <= 36; lat += 3) {
    const a = map.latLngToContainerPoint([lat, 68]);
    const b = map.latLngToContainerPoint([lat, 98]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMapLabels() {
  ctx.save();
  ctx.textAlign = "center";
  MAP_LABELS.forEach((label) => {
    const point = map.latLngToContainerPoint([label.lat, label.lon]);
    ctx.font = `800 ${label.size}px Inter, Segoe UI, sans-serif`;
    ctx.fillStyle = label.color;
    ctx.fillText(label.text, point.x, point.y);
  });
  ctx.restore();
}

function drawMajorCityDots() {
  const majorAirports = INDIA_AIRPORTS.filter((airport) =>
    ["DEL", "BOM", "BLR", "MAA", "HYD", "CCU", "AMD", "COK", "PNQ", "GAU"].includes(airport.code)
  );
  ctx.save();
  ctx.font = "700 10px Inter, Segoe UI, sans-serif";
  majorAirports.forEach((airport) => {
    const point = map.latLngToContainerPoint([airport.lat, airport.lon]);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.48)";
    ctx.fillText(airport.city, point.x + 7, point.y + 4);
  });
  ctx.restore();
}

function drawRadar(aircraftList = visibleAircraft()) {
  if (!map) {
    elements.drawnCount.textContent = "0 on map";
    elements.frontDrawn.textContent = "0";
    return;
  }

  resizeCanvas();
  const rect = elements.radarCanvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  // drawVectorMap(rect);
  ctx.font = "700 11px Inter, Segoe UI, sans-serif";
  ctx.textBaseline = "middle";

  let drawn = 0;
  const renderCache = [];
  const selectedAircraft = state.aircraft.find((aircraft) => aircraft.id === state.selectedId);
  drawAirports();
  drawSelectedRoute(selectedAircraft);

  aircraftList.forEach((aircraft) => {
    const selected = aircraft.id === state.selectedId;
    const point = map.latLngToContainerPoint([aircraft.latitude, aircraft.longitude]);
    if (point.x < -60 || point.y < -60 || point.x > rect.width + 60 || point.y > rect.height + 60) return;
    drawn += 1;
    renderCache.push({ id: aircraft.id, x: point.x, y: point.y });

    const route = domesticRouteFor(aircraft);
    const trail = route
      ? [[route.origin.lat, route.origin.lon], route.current, [route.destination.lat, route.destination.lon]].map((latLng) => map.latLngToContainerPoint(latLng))
      : projectedTrail(aircraft).map((latLng) => map.latLngToContainerPoint(latLng));
    if (state.trailsEnabled && route && trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      const middle = trail[1];
      const destination = trail[2];
      const inbound = routeControlPoint(trail[0], middle, -0.15);
      const outbound = routeControlPoint(middle, destination, 0.15);
      ctx.quadraticCurveTo(inbound.x, inbound.y, middle.x, middle.y);
      ctx.quadraticCurveTo(outbound.x, outbound.y, destination.x, destination.y);
      ctx.lineWidth = selected ? 5 : 3;
      ctx.strokeStyle = selected ? "rgba(255, 138, 0, 0.9)" : "rgba(255, 255, 255, 0.65)";
      ctx.setLineDash(selected ? [] : [6, 5]);
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawAircraftShape(point, aircraft.headingDegrees, selected, aircraft.onGround);

    if (selected || aircraftList.length < 220) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.strokeText(aircraft.callsign, point.x + 14, point.y - 12);
      ctx.fillStyle = "#f5f5f2";
      ctx.fillText(aircraft.callsign, point.x + 14, point.y - 12);
    }
  });

  state.renderCache = renderCache;
  elements.drawnCount.textContent = `${drawn.toLocaleString()} on map`;
  elements.frontDrawn.textContent = drawn.toLocaleString();
}

function renderTimeline(aircraftList) {
  const rows = aircraftList.slice(0, 24).map((aircraft) => {
    const speed = formatSpeed(aircraft.velocityMetersPerSecond);
    const status = aircraft.onGround ? "ON GROUND" : "IN TRANSIT";
    return `
      <button class="flight-row${aircraft.id === state.selectedId ? " selected" : ""}" type="button" data-id="${aircraft.id}">
        <span class="time-pill">${speed}</span>
        <span>
          <small>${status}</small>
          <strong>${aircraft.callsign}</strong>
          <span>${aircraft.originCountry}</span>
          <span>${formatAltitude(aircraft.altitudeMeters)}</span>
        </span>
      </button>
    `;
  });

  elements.flightList.innerHTML = rows.length
    ? rows.join("")
    : '<div class="timeline-empty">No aircraft in this map area. Zoom out or press R.</div>';
}

function renderAirportDirectory() {
  elements.airportCount.textContent = INDIA_AIRPORTS.length.toLocaleString();
  elements.airportList.innerHTML = INDIA_AIRPORTS
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city))
    .map((airport) => `
      <article class="airport-item">
        <strong>${airport.code}</strong>
        <span>
          ${airport.city}
          <small>${airport.name}, ${airport.state}</small>
        </span>
      </article>
    `)
    .join("");
}

function updateMetrics(payload) {
  const domestic = domesticAircraft();
  const moving = domestic.filter((aircraft) => !aircraft.onGround && Number(aircraft.velocityMetersPerSecond) > 25);
  const altitudes = domestic.map((aircraft) => aircraft.altitudeMeters).filter(Number.isFinite);
  const avgMeters = altitudes.length ? altitudes.reduce((sum, value) => sum + value, 0) / altitudes.length : 0;

  elements.aircraftCount.textContent = `${domestic.length.toLocaleString()} domestic`;
  elements.movingCount.textContent = moving.length.toLocaleString();
  elements.avgAltitude.textContent = formatAltitude(avgMeters);
  elements.updatedAt.textContent = formatTime(payload.generatedAt);
  elements.frontAircraft.textContent = domestic.length.toLocaleString();
  elements.frontSource.textContent = payload.source || "Live feed";
}

function updateSelectedPanel(aircraft) {
  if (!aircraft) {
    elements.selectedCallsign.textContent = "Select flight";
    elements.selectedStatus.textContent = "IN TRANSIT";
    elements.missionTitle.textContent = "Live aircraft position tracking";
    elements.coordinateLine.textContent = "Waiting for selected aircraft";
    elements.fromCode.textContent = "LIVE";
    elements.fromName.textContent = "Current feed";
    elements.observedTime.textContent = "--";
    elements.toCode.textContent = "MAP";
    elements.toName.textContent = "Projected heading";
    elements.headingValue.textContent = "--";
    elements.routeTimer.textContent = "Live vector";
    elements.originCity.textContent = "OpenSky";
    elements.originDate.textContent = "Live ADS-B";
    elements.destCity.textContent = "Tracking Map";
    elements.destDate.textContent = "Refreshes every 20s";
    return;
  }

  const heading = Number.isFinite(aircraft.headingDegrees) ? `${Math.round(aircraft.headingDegrees)} deg` : "--";
  const observed = formatTime(aircraft.lastContact * 1000);
  const status = aircraft.onGround ? "ON GROUND" : "IN TRANSIT";
  const route = selectedRoutePoints(aircraft);

  elements.selectedCallsign.textContent = aircraft.callsign;
  elements.selectedStatus.textContent = status;
  elements.missionTitle.textContent = `Live ${aircraft.originCountry} aircraft`;
  elements.coordinateLine.textContent = `${aircraft.latitude.toFixed(5)} N  ${aircraft.longitude.toFixed(5)} E`;
  elements.fromCode.textContent = route?.originAirport.code || "IND";
  elements.fromName.textContent = route ? `${route.originAirport.city} - ${route.originAirport.name}` : "No domestic airport origin inferred";
  elements.observedTime.textContent = observed;
  elements.toCode.textContent = route?.destinationAirport.code || "IND";
  elements.toName.textContent = route ? `${route.destinationAirport.city} - ${route.destinationAirport.name}` : "No domestic airport destination inferred";
  elements.headingValue.textContent = heading;
  elements.routeTimer.textContent = `${formatSpeed(aircraft.velocityMetersPerSecond)} - ${formatAltitude(aircraft.altitudeMeters)}`;
  elements.originCity.textContent = route ? route.originAirport.city : "India domestic route";
  elements.originDate.textContent = route ? route.originAirport.state : `Last contact ${observed}`;
  elements.destCity.textContent = route ? route.destinationAirport.city : "Route unavailable";
  elements.destDate.textContent = route ? route.destinationAirport.state : `Heading ${heading}`;
}

function selectAircraft(id, shouldPan = true) {
  state.selectedId = id;
  const selected = state.aircraft.find((aircraft) => aircraft.id === id);
  updateSelectedPanel(selected);
  renderAll();
  if (map && selected && shouldPan) {
    map.panTo([selected.latitude, selected.longitude], { animate: true, duration: 0.35 });
  }
}

function renderAll() {
  const aircraftList = visibleAircraft();
  renderTimeline(aircraftList);
  drawRadar(aircraftList);
}

function showView(view) {
  const showingDashboard = view === "dashboard";
  state.activeView = view;

  elements.frontPage.classList.toggle("active", !showingDashboard);
  elements.dashboardView.classList.toggle("active", showingDashboard);
  elements.frontTab.classList.toggle("active", !showingDashboard);
  elements.dashboardTab.classList.toggle("active", showingDashboard);
  elements.frontTab.setAttribute("aria-selected", String(!showingDashboard));
  elements.dashboardTab.setAttribute("aria-selected", String(showingDashboard));

  if (showingDashboard) {
    window.location.hash = "dashboard";
    ensureMapReady();
  } else {
    window.location.hash = "front";
  }
}

function ensureMapReady() {
  initMap();

  requestAnimationFrame(() => {
    map.invalidateSize(true);
    if (!state.mapReady) {
      map.setView([23.5, 78.8], 5, { animate: false });
      state.mapReady = true;
    }
    requestAnimationFrame(() => {
      map.invalidateSize(true);
      drawRadar();
    });
  });
}

async function loadAircraft() {
  elements.statusDot.className = "status-dot";
  elements.sourceLabel.textContent = "Refreshing live feed";

  try {
    const response = await fetch(buildApiUrl());
    const payload = await response.json();
    state.aircraft = (payload.aircraft || []).filter(isInIndia);
    updateMetrics(payload);

    const visible = visibleAircraft();
    if (!state.selectedId || !visible.some((aircraft) => aircraft.id === state.selectedId)) {
      state.selectedId = visible[0]?.id || null;
    }

    const selected = state.aircraft.find((aircraft) => aircraft.id === state.selectedId);
    updateSelectedPanel(selected || null);
    renderAll();

    const fallback = payload.source === "Demo fallback";
    elements.statusDot.className = `status-dot ${fallback ? "error" : "live"}`;
    elements.sourceLabel.textContent = fallback
      ? `Demo fallback - ${payload.warning}`
      : `${payload.source}${payload.cached ? " - cached" : ""}`;
  } catch (error) {
    elements.statusDot.className = "status-dot error";
    elements.sourceLabel.textContent = error.message;
  }
}

function fitAircraft() {
  if (!map) return;
  if (state.activeView !== "dashboard") return;
  const size = map.getSize();
  if (size.x < 320 || size.y < 240) return;
  const points = visibleAircraft().map((aircraft) => [aircraft.latitude, aircraft.longitude]);
  if (!points.length) {
    map.fitBounds([[INDIA_BOUNDS.south, INDIA_BOUNDS.west], [INDIA_BOUNDS.north, INDIA_BOUNDS.east]], {
      padding: [28, 28],
      maxZoom: 5
    });
    return;
  }
  map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [600, 80], paddingBottomRight: [80, 80], maxZoom: 8 });
}

function nearestAircraft(x, y) {
  let best = null;
  let bestDistance = 26;
  state.renderCache.forEach((item) => {
    const distance = Math.hypot(item.x - x, item.y - y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item.id;
    }
  });
  return best;
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

elements.refreshButton.addEventListener("click", loadAircraft);
elements.frontRefreshButton.addEventListener("click", loadAircraft);
elements.openDashboardButton.addEventListener("click", () => showView("dashboard"));
elements.frontTab.addEventListener("click", () => showView("front"));
elements.dashboardTab.addEventListener("click", () => showView("dashboard"));
elements.fitButton.addEventListener("click", fitAircraft);
elements.zoomInButton.addEventListener("click", () => {
  if (map) map.zoomIn();
});
elements.zoomOutButton.addEventListener("click", () => {
  if (map) map.zoomOut();
});
elements.trailButton.addEventListener("click", () => {
  state.trailsEnabled = !state.trailsEnabled;
  elements.trailButton.classList.toggle("active", state.trailsEnabled);
  drawRadar();
});
elements.themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-map");
  ensureMapReady();
});

elements.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderAll();
});

elements.closeDetails.addEventListener("click", () => {
  state.selectedId = null;
  updateSelectedPanel(null);
  renderAll();
});

elements.flightList.addEventListener("click", (event) => {
  const row = event.target.closest("[data-id]");
  if (row) selectAircraft(row.dataset.id);
});

elements.radarCanvas.addEventListener("click", (event) => {
  const rect = elements.radarCanvas.getBoundingClientRect();
  const id = nearestAircraft(event.clientX - rect.left, event.clientY - rect.top);
  if (id) selectAircraft(id, false);
});

window.addEventListener("resize", () => {
  if (state.activeView === "dashboard") ensureMapReady();
});

renderAirportDirectory();
showView(window.location.hash === "#dashboard" ? "dashboard" : "front");
loadAircraft();
state.refreshTimer = setInterval(loadAircraft, 20000);

const resizeHandle = document.getElementById("resizeHandle");
const trackingCard = document.querySelector(".tracking-card");

let isResizing = false;

resizeHandle.addEventListener("mousedown", () => {
    isResizing = true;
});

document.addEventListener("mousemove", (e) => {
    if (!isResizing) return;

    let newWidth = e.clientX - 156;

    newWidth = Math.max(300, Math.min(newWidth, 700));

    trackingCard.style.width = `${newWidth}px`;

    resizeHandle.style.left = `${156 + newWidth}px`;

    localStorage.setItem("panelWidth", newWidth);
});

document.addEventListener("mouseup", () => {
    isResizing = false;
});
