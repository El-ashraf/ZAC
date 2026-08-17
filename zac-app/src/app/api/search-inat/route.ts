import { NextRequest, NextResponse } from 'next/server';

/**
 * Searches iNaturalist for any animal by name.
 * Returns taxa (species) with photos, common names, and conservation status.
 * Used as a fallback when the local DB has no matching animals.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '12'), 20);

  if (!q.trim()) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  try {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&rank=species,subspecies&limit=${limit}&photos=true&iconic_taxa=Mammalia,Aves,Reptilia,Amphibia,Actinopterygii,Arachnida,Insecta,Mollusca,Animalia`;

    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`iNaturalist API error ${res.status}`);

    const data = await res.json();

    const results = data.results
      .filter((t: any) => t.default_photo)
      .map((t: any) => ({
        _id: `inat_${t.id}`,
        name: t.preferred_common_name || t.name,
        scientificName: t.name,
        conservationStatus: mapIucnStatus(t.conservation_status?.status_name),
        iucnStatus: t.conservation_status?.status_name || null,
        iucnAuthority: t.conservation_status?.authority || null,
        images: [t.default_photo.medium_url || t.default_photo.url],
        habitat: t.habitat || '',
        description: t.wikipedia_summary || '',
        category: mapIconicTaxon(t.iconic_taxon_name),
        isDeepSea: false,
        isExtinct: t.extinct || false,
        observationsCount: t.observations_count,
        wikipediaUrl: t.wikipedia_url,
        source: 'iNaturalist',
      }));

    return NextResponse.json({ results, total: data.total_results });
  } catch (error) {
    console.error('[API /search-inat]', error);
    return NextResponse.json({ results: [], total: 0 }, { status: 200 });
  }
}

function mapIucnStatus(status?: string): string {
  const map: Record<string, string> = {
    cr: 'Critically Endangered',
    en: 'Endangered',
    vu: 'Vulnerable',
    nt: 'Near Threatened',
    lc: 'Least Concern',
    ex: 'Extinct',
    ew: 'Extinct in the Wild',
    dd: 'Data Deficient',
    ne: 'Not Evaluated',
  };
  return status ? (map[status.toLowerCase()] || 'Not Evaluated') : 'Not Evaluated';
}

function mapIconicTaxon(iconic?: string): string {
  const map: Record<string, string> = {
    Mammalia: 'Mammal',
    Aves: 'Bird',
    Reptilia: 'Reptile',
    Amphibia: 'Amphibian',
    Actinopterygii: 'Fish',
    Insecta: 'Invertebrate',
    Arachnida: 'Invertebrate',
    Mollusca: 'Invertebrate',
    Animalia: 'Other',
  };
  return iconic ? (map[iconic] || iconic) : 'Other';
}
