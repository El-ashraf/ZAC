import { NextResponse } from 'next/server';

/**
 * Weekly rotating featured animal — pulls from iNaturalist threatened species.
 * Changes automatically every Monday. No database required.
 */
export async function GET() {
  try {
    // ISO week number — changes every Monday
    const now = new Date();
    const weekNumber = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
    );

    // We rotate through 50 pages of threatened species
    const page = (weekNumber % 50) + 1;

    const taxaRes = await fetch(
      `https://api.inaturalist.org/v1/taxa?threatened=true&rank=species&photos=true&per_page=1&page=${page}&order_by=observations_count&order=desc&taxon_id=1&iconic_taxa[]=Mammalia&iconic_taxa[]=Aves&iconic_taxa[]=Reptilia&iconic_taxa[]=Amphibia&iconic_taxa[]=Actinopterygii&iconic_taxa[]=Insecta&iconic_taxa[]=Arachnida&iconic_taxa[]=Mollusca`,
      { next: { revalidate: 3600 } }
    );
    const taxaData = await taxaRes.json();
    const taxon = taxaData.results?.[0];

    if (!taxon) return NextResponse.json({ animal: null }, { status: 200 });

    // Get live observation count
    let observationCount: number | null = null;
    try {
      const obsRes = await fetch(
        `https://api.inaturalist.org/v1/observations?taxon_id=${taxon.id}&per_page=1&only_id=true`,
        { next: { revalidate: 3600 } }
      );
      const obsData = await obsRes.json();
      observationCount = obsData.total_results ?? null;
    } catch { /* optional */ }

    const animal = {
      _id: `inat_${taxon.id}`,
      name: taxon.preferred_common_name || taxon.name,
      scientificName: taxon.name,
      conservationStatus: mapStatus(taxon.conservation_status?.status_name),
      images: [taxon.default_photo?.medium_url || taxon.default_photo?.url || ''],
      habitat: taxon.habitat || '',
      description: taxon.wikipedia_summary || `${taxon.preferred_common_name || taxon.name} is a threatened species tracked by iNaturalist and the IUCN Red List.`,
      category: mapCategory(taxon.iconic_taxon_name),
      wikipediaUrl: taxon.wikipedia_url,
    };

    return NextResponse.json({ animal, observationCount, weekNumber });
  } catch (error) {
    console.error('[API /inat/featured]', error);
    return NextResponse.json({ animal: null }, { status: 200 });
  }
}

function mapStatus(s?: string) {
  const m: Record<string, string> = { cr: 'Critically Endangered', en: 'Endangered', vu: 'Vulnerable', nt: 'Near Threatened', lc: 'Least Concern', ex: 'Extinct', ew: 'Extinct in the Wild', dd: 'Data Deficient' };
  return s ? (m[s.toLowerCase()] || 'Threatened') : 'Threatened';
}
function mapCategory(s?: string) {
  const m: Record<string, string> = { Mammalia: 'Mammal', Aves: 'Bird', Reptilia: 'Reptile', Amphibia: 'Amphibian', Actinopterygii: 'Fish', Insecta: 'Invertebrate', Arachnida: 'Invertebrate', Mollusca: 'Invertebrate' };
  return s ? (m[s] || s) : 'Animal';
}
