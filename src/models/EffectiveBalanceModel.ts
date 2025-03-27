import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface EffectiveBalanceModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  rewardCycleIndex: number;
  startBlock: number;
  endBlock: number;
  balance?: string;
  effectiveBalance?: string;
  effectiveBlocks: number;
  percentage: number;
  rate: number;
  rewardPoints?: string;
  type?: string;
} 