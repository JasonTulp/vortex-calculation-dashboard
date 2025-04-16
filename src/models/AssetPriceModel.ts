import { ObjectId } from 'mongodb';
import { BaseModel } from './BaseModel';

export interface AssetPriceModel extends BaseModel {
  _id: ObjectId;
  vtxDistributionId: number;
  assetId: number;
  price: number;
  submitted?: boolean;
} 