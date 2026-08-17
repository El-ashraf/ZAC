import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Animal from '@/models/Animal';
import Fact from '@/models/Fact';

// All image URLs are from iNaturalist open-data CDN (s3.amazonaws.com)
// Matched by scientific name — freely hotlinkable, CC-licensed wildlife photos
const animals = [
  {
    name: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    habitat: 'Tropical jungles, marshlands and grasslands of South Asia.',
    diet: 'Carnivore',
    characteristics: 'Orange coat with black stripes, powerful build, large canine teeth.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/43633891/medium.jpg'],
    conservationStatus: 'Endangered',
    description: 'Bengal tigers are the most numerous tiger subspecies but remain endangered due to poaching and habitat loss. Fewer than 2,500 remain in the wild.',
    isAnimalOfTheWeek: true, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'Giant Panda',
    scientificName: 'Ailuropoda melanoleuca',
    habitat: 'Temperate broadleaf and mixed forests of southwest China.',
    diet: 'Herbivore — primarily bamboo',
    characteristics: 'Distinctive black and white coat. Can eat up to 38 kg of bamboo per day.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/150277588/medium.jpg'],
    conservationStatus: 'Vulnerable',
    description: 'Once critically endangered, giant pandas have seen a population increase thanks to conservation efforts. Their bamboo diet makes them highly sensitive to habitat changes.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'African Elephant',
    scientificName: 'Loxodonta africana',
    habitat: 'Savannas, forests, and deserts of sub-Saharan Africa.',
    diet: 'Herbivore — grasses, leaves, bark, fruit.',
    characteristics: 'Largest land animal on earth. Highly intelligent with strong social bonds.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/93674728/medium.jpg'],
    conservationStatus: 'Vulnerable',
    description: 'African elephants are keystone species in their ecosystems. They are threatened by poaching for ivory and ongoing habitat encroachment by human settlements.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    habitat: 'Mountain ranges of Central and South Asia at elevations of 3,000–4,500 m.',
    diet: 'Carnivore — blue sheep, ibex, deer.',
    characteristics: 'Thick pale grey fur with dark rosette spots. Long thick tail used for balance.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/16308659/medium.jpg'],
    conservationStatus: 'Vulnerable',
    description: 'Snow leopards are elusive big cats perfectly adapted to cold rugged mountain terrain. Fewer than 6,400 remain in the wild, threatened by poaching and climate change.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'Javan Rhino',
    scientificName: 'Rhinoceros sondaicus',
    habitat: 'Tropical forests of Ujung Kulon National Park, Java, Indonesia.',
    diet: 'Herbivore — shoots, twigs, young foliage, fallen fruit.',
    characteristics: 'Single small horn up to 25 cm. Grey skin with armour-like folds.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/298835434/medium.jpg'],
    conservationStatus: 'Critically Endangered',
    description: 'The Javan rhinoceros is the rarest large mammal on earth, with only around 75 individuals surviving in one national park. It has been declared extinct everywhere else in its former range.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    habitat: 'Volcanic mountains of Rwanda, Uganda, and the DRC.',
    diet: 'Herbivore — leaves, stems, fruit, bark.',
    characteristics: 'Massive body with broad chest. Silverback males can weigh up to 220 kg.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/109860139/medium.jpg'],
    conservationStatus: 'Endangered',
    description: 'Mountain gorillas live in family groups led by a dominant silverback. Conservation efforts have brought their numbers to around 1,000, but they remain endangered.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Mammal',
  },
  {
    name: 'Leatherback Sea Turtle',
    scientificName: 'Dermochelys coriacea',
    habitat: 'All oceans except the Arctic — nests on tropical beaches.',
    diet: 'Carnivore — primarily jellyfish.',
    characteristics: 'Largest living turtle; rubbery leathery shell; can dive to 1,200 m depth.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/244918310/medium.jpg'],
    conservationStatus: 'Vulnerable',
    description: 'The leatherback is the largest turtle and one of the most wide-ranging reptiles on earth. Threatened by plastic ingestion, bycatch, and egg poaching.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: false, category: 'Reptile',
  },
  {
    name: 'Crystal Jellyfish',
    scientificName: 'Aequorea victoria',
    habitat: 'Pacific Ocean, from surface waters to mesopelagic depths.',
    diet: 'Carnivore — small crustaceans and jellyfish larvae.',
    characteristics: 'Produces green bioluminescence. Source of the Nobel Prize-winning GFP protein.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/144174729/medium.jpg'],
    conservationStatus: 'Least Concern',
    description: 'This jellyfish produces one of the most scientifically important proteins ever discovered. GFP extracted from it revolutionised cell biology and earned a Nobel Prize in 2008.',
    isAnimalOfTheWeek: false, isDeepSea: true, isExtinct: false, category: 'Invertebrate',
  },
  {
    name: 'Giant Pacific Octopus',
    scientificName: 'Enteroctopus dofleini',
    habitat: 'North Pacific Ocean — coastal shallows to 2,000 m depth.',
    diet: 'Carnivore — clams, crabs, fish, shrimp.',
    characteristics: "World's largest octopus (up to 70 kg). Three hearts; blue blood; highly intelligent.",
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/174792488/medium.jpg'],
    conservationStatus: 'Least Concern',
    description: 'The giant Pacific octopus can open jars, recognise individual humans, and solve puzzles. Each arm has its own neural cluster allowing semi-independent movement.',
    isAnimalOfTheWeek: false, isDeepSea: true, isExtinct: false, category: 'Invertebrate',
  },
  {
    name: 'Dodo',
    scientificName: 'Raphus cucullatus',
    habitat: 'Dense forests of the island of Mauritius, Indian Ocean.',
    diet: 'Omnivore — fallen fruit, seeds, bulbs, roots.',
    characteristics: 'Flightless, approximately 1 m tall, large hooked beak, greyish plumage.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/436289560/medium.jpg'],
    conservationStatus: 'Extinct',
    description: 'The dodo was a flightless bird endemic to Mauritius that had no natural predators — making it unafraid of humans. Dutch colonists and introduced predators drove it to extinction within decades of first contact.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: true,
    extinctionYear: '1681',
    extinctionCause: 'Overhunting by humans and introduction of invasive predators (rats, pigs, dogs) by European settlers.',
    category: 'Bird',
  },
  {
    name: 'Thylacine (Tasmanian Tiger)',
    scientificName: 'Thylacinus cynocephalus',
    habitat: 'Open forests, wetlands, and grasslands of Tasmania.',
    diet: 'Carnivore — kangaroos, wallabies, birds.',
    characteristics: 'Dog-like body with 13–19 dark stripes on its lower back. Stiff kangaroo-like tail.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/68881/medium.jpg'],
    conservationStatus: 'Extinct',
    description: 'The largest known carnivorous marsupial of modern times, hunted to extinction under a government bounty scheme. The last individual died in Hobart Zoo on 7 September 1936. De-extinction research is underway.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: true,
    extinctionYear: '1936',
    extinctionCause: 'Government-sponsored bounty hunting, habitat destruction, and disease introduced by Europeans.',
    category: 'Mammal',
  },
  {
    name: 'Woolly Mammoth',
    scientificName: 'Mammuthus primigenius',
    habitat: 'Mammoth steppe — Arctic tundra of Europe, Asia, and North America.',
    diet: 'Herbivore — grasses, sedges, shrubs.',
    characteristics: 'Long curved tusks up to 5 m. Thick woolly fur coat. Up to 3.4 m tall at the shoulder.',
    images: ['https://inaturalist-open-data.s3.amazonaws.com/photos/293741612/medium.jpeg'],
    conservationStatus: 'Extinct',
    description: 'Woolly mammoths roamed the earth with early humans during the last Ice Age. Climate change and human hunting drove them to extinction. Preserved DNA from Siberian permafrost is enabling de-extinction research.',
    isAnimalOfTheWeek: false, isDeepSea: false, isExtinct: true,
    extinctionYear: '4,000 BC (last island population)',
    extinctionCause: 'Rapid climate change that shrank their habitat combined with systematic overhunting by prehistoric humans.',
    category: 'Mammal',
  },
];

const facts = [
  { content: 'A group of flamingos is called a flamboyance.' },
  { content: 'Octopuses have three hearts and blue blood.' },
  { content: 'Sloths can hold their breath longer than dolphins — up to 40 minutes!' },
  { content: 'The mantis shrimp can punch with the force of a bullet — 1,500 Newtons.' },
  { content: 'Butterflies taste food with their feet.' },
  { content: "A tiger's stripes extend to the skin — each pattern is unique like a fingerprint." },
  { content: 'Elephants are the only animals that cannot jump.' },
  { content: 'A group of jellyfish is called a smack.' },
];

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';
    const count = await Animal.countDocuments();

    if (count > 0 && !force) {
      return NextResponse.json({ message: 'Already seeded. Use ?force=true to re-seed.' }, { status: 200 });
    }

    await Animal.deleteMany({});
    await Fact.deleteMany({});
    await Animal.insertMany(animals);
    await Fact.insertMany(facts);

    return NextResponse.json({ message: `Seeded ${animals.length} animals and ${facts.length} facts. Images from iNaturalist.` }, { status: 201 });
  } catch (error) {
    console.error('[API /seed]', error);
    return NextResponse.json({ error: 'Failed to seed database.' }, { status: 500 });
  }
}
