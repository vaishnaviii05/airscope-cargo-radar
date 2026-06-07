# Live Aircraft Tracker

A real-life aircraft tracking dashboard with live ADS-B state data from the OpenSky Network, a 2D OpenStreetMap/Leaflet map, aircraft markers, altitude columns, search, live telemetry, and flight trails.

## Features

- Live aircraft positions via `GET /api/aircraft`, proxied from OpenSky's `GET /states/all` endpoint.
- Global mode or viewport-bounded "Map Area" mode.
- Flight trails retained in the browser across refreshes.
- Rotating aircraft markers based on heading.
- Altitude columns for a light 3D-style sense of height on the 2D map.
- Callsign/ICAO/country search and selected-flight telemetry.
- Demo fallback when the live provider is unavailable or rate-limited.

## Run

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

## OpenSky API Credentials

The app works without credentials when OpenSky allows anonymous calls, but OpenSky recommends OAuth2 client credentials for programmatic access and may rate-limit anonymous requests.

Optional environment variables:

```powershell
$env:OPENSKY_CLIENT_ID="your_client_id"
$env:OPENSKY_CLIENT_SECRET="your_client_secret"
npm start
```

You can also pass an existing bearer token:

```powershell
$env:OPENSKY_TOKEN="your_access_token"
npm start
```

## Project Structure

```text
server.js          Node HTTP server, API proxy, OpenSky auth, demo fallback
public/index.html  App shell
public/styles.css  Dashboard and map styling
public/app.js      Map rendering, live refresh, trails, telemetry
```

## Data Source

Default live provider: [OpenSky Network REST API](https://openskynetwork.github.io/opensky-api/rest.html).

OpenSky provides live aircraft state vectors for research and non-commercial use. These include latitude, longitude, altitude, velocity, heading, origin country, callsign, and timestamp fields. It does not provide full airline schedule data such as route, delay, origin airport, or destination airport for every live aircraft.
