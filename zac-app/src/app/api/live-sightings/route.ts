import { NextRequest, NextResponse } from 'next/server';

/**
 * Live wildlife sightings proxy from iNaturalist.
 * Returns recent real-world observations for a given species scientific name.
 * iNaturalist data is updated in real-time by 900,000+ naturalists worldwide.
 */
export async function GET(request: NextRequest) {
  const taxonName = request.nextUrl.searchParams.get('taxon') || '';
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '5'), 10);

  try {
    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(taxonName)}&order=desc&order_by=observed_on&per_page=${limit}&quality_grade=research&photos=true`;

    const res = await fetch(url, { next: { revalidate: 1800 } }); // cache 30 minutes
    if (!res.ok) throw new Error(`iNaturalist returned ${res.status}`);

    const data = await res.json();

    const sightings = data.results.map((obs: any) => ({
      id: obs.id,
      observedOn: obs.observed_on,
      place: obs.place_guess || 'Unknown location',
      userName: obs.user?.login || 'Anonymous',
      photoUrl: obs.photos?.[0]?.url?.replace('square', 'medium') || null,
      quality: obs.quality_grade,
      uri: obs.uri,
    }));

    return NextResponse.json({
      totalResults: data.total_results,
      sightings,
    });
  } catch (error) {
    console.error('[API /live-sightings]', error);
    return NextResponse.json({ totalResults: 0, sightings: [] }, { status: 200 });
  }
}
