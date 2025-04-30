'use client';

import { BaseModel } from '@/models';
import { shouldHideColumn } from '@/config/debug';
import { Pagination } from './Pagination';
import BigNumber from 'bignumber.js';

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
  columnBlacklist?: string[];
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

const generateColumnDefinitions = (data: Record<string, unknown>, columnBlacklist: string[] = []): ColumnDefinition[] => {
  const unsortedColumns = Object.entries(data).filter(([key]) => 
    key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && !shouldHideColumn(key, columnBlacklist)
  ).map(([key, value]): ColumnDefinition => {
    if (isObject(value)) {
      return {
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        subColumns: Object.keys(value)
          .filter(subKey => !shouldHideColumn(`${key}.${subKey}`, columnBlacklist))
          .map(subKey => ({
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
  return path.split('.').reduce<unknown>((acc, part) => (
    acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined
  ), obj);
};

const formatValue = (value: unknown, key: string): string => {
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

  // Special formatting for balance-related fields
  const balanceFields = [
    'balance',
    'effectivebalance',
    'rewardpoints',
    'previousbalance',
    'balancechange',
    'balanceinblockrange',
    'amount',
    'totalstake',
    'price'
  ];

  if (balanceFields.includes(key.toLowerCase())) {
    try {
      if (value.toString() === "0") {
        return "-";
      }
      const val = new BigNumber(value.toString());
      if (!val.isNaN()) {
        return val.div(1000000).toFixed(6);
      }
    } catch (err) {
      console.error(`Error formatting value for ${key}:`, err);
    }
  }

  return String(value);
};

export default function DataTable<T extends BaseModel>({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  columnBlacklist = []
}: DataTableProps<T>) {
  if (data.length === 0 && !isLoading) {
    return <div className="text-center p-8 bg-mid-light rounded-lg text-gray-300">No data found</div>;
  }

  const columns = data.length > 0 ? generateColumnDefinitions(data[0] as Record<string, unknown>, columnBlacklist) : [];

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto scrollbar-custom py-2">
            <table className="min-w-full divide-y divide-mid-light border-light border-b">
              <thead className="bg-mid-light border-t border-light">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      colSpan={column.subColumns?.length || 1}
                      scope="col"
                      className="px-2 pt-4 pb-1 text-center text-xs font-bold text-text uppercase tracking-wider border-x border-light"
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
                          className="px-2 py-2 text-left text-xs font-medium text-gray-300 tracking-wider border-x border-light border-t"
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
                          <td key={subColumn.key} className="px-2 py-2 whitespace-nowrap text-sm text-gray-300 border-x border-light">
                            {formatValue(getNestedValue(item as Record<string, unknown>, subColumn.key), subColumn.key.split('.').pop() || '')}
                          </td>
                        ))
                      ) : (
                        <td key={column.key} className="px-2 py-2 whitespace-nowrap text-sm text-gray-300 border-x border-light">
                          {formatValue((item as Record<string, unknown>)[column.key], column.key)}
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