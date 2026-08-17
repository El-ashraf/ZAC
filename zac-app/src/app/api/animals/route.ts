import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Animal from '@/models/Animal';

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const filter: Record<string, unknown> = {};

    const isDeepSea = searchParams.get('isDeepSea');
    if (isDeepSea !== null) filter.isDeepSea = isDeepSea === 'true';

    const isExtinct = searchParams.get('isExtinct');
    if (isExtinct !== null) filter.isExtinct = isExtinct === 'true';

    const isAnimalOfTheWeek = searchParams.get('isAnimalOfTheWeek');
    if (isAnimalOfTheWeek !== null) filter.isAnimalOfTheWeek = isAnimalOfTheWeek === 'true';

    const conservationStatus = searchParams.get('conservationStatus');
    if (conservationStatus) filter.conservationStatus = conservationStatus;

    const animals = await Animal.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(animals, { status: 200 });
  } catch (error) {
    console.error('[API /animals GET]', error);
    return NextResponse.json({ error: 'Failed to fetch the species catalog.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const animal = await Animal.create(body);
    return NextResponse.json(animal, { status: 201 });
  } catch (error) {
    console.error('[API /animals POST]', error);
    return NextResponse.json({ error: 'Failed to create animal' }, { status: 500 });
  }
}
