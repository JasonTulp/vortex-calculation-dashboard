import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface ValidatorPayoutModel extends BaseModel {
  _id: ObjectId;
  eraIndex: number;
  validator: string;
  payout: string;
  percentage?: number;
  startBlock: number;
  endBlock: number;
} 