import { NextRequest, NextResponse } from 'next/server';
import { VortexCalculationModel, VortexAssetPrice } from '@/models';
import { calculateVtxPrice, calculateVtx, calculateAccountReward } from '@/lib/vortexCalculations';
import clientPromise from "@/lib/mongodb";
import { getVortexDistributionData } from '@/lib/substrate';
import BigNumber from 'bignumber.js';

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const vtxDistributionId = searchParams.get('vtxDistributionId');
    const databaseName = searchParams.get('database') || process.env.MONGODB_DEFAULT_DB;

    if (!accountId || !vtxDistributionId) {
      return NextResponse.json(
        { error: 'Account ID and VTX distribution ID are required' },
        { status: 400 }
      );
    }

    // Fetch asset prices from MongoDB
    const client = await clientPromise;
    const db = client.db(databaseName);
    const assetPricesRaw = await db.collection('asset-prices')
      .find({ vtxDistributionId: parseInt(vtxDistributionId) })
      .toArray();

    // Map the MongoDB documents to the VortexAssetPrice format
    const assetPrices: VortexAssetPrice[] = assetPricesRaw.map(doc => ({
      assetId: doc.assetId,
      price: new BigNumber(doc.price)
    }));

    // Fetch vortex distribution data from the chain
    const vortexData = await getVortexDistributionData(parseInt(vtxDistributionId), accountId);

    // Map the chain data to the format expected by our calculation functions
    const vtxVaultAssetBalances = vortexData.vtxVaultAssets.map(asset => ({
      assetId: asset.assetId,
      balance: new BigNumber(asset.balance)
    }));

    const feePotAssetBalances = vortexData.feePotAssets.map(asset => ({
      assetId: asset.assetId,
      balance: new BigNumber(asset.balance)
    }));

    const vtxCurrentSupply = vortexData.vtxCurrentSupply;
    const accountWorkerPoints = vortexData.accountWorkPoints;
    const totalWorkerPoints = vortexData.totalWorkPoints;
    const accountStakerRewardPoints = vortexData.accountRewardPoints;
    const totalStakerRewardPoints = vortexData.totalRewardPoints;
    // TODO get bootstrap root correctly
    // This for cycle 6 total bootstrap
    const bootstrapRoot = new BigNumber(17057307006875); //vortexData.BootstrapRoot;

    // Calculate VTX price
    const vtxPrice = calculateVtxPrice(
      vtxVaultAssetBalances,
      assetPrices,
      vtxCurrentSupply
    );

    console.log('VTX Price:', vtxPrice.toString());

    const rootPrice = assetPrices.find(p => p.assetId === 1)?.price || new BigNumber(0);

    // Calculate VTX amounts
    const [totalVortexNetworkReward, totalVortexBootstrap, totalVortex] = calculateVtx(
      feePotAssetBalances,
      assetPrices,
      bootstrapRoot,
      rootPrice,
      vtxPrice
    );

    console.log('Network Reward:', totalVortexNetworkReward.toString());
    console.log('Bootstrap:', totalVortexBootstrap.toString());
    console.log('Total:', totalVortex.toString());

    // Calculate account reward
    const {
      stakerPool,
      workpointPool,
      accountStakerPointPortion,
      accountWorkPointsPortion,
      accountVtxReward
    } = calculateAccountReward(
      totalVortexNetworkReward,
      totalVortexBootstrap,
      accountStakerRewardPoints,
      totalStakerRewardPoints,
      accountWorkerPoints,
      totalWorkerPoints
    );

    console.log('Staker Pool:', stakerPool.toString());
    console.log('Workpoint Pool:', workpointPool.toString());
    console.log('Staker Portion:', accountStakerPointPortion.toString());
    console.log('Worker Portion:', accountWorkPointsPortion.toString());
    console.log('Account Reward:', accountVtxReward.toString());

    // Return all calculation data and results
    const calculationData: VortexCalculationModel = {
      vtxCurrentSupply,
      feePotAssetBalances,
      bootstrapRoot,
      accountWorkerPoints,
      totalWorkerPoints,
      vtxVaultAssetBalances,
      assetPrices,
      accountStakerRewardPoints,
      totalStakerRewardPoints
    };

    return NextResponse.json({
      data: calculationData,
      results: {
        vtxPrice,
        totalVortexNetworkReward,
        totalVortexBootstrap,
        totalVortex,
        stakerPool,
        workpointPool,
        accountStakerPointPortion,
        accountWorkPointsPortion,
        accountVtxReward
      }
    });
  } catch (error) {
    console.error('Error calculating vortex data:', error);
    return NextResponse.json(
      { error: 'Failed to calculate vortex data' },
      { status: 500 }
    );
  }
}
