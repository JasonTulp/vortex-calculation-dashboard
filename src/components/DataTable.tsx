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
          className="px-4 py-2 rounded bg-mid-light text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {getPageNumbers().map((pageNumber, index) => (
          <button
            key={index}
            onClick={() => typeof pageNumber === 'number' && onPageChange(pageNumber)}
            className={`px-4 py-2 rounded ${
              pageNumber === page
                ? 'bg-primary text-white'
                : pageNumber === '...'
                ? 'bg-mid-light text-gray-300 cursor-default'
                : 'bg-mid-light text-gray-300 hover:bg-light'
            }`}
            disabled={pageNumber === '...'}
          >
            {pageNumber}
          </button>
        ))}
        
        <button
          onClick={() => page < pages && onPageChange(page + 1)}
          disabled={page === pages}
          className="px-4 py-2 rounded bg-mid-light text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

interface ColumnDefinition {
  key: string;
  label: string;
  subColumns?: ColumnDefinition[];
}

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

const CUSTOM_FIELD_ORDER = [
  "account",
  "nominator",
  "validator",
  "vtxDistributionId",
  "startBlock",
  "endBlock",
  "effectiveBlocks",
  "startEraIndex",
  "endEraIndex",
  "currentEraIndex",
  "balance",
  "balanceChange",
  "effectiveBalance",
  "rewardPoints",
  "percentage",
  "rate",
  "totalStake",
  "totalRewardPoints",
  "submitted",
  "verified",
];

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const generateColumnDefinitions = (data: Record<string, unknown>): ColumnDefinition[] => {
  const unsortedColumns = Object.entries(data).filter(([key]) => 
    key !== '_id' && key !== 'createdAt' && key !== 'updatedAt'
  ).map(([key, value]): ColumnDefinition => {
    if (isObject(value)) {
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        subColumns: Object.keys(value).map(subKey => ({
          key: `${key}.${subKey}`,
          label: subKey.charAt(0).toUpperCase() + subKey.slice(1).replace(/([A-Z])/g, ' $1').trim()
        }))
      };
    }
    return {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1)
    };
  });

  return [...unsortedColumns].sort((a, b) => {
    const indexA = CUSTOM_FIELD_ORDER.findIndex(field => 
      field.toLowerCase() === a.key.toLowerCase());
    const indexB = CUSTOM_FIELD_ORDER.findIndex(field => 
      field.toLowerCase() === b.key.toLowerCase());
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return 0;
  });
};

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce((acc: any, part) => acc && acc[part], obj);
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    if (isObject(value)) {
      return ''; // Don't format nested objects as they'll be handled by sub-columns
    }
    return JSON.stringify(value);
  }
  return String(value);
};

export default function DataTable<T extends BaseModel>({
  data,
  pagination,
  onPageChange,
  isLoading = false,
}: DataTableProps<T>) {
  if (data.length === 0 && !isLoading) {
    return <div className="text-center p-8 bg-mid-light rounded-lg text-gray-300">No data found</div>;
  }

  const columns = data.length > 0 ? generateColumnDefinitions(data[0] as Record<string, unknown>) : [];

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-custom py-2">
            <table className="min-w-full divide-y divide-mid-light">
              <thead className="bg-mid-light">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      colSpan={column.subColumns?.length || 1}
                      scope="col"
                      className="px-2 pt-4 pb-2 text-center text-xs font-bold text-gray-100 uppercase tracking-wider border-x border-light"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  {columns.map((column) => 
                    column.subColumns ? (
                      column.subColumns.map((subColumn) => (
                        <th
                          key={subColumn.key}
                          scope="col"
                          className="px-2 py-2 text-left text-xs font-medium text-gray-300 tracking-wider border-x border-light"
                        >
                          {subColumn.label}
                        </th>
                      ))
                    ) : (
                      <th key={`${column.key}-spacer`} className="border-x border-light"></th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-mid divide-y divide-mid-light">
                {data.map((item, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-mid-light">
                    {columns.map((column) => 
                      column.subColumns ? (
                        column.subColumns.map((subColumn) => (
                          <td key={subColumn.key} className="px-2 py-3 whitespace-nowrap text-sm text-gray-300 border-x border-light">
                            {formatValue(getNestedValue(item as Record<string, unknown>, subColumn.key))}
                          </td>
                        ))
                      ) : (
                        <td key={column.key} className="px-2 py-3 whitespace-nowrap text-sm text-gray-300 border-x border-light">
                          {formatValue((item as Record<string, unknown>)[column.key])}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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