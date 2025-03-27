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
    
    // Add account filter if provided
    if (accountId) {
      query.account = accountId;
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
      .sort({ _id: -1 })
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