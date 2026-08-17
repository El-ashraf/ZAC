import { NextRequest, NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string> = {
  Mammalia: 'Mammal', Aves: 'Bird', Reptilia: 'Reptile', Amphibia: 'Amphibian',
  Actinopterygii: 'Fish', Insecta: 'Invertebrate', Arachnida: 'Invertebrate', Mollusca: 'Invertebrate',
  Animalia: 'Animal', Chromista: 'Marine Animal', Elasmobranchii: 'Fish',
};

const NON_ANIMAL = new Set(['Plantae', 'Fungi', 'Protozoa']);
function isAnimal(t: any): boolean {
  return !NON_ANIMAL.has(t.iconic_taxon_name);
}

// Extended pool of deep-sea species — shuffled daily
const DEEP_SEA_QUERIES = [
  'anglerfish', 'vampire squid', 'giant squid', 'viperfish', 'dragonfish',
  'gulper eel', 'barreleye fish', 'bioluminescent jellyfish', 'fangtooth fish',
  'giant isopod', 'dumbo octopus', 'goblin shark', 'frilled shark',
  'sixgill shark', 'coelacanth', 'oarfish', 'sea pig', 'deepsea hatchetfish',
  'bobtail squid', 'blobfish',
];

/** Seeded daily shuffle */
function dailyShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getDaySeed(): number {
  const d = new Date();
  // Slightly different seed from endangered so selections differ
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) ^ 0xdeadbeef;
}

function toAnimal(t: any, index: number) {
  return {
    _id: `inat_deep_${t.id}_${index}`,
    name: t.preferred_common_name || t.name,
    scientificName: t.name,
    conservationStatus: 'Not Evaluated',
    images: [t.default_photo?.medium_url || t.default_photo?.url || ''],
    habitat: 'Deep ocean',
    description: t.wikipedia_summary || `${t.preferred_common_name || t.name} is a remarkable creature adapted to life in the deep ocean.`,
    category: CATEGORY_MAP[t.iconic_taxon_name] || 'Animal',
    isDeepSea: true,
    isExtinct: false,
    observationsCount: t.observations_count,
    wikipediaUrl: t.wikipedia_url,
    source: 'iNaturalist',
  };
}

/** GET /api/inat/deep-sea?limit=9 */
export async function GET(request: NextRequest) {
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '9'), DEEP_SEA_QUERIES.length);

  // Shuffle daily so creatures change every day
  const shuffled = dailyShuffle(DEEP_SEA_QUERIES, getDaySeed());
  const queries = shuffled.slice(0, limit);

  try {
    const results = await Promise.all(
      queries.map((q) =>
        fetch(
          `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&rank=species&photos=true&per_page=3&taxon_id=1`,
          { next: { revalidate: 3600 } }
        ).then((r) => r.json()).then((d) => d.results?.find(isAnimal) ?? null).catch(() => null)
      )
    );

    const animals = results
      .filter(Boolean)
      .map((t, i) => toAnimal(t, i));

    return NextResponse.json(animals);
  } catch (error) {
    console.error('[API /inat/deep-sea]', error);
    return NextResponse.json([], { status: 200 });
  }
}
