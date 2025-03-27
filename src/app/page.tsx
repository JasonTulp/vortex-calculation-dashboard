'use client';

import { useState, useEffect } from 'react';
import DataSection from '@/components/DataSection';
import { RewardCycleModel } from '@/models';

export default function Home() {
  const [databaseName, setDatabaseName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [rewardCycleIndex, setRewardCycleIndex] = useState('');
  const [appliedDatabaseName, setAppliedDatabaseName] = useState('');
  const [appliedAccountId, setAppliedAccountId] = useState('');
  const [appliedRewardCycleIndex, setAppliedRewardCycleIndex] = useState('');
  const [rewardCycleData, setRewardCycleData] = useState<RewardCycleModel | null>(null);
  const [isLoadingRewardCycle, setIsLoadingRewardCycle] = useState(false);
  const [rewardCycleError, setRewardCycleError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedDatabaseName(databaseName);
    setAppliedAccountId(accountId);
    setAppliedRewardCycleIndex(rewardCycleIndex);
  };

  const isValidAccountId = (value: string) => {
    // Allow empty string or valid hex format (0x followed by 40 hex characters)
    return value === '' || /^0x[0-9a-fA-F]{40}$/.test(value);
  };

  const isValidRewardCycleIndex = (value: string) => {
    // Allow empty string or positive integer
    return value === '' || /^[0-9]+$/.test(value);
  };

  // Fetch reward cycle data when appliedRewardCycleIndex changes
  useEffect(() => {
    if (!appliedRewardCycleIndex) {
      setRewardCycleData(null);
      return;
    }

    const fetchRewardCycleData = async () => {
      setIsLoadingRewardCycle(true);
      setRewardCycleError(null);
      
      try {
        const params = new URLSearchParams({
          rewardCycleIndex: appliedRewardCycleIndex,
        });
        
        if (appliedDatabaseName) {
          params.append('database', appliedDatabaseName);
        }
        
        const response = await fetch(`/api/rewardCycle?${params.toString()}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch reward cycle data');
        }
        
        setRewardCycleData(result.data);
      } catch (err) {
        console.error('Error fetching reward cycle data:', err);
        setRewardCycleError(err instanceof Error ? err.message : 'An unknown error occurred');
        setRewardCycleData(null);
      } finally {
        setIsLoadingRewardCycle(false);
      }
    };

    fetchRewardCycleData();
  }, [appliedRewardCycleIndex, appliedDatabaseName]);

  // Prepare custom filters based on reward cycle data
  const getCustomFilters = (collectionName: string) => {
    if (!appliedRewardCycleIndex || !rewardCycleData) {
      return {};
    }

    switch (collectionName) {
      case 'sign-effective-balances':
      case 'effective-balances':
      case 'reward-cycle':
        return { rewardCycleIndex: parseInt(appliedRewardCycleIndex) };
      
      case 'chilled':
        return {
          blockNumber: {
            $gte: rewardCycleData.startBlock,
            $lte: rewardCycleData.endBlock
          }
        };
      
      case 'stakers':
        return {
          eraIndex: {
            $gte: rewardCycleData.startEraIndex,
            $lte: rewardCycleData.endEraIndex
          }
        };
      
      case 'balances':
        return {
          $and: [
            { startBlock: { $lte: rewardCycleData.endBlock } },
            { endBlock: { $gte: rewardCycleData.startBlock } }
          ]
        };
      
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-[1800px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-100 mb-6">MongoDB Data Dashboard</h1>
          
          {/* Filter controls */}
          <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
              <div className="flex-1">
                <label htmlFor="databaseName" className="block text-sm font-medium text-gray-200 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  id="databaseName"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="Enter database name"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 rounded-md p-2 border text-gray-200 bg-gray-700"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="accountId" className="block text-sm font-medium text-gray-200 mb-1">
                  Account ID
                </label>
                <input
                  type="text"
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter Account Id"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 rounded-md p-2 border text-gray-200 bg-gray-700 ${
                    accountId && !isValidAccountId(accountId) ? 'border-red-500' : ''
                  }`}
                />
                {accountId && !isValidAccountId(accountId) && (
                  <p className="mt-1 text-sm text-red-600">
                    Invalid account ID format. Should be 0x followed by 40 hex characters.
                  </p>
                )}
              </div>
              
              <div className="flex-1">
                <label htmlFor="rewardCycleIndex" className="block text-sm font-medium text-gray-200 mb-1">
                  Reward Cycle Index
                </label>
                <input
                  type="text"
                  id="rewardCycleIndex"
                  value={rewardCycleIndex}
                  onChange={(e) => setRewardCycleIndex(e.target.value)}
                  placeholder="Enter Reward Cycle Index"
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-600 rounded-md p-2 border text-gray-200 bg-gray-700 ${
                    rewardCycleIndex && !isValidRewardCycleIndex(rewardCycleIndex) ? 'border-red-500' : ''
                  }`}
                />
                {rewardCycleIndex && !isValidRewardCycleIndex(rewardCycleIndex) && (
                  <p className="mt-1 text-sm text-red-600">
                    Invalid reward cycle index. Should be a positive integer.
                  </p>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={!!(
                    (accountId && !isValidAccountId(accountId)) ||
                    (rewardCycleIndex && !isValidRewardCycleIndex(rewardCycleIndex))
                  )}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                  Apply Filters
                </button>
              </div>
            </form>
            
            {/* Show reward cycle data if loaded */}
            {isLoadingRewardCycle && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-gray-200">Loading reward cycle data...</p>
              </div>
            )}
            
            {rewardCycleError && (
              <div className="mt-4 p-3 bg-red-900 text-red-100 rounded">
                <p>{rewardCycleError}</p>
              </div>
            )}
            
            {rewardCycleData && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <h3 className="text-lg font-medium text-gray-100 mb-2">Reward Cycle {rewardCycleData.rewardCycleIndex} Details</h3>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-gray-400">Start Block</p>
                    <p className="text-gray-200">{rewardCycleData.startBlock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">End Block</p>
                    <p className="text-gray-200">{rewardCycleData.endBlock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Start Era</p>
                    <p className="text-gray-200">{rewardCycleData.startEraIndex}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">End Era</p>
                    <p className="text-gray-200">{rewardCycleData.endEraIndex}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Data Sections */}
          <DataSection
            title="Signed Effective Balances"
            collectionName="sign-effective-balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('sign-effective-balances')}
          />
          
          <DataSection
            title="Effective Balances"
            collectionName="effective-balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('effective-balances')}
          />
          
          <DataSection
            title="Reward Cycles"
            collectionName="reward-cycle"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('reward-cycle')}
          />
          
          <DataSection
            title="Chilled Accounts"
            collectionName="chilled"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('chilled')}
          />
          
          <DataSection
            title="Stakers"
            collectionName="stakers"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('stakers')}
          />
          
          <DataSection
            title="Balances"
            collectionName="balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('balances')}
          />
        </div>
      </div>
    </div>
  );
}
