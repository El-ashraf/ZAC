import { NextRequest, NextResponse } from 'next/server';

const CATEGORY_MAP: Record<string, string> = {
  Mammalia: 'Mammal', Aves: 'Bird', Reptilia: 'Reptile', Amphibia: 'Amphibian',
  Actinopterygii: 'Fish', Insecta: 'Invertebrate', Arachnida: 'Invertebrate', Mollusca: 'Invertebrate',
  Animalia: 'Animal', Chromista: 'Marine Animal',
};

const NON_ANIMAL = new Set(['Plantae', 'Fungi', 'Protozoa']);
function isAnimal(t: any): boolean {
  return !NON_ANIMAL.has(t.iconic_taxon_name);
}

// Expanded pool of confirmed extinct species with iNaturalist taxon IDs
const EXTINCT_TAXA_IDS = [
  4849,   // Dodo
  68934,  // Thylacine / Tasmanian Tiger
  43688,  // Woolly Mammoth
  81680,  // Passenger Pigeon
  4850,   // Great Auk
  67595,  // Quagga
  66246,  // Steller's Sea Cow
  81682,  // Labrador Duck
  83384,  // Saber-toothed Cat
  81686,  // Carolina Parakeet
  43689,  // Woolly Rhinoceros
  69232,  // Golden Toad
  81685,  // Ivory-billed Woodpecker
  62209,  // Pyrenean Ibex
  75725,  // West African Black Rhino
  81683,  // Heath Hen
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
  // Distinct seed from other routes
  return (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) ^ 0xcafebabe;
}

function toAnimal(t: any) {
  return {
    _id: `inat_extinct_${t.id}`,
    name: t.preferred_common_name || t.name,
    scientificName: t.name,
    conservationStatus: 'Extinct',
    images: [t.default_photo?.medium_url || t.default_photo?.url || ''],
    habitat: '',
    description: t.wikipedia_summary || `${t.preferred_common_name || t.name} is an extinct species documented by iNaturalist and the scientific community.`,
    category: CATEGORY_MAP[t.iconic_taxon_name] || 'Animal',
    isDeepSea: false,
    isExtinct: true,
    observationsCount: t.observations_count,
    wikipediaUrl: t.wikipedia_url,
    source: 'iNaturalist',
  };
}

/** GET /api/inat/extinct?limit=12 */
export async function GET(request: NextRequest) {
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') || '12'), EXTINCT_TAXA_IDS.length);

  // Shuffle daily so different extinct species surface each day
  const shuffled = dailyShuffle(EXTINCT_TAXA_IDS, getDaySeed());
  const taxaToFetch = shuffled.slice(0, limit);

  try {
    const results = await Promise.all(
      taxaToFetch.map((id) =>
        fetch(`https://api.inaturalist.org/v1/taxa/${id}`, { next: { revalidate: 3600 } })
          .then((r) => r.json())
          .then((d) => d.results?.[0] || null)
          .catch(() => null)
      )
    );
    return NextResponse.json(results.filter(Boolean).filter(isAnimal).map(toAnimal));
  } catch (error) {
    console.error('[API /inat/extinct]', error);
    return NextResponse.json([], { status: 200 });
  }
}
