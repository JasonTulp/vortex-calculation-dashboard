'use client';

import { BaseModel } from '@/models';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  pages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ total, page, limit, pages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (pages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Add ellipsis if current page is more than 3
      if (page > 3) {
        pageNumbers.push('...');
      }
      
      // Add pages around current page
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(pages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if current page is less than pages - 2
      if (page < pages - 2) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      if (pages > 1) {
        pageNumbers.push(pages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-300">
        Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} results
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-700 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {getPageNumbers().map((pageNumber, index) => (
          <button
            key={index}
            onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
            className={`px-4 py-2 rounded ${
              pageNumber === page
                ? 'bg-blue-600 text-white'
                : pageNumber === '...'
                ? 'bg-gray-700 text-gray-300 cursor-default'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            disabled={pageNumber === '...'}
          >
            {pageNumber}
          </button>
        ))}
        
        <button
          onClick={() => page < pages && onPageChange(page + 1)}
          disabled={page === pages}
          className="px-4 py-2 rounded bg-gray-700 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

interface DataTableProps<T extends BaseModel> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Custom field order definition
const CUSTOM_FIELD_ORDER = [
  "account",
  "vtxDistributionId",
  "startBlock",
  "endBlock",
  "startEraIndex",
  "endEraIndex",
  "currentEraIndex",
  "balance",
  "balanceChange",
  "effectiveBalance",
  "rewardPoints",
  "percentage",
  "rate",
  "totalStake"
];

export default function DataTable<T extends BaseModel>({
  data,
  pagination,
  onPageChange,
  isLoading = false,
}: DataTableProps<T>) {
  if (data.length === 0 && !isLoading) {
    return <div className="text-center p-8 bg-gray-700 rounded-lg text-gray-300">No data found</div>;
  }

  // Get column names from the first data item, excluding _id and metadata fields
  const unsortedColumns = data.length > 0
    ? Object.keys(data[0]).filter(key => key !== '_id' && key !== 'createdAt' && key !== 'updatedAt')
    : [];
  
  // Sort columns according to custom order
  const columns = [...unsortedColumns].sort((a, b) => {
    const indexA = CUSTOM_FIELD_ORDER.findIndex(field => 
      field.toLowerCase() === a.toLowerCase());
    const indexB = CUSTOM_FIELD_ORDER.findIndex(field => 
      field.toLowerCase() === b.toLowerCase());
    
    // If both fields are in the custom order list
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only a is in the custom order list
    if (indexA !== -1) {
      return -1;
    }
    
    // If only b is in the custom order list
    if (indexB !== -1) {
      return 1;
    }
    
    // If neither field is in the custom order list, maintain original order
    return unsortedColumns.indexOf(a) - unsortedColumns.indexOf(b);
  });

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-2 pt-4 pb-2 text-left text-xs font-bold text-gray-100 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  {columns.map((column) => (
                    <td key={column} className="px-2 py-3 whitespace-nowrap text-sm text-gray-300">
                      {formatValue((item as Record<string, unknown>)[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          <Pagination
            total={pagination.total}
            page={pagination.page}
            limit={pagination.limit}
            pages={pagination.pages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
} 