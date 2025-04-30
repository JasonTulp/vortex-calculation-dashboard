'use client';

import { useState, useEffect } from 'react';
import DataSection from '@/components/DataSection';
import VortexCalculationSection from '@/components/VortexCalculationSection';
import Description from '@/components/Description';
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
        <Description />
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
                <h3 className="text-lg font-medium text-text mb-2">Reward Cycle {rewardCycleData.vtxDistributionId} Details</h3>
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
          
          {/* VTX Calculation Section - Only show when both account and VTX distribution ID are provided */}
          {appliedAccountId && appliedVtxDistributionId && (
            <VortexCalculationSection 
              accountId={appliedAccountId}
              vtxDistributionId={appliedVtxDistributionId}
              databaseName={appliedDatabaseName}
            />
          )}
          
          {/* Data Sections */}
          
          <DataSection
            title="Reward Cycles"
            collectionName="reward-cycle"
            description="List of previous and current reward cycles and the block range that they cover. If the End Era Index is -1 it means the cycle is still active."
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('reward-cycle')}
            refreshTrigger={counter}
          />

          <DataSection
              title="Submitted Reward Points"
              collectionName="sign-effective-balances"
              description="All submitted reward points for a specific cycle. The reward points per account are calculated from the effective balances over the cycle range."
              accountId={appliedAccountId}
              databaseName={appliedDatabaseName || undefined}
              customFilters={getCustomFilters('sign-effective-balances')}
              refreshTrigger={counter}
              columnBlacklist={['timestamp', 'signature']}
          />

          <DataSection
              title="Effective Balances"
              collectionName="effective-balances"
              description="Effective balances show the bonded and unlocking balances for an account. A new effective balance will be created every time there is a change in bonded balance, unlocking balance or staker type."
              accountId={appliedAccountId}
              databaseName={appliedDatabaseName || undefined}
              customFilters={getCustomFilters('effective-balances')}
              refreshTrigger={counter}
          />
          
          <DataSection
            title="Balances"
            collectionName="balances"
            description="The Balances table shows the raw balance ledger built from block 0. Any change in balance due to bonding, unbonding, withdraw or rebond event will create a new balance entry here"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('balances')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Transactions"
            collectionName="transactions"
            description="The transactions table shows all bonded, unbonded, rebonded, withdrawn and slashed events that have happened on chain. This is the raw data used to calculate the balance ledger for each account"
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('transactions')}
            refreshTrigger={counter}
          />

          <DataSection
              title="Stakers"
              collectionName="stakers"
              description="This table contains data for all Nominators and Validators per era. The staker type for reward points will be calculated based on their staker type in this table unless the account has chilled."
              accountId={appliedAccountId}
              databaseName={appliedDatabaseName || undefined}
              customFilters={getCustomFilters('stakers')}
              refreshTrigger={counter}
          />

          <DataSection
            title="Chilled"
            collectionName="chilled"
            description="Any time an account is chilled it will show up here, if an account is a validator or nominator and chills, they will be paid out the staker rate for their reward points in that era."
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('chilled')}
            refreshTrigger={counter}
          />

          <DataSection
            title="Asset Prices"
            collectionName="asset-prices"
            description="For each reward cycle, the current USD price of each asset contained in the pool is captured and stored at the time of payout. This is used to calculate the portions of each asset in the payout"
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('asset-prices')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Validator Payouts"
            collectionName="validator-payouts"
            description="Shows the payout made for the validator portion. This is calculated from their portion multiplied by total staked, taking into account their commission rate."
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('validator-payouts')}
            refreshTrigger={counter}
          />
          
          <DataSection
            title="Nominator Payouts"
            collectionName="nominator-payouts"
            description="The nominator payouts shows an entry for each era where they have nominated stake on a validator. The percentage shows the portion of the validators total stake that their contribution made up."
            accountId={appliedAccountId}
            databaseName={appliedDatabaseName || undefined}
            customFilters={getCustomFilters('nominator-payouts')}
            refreshTrigger={counter}
          />

        </div>
      </div>
    </div>
  );
}
