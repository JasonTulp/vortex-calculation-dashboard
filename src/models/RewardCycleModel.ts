import { BaseModel } from './BaseModel';

export interface RewardCycleModel extends BaseModel {
  currentEraIndex: number;
  startEraIndex: number;
  endEraIndex: number;
  startBlock: number;
  endBlock: number;
  finished: boolean;
  needToCalculate: boolean;
  bootstrapRewardInTotal?: string;
  workpointsRewardInTotal?: string;
  vtxDistributionId?: string;
  stakersReward?: string;
  validatorsReward?: string;
  rewardCycleIndex: number;
} 