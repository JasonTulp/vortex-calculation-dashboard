import BigNumber from 'bignumber.js';

export interface VortexAssetBalance {
  assetId: number;
  balance: BigNumber;
}

export interface VortexAssetPrice {
  assetId: number;
  price: BigNumber;
}

export interface VortexCalculationModel {
  vtxCurrentSupply: BigNumber;
  feePotAssetBalances: VortexAssetBalance[];
  bootstrapRoot: BigNumber;
  accountWorkerPoints: BigNumber;
  totalWorkerPoints: BigNumber;
  vtxVaultAssetBalances: VortexAssetBalance[];
  assetPrices: VortexAssetPrice[];
  accountStakerRewardPoints: BigNumber;
  totalStakerRewardPoints: BigNumber;
} 