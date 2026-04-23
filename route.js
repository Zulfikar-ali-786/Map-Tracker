import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { waypoints } = body;

    if (!waypoints || waypoints.length < 2) {
      return NextResponse.json(
        { error: "At least 2 waypoints are required" },
        { status: 400 }
      );
    }

    // Build the OSRM coordinates string (lon,lat format)
    const coordinates = waypoints
      .map((wp) => `${wp.lon},${wp.lat}`)
      .join(";");

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=true`;

    const response = await fetch(osrmUrl, {
      headers: {
        "User-Agent": "EcoRouteFinder/1.0 (academic-project)",
      },
    });

    if (!response.ok) {
      throw new Error(`OSRM API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: "No route found between the specified locations" },
        { status: 404 }
      );
    }

    const route = data.routes[0];
    const distanceKm = route.distance / 1000;
    const durationMinutes = route.duration / 60;

    // CO2 estimation: average car emits ~120g CO2/km (EU average)
    const co2Grams = distanceKm * 120;
    const co2Kg = co2Grams / 1000;

    // Trees needed to offset (1 tree absorbs ~22kg CO2/year)
    const treesNeeded = Math.ceil(co2Kg / 22);

    // Alternative transport comparisons
    const busCo2 = distanceKm * 68; // 68g CO2/km for bus
    const trainCo2 = distanceKm * 41; // 41g CO2/km for train
    const cycleCo2 = 0; // Zero emissions for cycling

    // Route geometry in [lat, lng] for Leaflet
    const routeCoordinates = route.geometry.coordinates.map(
      (coord) => [coord[1], coord[0]]
    );

    return NextResponse.json({
      distance: Math.round(distanceKm * 100) / 100,
      duration: Math.round(durationMinutes * 100) / 100,
      coordinates: routeCoordinates,
      emissions: {
        car: Math.round(co2Grams) / 1000,
        bus: Math.round(busCo2) / 1000,
        train: Math.round(trainCo2) / 1000,
        cycle: cycleCo2,
        treesNeeded,
      },
      waypoints: data.waypoints.map((wp) => ({
        name: wp.name,
        location: [wp.location[1], wp.location[0]],
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate route" },
      { status: 500 }
    );
  }
}
