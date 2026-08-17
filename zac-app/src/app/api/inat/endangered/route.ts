import { NextRequest, NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string> = {
  Mammalia: 'Mammal', Aves: 'Bird', Reptilia: 'Reptile', Amphibia: 'Amphibian',
  Actinopterygii: 'Fish', Insecta: 'Invertebrate', Arachnida: 'Invertebrate', Mollusca: 'Invertebrate',
  Animalia: 'Animal', Chromista: 'Marine Animal', Protozoa: 'Animal',
};

// Only these iconic_taxon_name values represent animals
const ANIMAL_TAXA = new Set([
  'Mammalia', 'Aves', 'Reptilia', 'Amphibia', 'Actinopterygii',
  'Insecta', 'Arachnida', 'Mollusca', 'Animalia', 'Chromista',
  'Elasmobranchii', 'Amphibia', 'Actinopterygii',
]);

function isAnimal(t: any): boolean {
  const iconic = t.iconic_taxon_name;
  // Exclude plants and fungi explicitly
  if (['Plantae', 'Fungi', 'Protozoa'].includes(iconic)) return false;
  // Must be a recognised animal group OR have Animalia ancestry
  return ANIMAL_TAXA.has(iconic) || !iconic; // allow undefined (often still animals)
}

const STATUS_MAP: Record<string, string> = {
  cr: 'Critically Endangered', en: 'Endangered', vu: 'Vulnerable',
  nt: 'Near Threatened', lc: 'Least Concern', ex: 'Extinct', dd: 'Data Deficient',
};

// Extended pool of IUCN-threatened species with confirmed iNaturalist taxon IDs
const THREATENED_TAXA_IDS = [
  41962,  // Lion
  41573,  // Bengal Tiger
  77937,  // Giant Panda
  84838,  // Javan Rhinoceros
  67779,  // Mountain Gorilla
  74523,  // African Elephant
  41964,  // Snow Leopard
  42007,  // Cheetah
  41967,  // Amur Leopard
  72388,  // Sumatran Orangutan
  84597,  // Leatherback Sea Turtle
  62215,  // Blue Whale
  82500,  // African Wild Dog
  41985,  // Polar Bear
  66736,  // Hawksbill Sea Turtle
  41974,  // Clouded Leopard
  43415,  // Black Rhino
  41951,  // Siberian Tiger
  72387,  // Borneo Orangutan
  84595,  // Green Sea Turtle
  42068,  // Jaguar
  62213,  // Humpback Whale
  74528,  // Asian Elephant
  84840,  // Indian Rhinoceros
];

/** Seeded pseudo-random shuffle — deterministic per day */
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
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function toAnimal(t: any) {
  const statusKey = t.conservation_status?.status_name?.toLowerCase() || '';
  return {
    _id: `inat_red_${t.id}`,
    name: t.preferred_common_name || t.name,
    scientificName: t.name,
    conservationStatus: STATUS_MAP[statusKey] || 'Threatened',
    images: [t.default_photo?.medium_url || t.default_photo?.url || ''],
    habitat: '',
    description: t.wikipedia_summary || '',
    category: CATEGORY_MAP[t.iconic_taxon_name] || 'Animal',
    isDeepSea: false,
    isExtinct: false,
    observationsCount: t.observations_count,
    wikipediaUrl: t.wikipedia_url,
    source: 'iNaturalist',
  };
}

/** GET /api/inat/endangered?limit=6 */
export async function GET(request: NextRequest) {
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '6'), THREATENED_TAXA_IDS.length);

  // Shuffle daily — different species every day
  const shuffled = dailyShuffle(THREATENED_TAXA_IDS, getDaySeed());
  const taxaToFetch = shuffled.slice(0, limit);

  try {
    const results = await Promise.all(
      taxaToFetch.map((id) =>
        fetch(`https://api.inaturalist.org/v1/taxa/${id}`, {
          next: { revalidate: 3600 }, // revalidate hourly, but seed changes daily
        })
          .then((r) => r.json())
          .then((d) => d.results?.[0] || null)
          .catch(() => null)
      )
    );
    return NextResponse.json(results.filter(Boolean).filter(isAnimal).map(toAnimal));
  } catch (error) {
    console.error('[API /inat/endangered]', error);
    return NextResponse.json([], { status: 200 });
  }
}
