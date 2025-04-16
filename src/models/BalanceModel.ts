import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface BalanceDetail {
  previousBalance: string;
  balanceChange: string;
  balanceInBlockRange: string;
  stakerType?: string;
}

export interface BalanceModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  startBlock: number;
  endBlock: number;
  bonded?: BalanceDetail;
  unlocking?: BalanceDetail;
} 