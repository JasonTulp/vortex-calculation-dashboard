import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { RewardCycleModel } from '@/models';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vtxDistributionId = searchParams.get('vtxDistributionId');
    const databaseName = searchParams.get('database');

    if (!vtxDistributionId) {
      return NextResponse.json({ error: 'Reward cycle index is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = databaseName ? client.db(databaseName) : client.db();
    const collection = db.collection('reward-cycle');

    // Find reward cycle by index
    const rewardCycle = await collection.findOne({ 
      vtxDistributionId: parseInt(vtxDistributionId)
    }) as RewardCycleModel | null;

    if (!rewardCycle) {
      return NextResponse.json({ error: 'Reward cycle not found' }, { status: 404 });
    }

    return NextResponse.json({ data: rewardCycle });
  } catch (error) {
    console.error('Error fetching reward cycle:', error);
    return NextResponse.json({ error: 'Failed to fetch reward cycle data' }, { status: 500 });
  }
} 