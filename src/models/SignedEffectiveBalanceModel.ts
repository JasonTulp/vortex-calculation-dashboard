import { BaseModel } from './BaseModel';

export interface SignedEffectiveBalanceModel extends BaseModel {
  account?: string;
  totalRewardPoints?: string;
  startBlock: number;
  endBlock: number;
  vtxDistributionId: number;
  signature?: string;
  timestamp: number;
  verified: boolean;
  submitted: boolean;
} 