import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface ChilledModel extends BaseModel {
  _id: ObjectId;
  account?: string;
  blockNumber: number;
} 