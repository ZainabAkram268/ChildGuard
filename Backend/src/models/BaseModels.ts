// backend/src/models/BaseModel.ts
import db from '../config/database';

export abstract class BaseModel {
  public static db = db;
}