// src/models/parents.ts
import { UserModel, User } from "./user"; // Import User for better type merging
import { BaseModel } from "./BaseModels";

// Define the Parent extension fields
export interface ParentExtension {
  parent_id: string;
  phone: string | null; // Changed to match schema column type nullability
  address: string | null; // Changed to match schema column type nullability
}

// Define the merged object type returned by create/find
export type Parent = User & ParentExtension;

export class ParentModel extends BaseModel {
  static create(data: {
    username: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Parent { // Explicit return type
    this.init();

    // create user synchronously
    const user = UserModel.create({
      username: data.username,
      email: data.email,
      password: data.password,
      role: "parent",
    });

    const insertParent = this.db.prepare(`
      INSERT INTO parents (parent_id, phone, address)
      VALUES (?, ?, ?)
    `);
    // Use the null-coalescing operator ?? to ensure null is passed to DB if undefined
    insertParent.run(user.user_id, data.phone ?? null, data.address ?? null);

    // Select the extension fields. Note: The database will return NULL if the columns are empty.
    const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user.user_id) as ParentExtension;
    // Merge the user object with the parent extension data
    return { ...user, ...extra };
  }

  static find(user_id: string): Parent | null { // Explicit return type
    this.init();

    const user = UserModel.findById(user_id);
    if (!user || user.role !== "parent") return null;

    // Select the extension fields
    const extra = this.db.prepare("SELECT parent_id, phone, address FROM parents WHERE parent_id = ?").get(user_id) as ParentExtension;
    // Merge the user object with the parent extension data
    return { ...user, ...extra };
  }
}