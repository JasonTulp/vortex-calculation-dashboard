import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const databaseName = searchParams.get('database');
    const accountId = searchParams.get('accountId');
    const customFiltersStr = searchParams.get('customFilters');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    if (!collectionName) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const client = await clientPromise;
    
    // Use the specified database or fall back to default
    const db = databaseName ? client.db(databaseName) : client.db();
    
    const collection = db.collection(collectionName);

    // Start with basic query
    const query: Record<string, unknown> = {};

    if (process.env.NEXT_PUBLIC_DEBUG_LEVEL != "debug") {
      query.vtxDistributionId = { $gte: 6 };
    }

    // Add account filter if provided
    if (accountId) {
      if (collectionName === 'validator-payouts') {
        // For validator payouts, filter by the validator field
        query.validator = { $regex: new RegExp(`^${accountId}$`, 'i') };
      } else if (collectionName === 'nominator-payouts') {
        // For nominator payouts, filter by the nominator field
        query.nominator = { $regex: new RegExp(`^${accountId}$`, 'i') };
      } else {
        // For all other collections, filter by account field
        query.account = { $regex: new RegExp(`^${accountId}$`, 'i') };
      }
    }
    
    // Parse and add custom filters if provided
    if (customFiltersStr) {
      try {
        const customFilters = JSON.parse(customFiltersStr);
        
        // Process each custom filter
        Object.entries(customFilters).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle operators like $gte, $lte, etc.
            query[key] = value;
          } else {
            // Simple equality filter
            query[key] = value;
          }
        });
      } catch (error) {
        console.error('Error parsing custom filters:', error);
      }
    }
    
    // Count total documents matching the query
    const totalDocs = await collection.countDocuments(query);
    
    // Fetch paginated documents
    const docs = await collection
      .find(query)
      .sort({ vtxDistributionId: -1, startBlock: -1, blockNumber: -1, eraIndex: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      data: docs,
      pagination: {
        total: totalDocs,
        page,
        limit,
        pages: Math.ceil(totalDocs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
} 