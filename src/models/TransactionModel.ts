import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export const TransactionType = {
  BONDED: 'bonded',
  REBONDED: 'rebonded',
  UNBONDED: 'unbonded',
  WITHDRAWN: 'withdrawn',
  SLASHED: 'slashed',
  CARRYOVER: 'carryover' // Used internally to indicate a transaction that came from the previous cycle
};

export interface TransactionModel extends BaseModel {
  _id: ObjectId;
  account: string;
  amount: string;
  blockNumber: number;
  type: string;
} 