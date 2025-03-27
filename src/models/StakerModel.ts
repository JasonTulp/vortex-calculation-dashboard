import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface StakerModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  eraIndex: number;
  type?: string;
  validatorStash?: string; // Actually the "ParentStash" field
  totalStake?: string;
} 