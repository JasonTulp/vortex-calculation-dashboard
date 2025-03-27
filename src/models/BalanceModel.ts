import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface BalanceModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  startBlock: number;
  endBlock: number;
  blockRange: number;
  balance?: string;
  balanceChange?: string;
  previousBalance?: string; // Renamed from PreviousBalanceChange in C# model
  stakerType?: string;
} 