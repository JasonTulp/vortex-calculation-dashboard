import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface EffectiveBalanceDetail {
  balance: string;
  effectiveBalance: string;
  rate: number;
  rewardPoints: string;
  stakerType?: string;
}

export interface EffectiveBalanceModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  vtxDistributionId: number;
  startBlock: number;
  endBlock: number;
  effectiveBlocks: number;
  percentage: number;
  totalRewardPoints?: string;
  bonded: EffectiveBalanceDetail;
  unlocking: EffectiveBalanceDetail;
} 