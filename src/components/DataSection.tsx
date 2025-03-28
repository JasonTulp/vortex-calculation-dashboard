'use client';

import { useState, useEffect } from 'react';
import { BaseModel } from '@/models';
import DataTable from './DataTable';

interface DataSectionProps {
  title: string;
  collectionName: string;
  accountId?: string;
  databaseName?: string;
  customFilters?: Record<string, unknown>;
  refreshTrigger?: number;
}

export default function DataSection({ 
  title, 
  collectionName, 
  accountId,
  databaseName,
  customFilters = {},
  refreshTrigger = 0
}: DataSectionProps) {
  const [data, setData] = useState<BaseModel[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 25,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        collection: collectionName,
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (accountId) {
        params.append('accountId', accountId);
      }

      // Add database name parameter if provided
      if (databaseName) {
        params.append('database', databaseName);
      }
      
      // Add custom filters if provided
      if (Object.keys(customFilters).length > 0) {
        params.append('customFilters', JSON.stringify(customFilters));
      }
      
      const response = await fetch(`/api/data?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setData([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 25,
        pages: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the stringified customFilters to avoid dependency array issues
  const stringifiedFilters = JSON.stringify(customFilters);

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, accountId, databaseName, stringifiedFilters, refreshTrigger]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  return (
    <div className="bg-gray-800 shadow rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">{title}</h2>
      
      {error ? (
        <div className="p-4 bg-red-900 text-red-100 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <DataTable
          data={data}
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
} 