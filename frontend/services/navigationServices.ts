const ORS_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY!;
const ORS_URL = 'https://api.openrouteservice.org/v2/directions/cycling-regular';
 
export interface NavigationResult {
  coordinates: Array<[number, number]>; // [lat, lng]
  distance:    number;    
  duration:    number;    
  instructions: Array<{
    distance:    number;
    duration:    number;
    instruction: string;
    type:        number;
  }>;
}
 
export async function getRoute(
  from: { lat: number; lng: number },
  to:   { lat: number; lng: number }
): Promise<NavigationResult> {
  const body = {
    coordinates: [
      [from.lng, from.lat], // ORS pakai [lng, lat]
      [to.lng,   to.lat],
    ],
    instructions: true,
    language: 'id',
  };
 
  const res = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: ORS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
 
  if (!res.ok) throw new Error('Gagal mengambil rute navigasi.');
 
  const data = await res.json();
  const route = data.routes[0];
 
  const coords: Array<[number, number]> = route.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => [lat, lng] 
  );
 
  const steps = route.segments[0].steps.map((s: unknown) => ({
    distance:    (s as { distance: number }).distance,
    duration:    (s as { duration: number }).duration,
    instruction: (s as { instruction: string }).instruction,
    type:        (s as { type: number }).type,
  }));
 
  return {
    coordinates: coords,
    distance:    Math.round(route.summary.distance / 10) / 100, 
    duration:    Math.round(route.summary.duration / 60),      
    instructions: steps,
  };
}
