import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface NominatorPayoutModel extends BaseModel {
  _id: ObjectId;
  eraIndex: number;
  validator: string;
  nominator: string;
  payout: string;
  percentage?: number;
  startBlock: number;
  endBlock: number;
} 