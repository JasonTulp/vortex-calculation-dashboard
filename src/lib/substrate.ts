import { ApiPromise } from "@polkadot/api";
import {
  getApiOptions,
  getLocalProvider,
  getPublicProvider,
  type NetworkName,
} from "@therootnetwork/api";
import "@therootnetwork/api-types";

/**
 * Creates and returns a connection to a Root Network node
 * @param name - The network name or "local" for local node
 * @returns Promise<ApiPromise> - The connected API instance
 */
export async function getRootApi(name: NetworkName | "local") {
  const api = await ApiPromise.create({
    noInitWarn: true,
    ...getApiOptions(),
    ...(name === "local" ? getLocalProvider() : getPublicProvider(name)),
  });

  return api;
}

export interface VortexDistributionData {
  feePotAssets: Array<{ assetId: number; balance: string }>;
  vtxVaultAssets: Array<{ assetId: number; balance: string }>;
  totalNetworkReward: BigNumber;
  totalBootstrapReward: BigNumber;
  totalVortex: BigNumber;
  vtxCurrentSupply: BigNumber;
  totalWorkPoints: BigNumber;
  totalRewardPoints: BigNumber;
  accountWorkPoints: BigNumber;
  accountRewardPoints: BigNumber;
}

/**
 * Fetches all relevant vortex distribution data from the chain
 * @param vtxDistributionId - The vortex distribution identifier
 * @returns Promise<VortexDistributionData> - All vortex distribution related data
 */
export async function getVortexDistributionData(vtxDistributionId: number, accountId: string): Promise<VortexDistributionData> {
  try {
    const api = await getRootApi("local");
    console.log("Getting Vortex Distribution Data:");

    // Fetch all data in parallel
    const [
      feePotAssets,
      vtxVaultAssets,
      totalNetworkReward,
      totalBootstrapReward,
      totalVortex,
      vtxCurrentSupply,
      totalWorkPoints,
      totalRewardPoints,
      accountWorkPoints,
      accountRewardPoints
    ] = await Promise.all([
      api.query.vortexDistribution.feePotAssetsList(vtxDistributionId),
      api.query.vortexDistribution.vtxVaultAssetsList(vtxDistributionId),
      api.query.vortexDistribution.totalNetworkReward(vtxDistributionId),
      api.query.vortexDistribution.totalBootstrapReward(vtxDistributionId),
      api.query.vortexDistribution.totalVortex(vtxDistributionId),
      api.query.assets.asset(3),
      api.query.vortexDistribution.totalWorkPoints(vtxDistributionId),
      api.query.vortexDistribution.totalRewardPoints(vtxDistributionId),
      api.query.vortexDistribution.workPoints(vtxDistributionId, accountId),
      api.query.vortexDistribution.rewardPoints(vtxDistributionId, accountId)
    ]);

    // Get the raw JSON data which will be arrays
    const feePotAssetsJson = feePotAssets.toJSON() as Array<[number, string]>;
    const vtxVaultAssetsJson = vtxVaultAssets.toJSON() as Array<[number, string]>;

    // log all results
    console.log("Vortex Distribution Data:");
    console.log(feePotAssetsJson);
    console.log(vtxVaultAssetsJson);
    console.log(totalNetworkReward.toString());
    console.log(totalBootstrapReward.toString());
    console.log(totalVortex.toString());
    console.log(vtxCurrentSupply.unwrap().supply.toString());
    console.log(totalWorkPoints.toString());
    console.log(totalRewardPoints.toString());
    console.log(accountWorkPoints.toString());
    console.log(accountRewardPoints.toString());

    // Convert the raw chain data to our interface format
    const result: VortexDistributionData = {
      feePotAssets: feePotAssetsJson.map(([assetId, balance]) => ({
        assetId,
        balance
      })),
      vtxVaultAssets: vtxVaultAssetsJson.map(([assetId, balance]) => ({
        assetId,
        balance
      })),
      totalNetworkReward: new BigNumber(totalNetworkReward.toString()),
      totalBootstrapReward: new BigNumber(totalBootstrapReward.toString()),
      totalVortex: new BigNumber(totalVortex.toString()),
      vtxCurrentSupply: new BigNumber(vtxCurrentSupply.unwrap().supply.toString()),
      totalWorkPoints: new BigNumber(totalWorkPoints.toString()),
      totalRewardPoints: new BigNumber(totalRewardPoints.toString()),
      accountWorkPoints: new BigNumber(accountWorkPoints.toString()),
      accountRewardPoints: new BigNumber(accountRewardPoints.toString()),
    };

    await api.disconnect();
    return result;
  } catch (error) {
    console.error("Error fetching vortex distribution data:", error);
    throw error;
  }
} 