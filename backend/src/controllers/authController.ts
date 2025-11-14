import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DatabaseConnection } from "../config/database";
import { User } from "../models/User";

const JWT_SECRET = "your_jwt_secret";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const db = await DatabaseConnection.getInstance();
      const { name, email, password } = req.body;

      const existingUser = await db.get<User>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (existingUser) return res.status(400).json({ error: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, "user"]
      );

      const newUser: User = {
        id: result.lastID!,
        name,
        email,
        password: hashedPassword,
        role: "user",
      };

      const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        token,
      });
    } catch (err) {
      res.status(500).json({ error: "Registration failed", details: err });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const db = await DatabaseConnection.getInstance();
      const { email, password } = req.body;

      const user = await db.get<User>("SELECT * FROM users WHERE email = ?", [email]);
      if (!user) return res.status(400).json({ error: "User not found" });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: "Invalid password" });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed", details: err });
    }
  }
}
