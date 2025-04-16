import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface RewardCycleModel extends BaseModel {
  _id: ObjectId;
  currentEraIndex: number;
  startEraIndex: number;
  endEraIndex: number;
  startBlock: number;
  endBlock: number;
  calculationComplete: boolean;
  calculateWorkPoint: boolean;
  registerPointsOnChain: boolean;
  bootstrapRewardInTotal?: string;
  workpointsRewardInTotal?: string;
  vtxDistributionId: number;
} 