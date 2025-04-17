import BigNumber from 'bignumber.js';

interface Asset {
  assetId: number;
  balance: BigNumber;
}

interface AssetPrice {
  assetId: number;
  price: BigNumber;
}

export function calculateVtxPrice(
  assets: Asset[],
  prices: AssetPrice[],
  vtxTotalSupply: BigNumber
): BigNumber {
  let assetValueUsd = new BigNumber(0);
  
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const priceInfo = prices.find(p => p.assetId === asset.assetId);
    
    if (priceInfo) {
      assetValueUsd = assetValueUsd.plus(asset.balance.times(priceInfo.price));
    }
  }
  
  // Avoid division by zero
  const vtxPrice = vtxTotalSupply.isZero() ? new BigNumber(1) : assetValueUsd.dividedBy(vtxTotalSupply);
  return vtxPrice;
}

export function calculateVtx(
  feePotAssetBalances: Asset[],
  assetPrices: AssetPrice[],
  bootstrapRoot: BigNumber,
  rootPrice: BigNumber,
  vtxPrice: BigNumber
): [BigNumber, BigNumber, BigNumber] {
  let feeVaultAssetValue = new BigNumber(0);
  
  // Calculate total value in fee pot
  for (let i = 0; i < feePotAssetBalances.length; i++) {
    const asset = feePotAssetBalances[i];
    const priceInfo = assetPrices.find(p => p.assetId === asset.assetId);
    
    if (priceInfo) {
      feeVaultAssetValue = feeVaultAssetValue.plus(asset.balance.times(priceInfo.price));
    }
  }
  
  // Calculate bootstrap amount
  const bootstrapAssetValue = bootstrapRoot.times(rootPrice);
  
  // Convert to VTX tokens
  const totalVortexNetworkReward = feeVaultAssetValue.dividedBy(vtxPrice);
  const totalVortexBootstrap = bootstrapAssetValue.dividedBy(vtxPrice);
  
  // Total vortex tokens
  const totalVortex = totalVortexNetworkReward.plus(totalVortexBootstrap);
  
  return [totalVortexNetworkReward, totalVortexBootstrap, totalVortex];
}

export function calculateAccountReward(
  totalVortexNetworkReward: BigNumber,
  totalVortexBootstrap: BigNumber,
  accountStakerRewardPoints: BigNumber,
  totalStakerRewardPoints: BigNumber,
  accountWorkerPoints: BigNumber,
  totalWorkerPoints: BigNumber
): {
  stakerPool: BigNumber;
  workpointPool: BigNumber;
  accountStakerPointPortion: BigNumber;
  accountWorkPointsPortion: BigNumber;
  accountVtxReward: BigNumber;
} {
  // Calculate pools
  const stakerPool = totalVortexBootstrap.plus(totalVortexNetworkReward.times(new BigNumber(0.3)));
  const workpointPool = totalVortexNetworkReward.times(new BigNumber(0.7));
  
  // Calculate portions
  const accountStakerPointPortion = totalStakerRewardPoints.isZero()
    ? new BigNumber(0)
    : accountStakerRewardPoints.dividedBy(totalStakerRewardPoints);
    
  const accountWorkPointsPortion = totalWorkerPoints.isZero()
    ? new BigNumber(0)
    : accountWorkerPoints.dividedBy(totalWorkerPoints);
  
  // Calculate reward
  const accountVtxReward = accountStakerPointPortion.times(stakerPool)
    .plus(accountWorkPointsPortion.times(workpointPool));
  
  return {
    stakerPool,
    workpointPool,
    accountStakerPointPortion,
    accountWorkPointsPortion,
    accountVtxReward
  };
}

export function formatNumber(num: number | BigNumber): string {
  const value = num instanceof BigNumber ? num.toNumber() : num;
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export interface VortexCalculationResult {
  vtxPrice: BigNumber;
  totalVortexNetworkReward: BigNumber;
  totalVortexBootstrap: BigNumber;
  totalVortex: BigNumber;
  stakerPool: BigNumber;
  workpointPool: BigNumber;
  accountStakerPointPortion: BigNumber;
  accountWorkPointsPortion: BigNumber;
  accountVtxReward: BigNumber;
} 