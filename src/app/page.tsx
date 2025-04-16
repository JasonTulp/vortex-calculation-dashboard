'use client';

import { useState, useEffect } from 'react';
import DataSection from '@/components/DataSection';
import { RewardCycleModel } from '@/models';

export default function Home() {
  const [databaseName, setDatabaseName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [counter, setCounter] = useState(0);
  const [vtxDistributionId, setVtxDistributionId] = useState('');
  const [appliedDatabaseName, setAppliedDatabaseName] = useState('');
  const [appliedAccountId, setAppliedAccountId] = useState('');
  const [appliedVtxDistributionId, setAppliedVtxDistributionId] = useState('');
  const [rewardCycleData, setRewardCycleData] = useState<RewardCycleModel | null>(null);
  const [isLoadingRewardCycle, setIsLoadingRewardCycle] = useState(false);
  const [rewardCycleError, setRewardCycleError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCounter(counter + 1);
    setAppliedDatabaseName(databaseName);
    setAppliedAccountId(accountId);
    setAppliedVtxDistributionId(vtxDistributionId);
  };

  const isValidAccountId = (value: string) => {
    // Allow empty string or valid hex format (0x followed by 40 hex characters)
    return value === '' || /^0x[0-9a-fA-F]{40}$/.test(value);
  };

  const isValidVtxDistributionId = (value: string) => {
    // Allow empty string or positive integer
    return value === '' || /^[0-9]+$/.test(value);
  };

  // Fetch reward cycle data when appliedVtxDistributionId changes
  useEffect(() => {
    if (!appliedVtxDistributionId) {
      setRewardCycleData(null);
      return;
    }

    const fetchRewardCycleData = async () => {
      setIsLoadingRewardCycle(true);
      setRewardCycleError(null);
      
      try {
        const params = new URLSearchParams({
          vtxDistributionId: appliedVtxDistributionId,
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
  }, [appliedVtxDistributionId, appliedDatabaseName, counter]);

  // Prepare custom filters based on reward cycle data
  const getCustomFilters = (collectionName: string) => {
    if (!appliedVtxDistributionId || !rewardCycleData) {
      return {};
    }

    switch (collectionName) {
      case 'sign-effective-balances':
      case 'effective-balances':
      case 'reward-cycle':
        return { vtxDistributionId: parseInt(appliedVtxDistributionId) };
      
      case 'chilled':
      case 'transactions':
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
      case 'asset-prices':
        return { vtxDistributionId: parseInt(appliedVtxDistributionId) };
      
      case 'validator-payouts':
      case 'nominator-payouts':
        return {
          eraIndex: {
            $gte: rewardCycleData.startEraIndex,
            $lte: rewardCycleData.endEraIndex
          }
        };
      
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-[1800px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Filter controls */}
          <div className="bg-mid shadow rounded-md border border-primary p-4 mb-4">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
              <div className="flex-1">
                <label htmlFor="databaseName" className="block text-sm font-bold text-gray-200 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  id="databaseName"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="Enter database name"
                  className="shadow-sm border-light focus:border-primary block w-full sm:text-sm rounded-md p-2 border text-gray-200 bg-mid-light"
                />
              </div>
              
              <div className="flex-1">
                <label htmlFor="accountId" className="block text-sm font-bold text-gray-200 mb-1">
                  Account ID
                </label>
                <input
                  type="text"
                  id="accountId"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="Enter Account Id"
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-light rounded-md p-2 border text-gray-200 bg-mid-light ${
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
                <label htmlFor="vtxDistributionId" className="block text-sm font-bold text-gray-200 mb-1">
                  Vortex Distribution Id
                </label>
                <input
                  type="text"
                  id="vtxDistributionId"
                  value={vtxDistributionId}
                  onChange={(e) => setVtxDistributionId(e.target.value)}
                  placeholder="Enter Vortex Distribution Id"
                  className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-light rounded-md p-2 border text-gray-200 bg-mid-light ${
                    vtxDistributionId && !isValidVtxDistributionId(vtxDistributionId) ? 'border-red-500' : ''
                  }`}
                />
                {vtxDistributionId && !isValidVtxDistributionId(vtxDistributionId) && (
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
                    (vtxDistributionId && !isValidVtxDistributionId(vtxDistributionId))
                  )}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed h-10"
                >
                  Apply Filters
                </button>
              </div>
            </form>
            
            {/* Show reward cycle data if loaded */}
            {isLoadingRewardCycle && (
              <div className="mt-4 p-3 bg-mid-light rounded">
                <p className="text-gray-200">Loading reward cycle data...</p>
              </div>
            )}
            
            {rewardCycleError && (
              <div className="mt-4 p-3 bg-red-900 text-red-100 rounded">
                <p>{rewardCycleError}</p>
              </div>
            )}
            
            {rewardCycleData && (
              <div className="mt-4 p-3 bg-mid-light rounded">
                <h3 className="text-lg font-medium text-gray-100 mb-2">Reward Cycle {rewardCycleData.vtxDistributionId} Details</h3>
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
            title="Reward Cycles"
            collectionName="reward-cycle"
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('reward-cycle')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Balances"
            collectionName="balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('balances')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Effective Balances"
            collectionName="effective-balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('effective-balances')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Signed Effective Balances"
            collectionName="sign-effective-balances"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('sign-effective-balances')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Transactions"
            collectionName="transactions"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('transactions')}
            refreshTrigger={counter}
          />

          <DataSection
            title="Chilled Accounts"
            collectionName="chilled"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('chilled')}
            refreshTrigger={counter}
          />

          <DataSection
            title="Asset Prices"
            collectionName="asset-prices"
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('asset-prices')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Validator Payouts"
            collectionName="validator-payouts"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('validator-payouts')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Nominator Payouts"
            collectionName="nominator-payouts"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('nominator-payouts')}
            refreshTrigger={counter}
          />

          <DataSection
              title="Stakers"
              collectionName="stakers"
              accountId={appliedAccountId}
              databaseName={appliedDatabaseName || undefined}
              customFilters={getCustomFilters('stakers')}
              refreshTrigger={counter}
          />

        </div>
      </div>
    </div>
  );
}
