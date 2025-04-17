'use client';

import { useState, useEffect } from 'react';
import { VortexCalculationResult, formatNumber } from '@/lib/vortexCalculations';
import { VortexCalculationModel } from '@/models';
import BigNumber from 'bignumber.js';

interface VortexCalculationSectionProps {
  accountId: string;
  vtxDistributionId: string;
  databaseName?: string;
}

export default function VortexCalculationSection({
  accountId,
  vtxDistributionId,
  databaseName
}: VortexCalculationSectionProps) {
  const [calculationData, setCalculationData] = useState<VortexCalculationResult | null>(null);
  const [inputData, setInputData] = useState<VortexCalculationModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculationData = async () => {
      if (!accountId || !vtxDistributionId) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          accountId,
          vtxDistributionId
        });

        if (databaseName) {
          params.append('database', databaseName);
        }

        const response = await fetch(`/api/vortexCalculation?${params.toString()}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch calculation data');
        }

        // Get both input data and results from the API response
        setInputData(result.data);
        setCalculationData(result.results);
      } catch (err) {
        console.error('Error fetching calculation data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setCalculationData(null);
        setInputData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalculationData();
  }, [accountId, vtxDistributionId, databaseName]);

  // Don't render if both filters aren't active
  if (!accountId || !vtxDistributionId) {
    return null;
  }

  return (
    <div className="bg-mid shadow rounded-md border border-primary p-4 mb-4">
      <h2 className="text-xl font-semibold text-primary mb-4">VTX Reward Calculation</h2>

      {isLoading ? (
        <div className="text-center p-4">
          <svg className="animate-spin h-5 w-5 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-300">Loading calculation...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-900 text-red-100 rounded-sm">
          <p>{error}</p>
        </div>
      ) : calculationData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First column: VTX Price and Total VTX */}
          <div>
            <div className="bg-mid-light p-4 rounded-md">
              <h3 className="text-lg font-medium text-primary mb-3">VTX Price Calculation</h3>
              <table className="w-full text-text">
                <tbody>
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">VTX Price</td>
                    <td className="py-2 text-right">{formatNumber(calculationData.vtxPrice)}</td>
                  </tr>
                  {inputData && (
                    <tr>
                      <td className="py-2 text-text">Current Supply</td>
                      <td className="py-2 text-right">{formatNumber(inputData.vtxCurrentSupply)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-mid-light p-4 rounded-md mt-4">
              <h3 className="text-lg font-medium text-primary mb-3">Total VTX Calculation</h3>
              <table className="w-full text-text">
                <tbody>
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">Network Reward</td>
                    <td className="py-2 text-right">{formatNumber(calculationData.totalVortexNetworkReward)}</td>
                  </tr>
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">Bootstrap</td>
                    <td className="py-2 text-right">{formatNumber(calculationData.totalVortexBootstrap)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-text font-semibold">Total VTX</td>
                    <td className="py-2 text-right font-semibold">{formatNumber(calculationData.totalVortex)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Second column: Reward Pools and Account Reward */}
          <div>
            <div className="bg-mid-light p-4 rounded-md">
              <h3 className="text-lg font-medium text-primary mb-3">VTX Reward Pools</h3>
              <table className="w-full text-text">
                <tbody>
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">Staker Pool</td>
                    <td className="py-2 text-right">{formatNumber(calculationData.stakerPool)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-text">Workpoint Pool</td>
                    <td className="py-2 text-right">{formatNumber(calculationData.workpointPool)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-mid-light p-4 rounded-md mt-4">
              <h3 className="text-lg font-medium text-primary mb-3">Account Reward Calculation</h3>
              <table className="w-full text-text">
                <tbody>
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">Staker Point Portion</td>
                    <td className="py-2 text-right">{(new BigNumber(calculationData?.accountStakerPointPortion).times(100)).toNumber().toFixed(2)}%</td>
                  </tr>
                  {inputData && (
                    <tr className="border-b border-dark">
                      <td className="py-2 pl-4 text-sm text-text">Account Points</td>
                      <td className="py-2 text-right">{formatNumber(inputData.accountStakerRewardPoints)}</td>
                    </tr>
                  )}
                  {inputData && (
                    <tr className="border-b border-dark">
                      <td className="py-2 pl-4 text-sm text-text">Total Points</td>
                      <td className="py-2 text-right">{formatNumber(inputData.totalStakerRewardPoints)}</td>
                    </tr>
                  )}
                  <tr className="border-b border-dark">
                    <td className="py-2 text-text">Work Points Portion</td>
                    <td className="py-2 text-right">{(new BigNumber(calculationData?.accountWorkPointsPortion).times(100)).toNumber().toFixed(2)}%</td>
                  </tr>
                  {inputData && (
                    <tr className="border-b border-dark">
                      <td className="py-2 pl-4 text-sm text-text">Account Points</td>
                      <td className="py-2 text-right">{formatNumber(inputData.accountWorkerPoints)}</td>
                    </tr>
                  )}
                  {inputData && (
                    <tr className="border-b border-dark">
                      <td className="py-2 pl-4 text-sm text-text">Total Points</td>
                      <td className="py-2 text-right">{formatNumber(inputData.totalWorkerPoints)}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2 text-text font-semibold">Account VTX Reward</td>
                    <td className="py-2 text-right font-semibold text-primary">
                      {formatNumber(calculationData.accountVtxReward)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
