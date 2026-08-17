import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Animal from '@/models/Animal';

/**
 * Returns the "Animal of the Week" based on the current ISO week number.
 * The animal rotates automatically every Monday without any manual intervention.
 * All non-extinct animals are eligible for rotation.
 */
export async function GET() {
  try {
    await dbConnect();

    // Get ISO week number (changes every Monday)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // Get all non-extinct animals as candidates
    const candidates = await Animal.find({ isExtinct: false }).sort({ name: 1 });

    if (candidates.length === 0) {
      return NextResponse.json(null, { status: 200 });
    }

    // Pick deterministically based on week number
    const index = weekNumber % candidates.length;
    const animal = candidates[index];

    // Also get iNaturalist observation count for this animal
    let observationCount = null;
    try {
      const inatRes = await fetch(
        `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(animal.scientificName)}&per_page=1&only_id=true`,
        { next: { revalidate: 3600 } }
      );
      if (inatRes.ok) {
        const inatData = await inatRes.json();
        observationCount = inatData.total_results;
      }
    } catch {
      // iNaturalist is optional — don't fail the whole request
    }

    return NextResponse.json({ animal, observationCount, weekNumber }, { status: 200 });
  } catch (error) {
    console.error('[API /animal-of-week]', error);
    return NextResponse.json({ error: 'Failed to fetch animal of the week' }, { status: 500 });
  }
}
