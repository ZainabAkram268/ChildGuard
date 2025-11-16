// backend/src/models/SponsorShortlistedFamily.ts
import { BaseModel } from './BaseModels';

const shortlist = BaseModel.db.prepare(`
  INSERT INTO sponsor_shortlisted_families (sponsor_id, family_id)
  VALUES (?, ?)
`);

export class SponsorShortlistedFamilyModel extends BaseModel {
  static shortlist(sponsor_id: string, family_id: string) {
    shortlist.run(sponsor_id, family_id);
  }
}