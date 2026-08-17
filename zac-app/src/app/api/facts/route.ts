import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Fact from '@/models/Fact';

export async function GET() {
  try {
    await dbConnect();
    const facts = await Fact.find().sort({ createdAt: -1 });
    return NextResponse.json(facts, { status: 200 });
  } catch (error) {
    console.error('[API /facts GET]', error);
    return NextResponse.json({ error: 'Failed to fetch facts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const fact = await Fact.create(body);
    return NextResponse.json(fact, { status: 201 });
  } catch (error) {
    console.error('[API /facts POST]', error);
    return NextResponse.json({ error: 'Failed to create fact' }, { status: 500 });
  }
}
