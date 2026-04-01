import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Menu items table - stores all menu items for the cafe
 */
export const menuItems = sqliteTable("menuItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("imageUrl"),
  isAvailable: integer("isAvailable").default(1).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

/**
 * Orders table - stores all customer orders
 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  tableNumber: integer("tableNumber").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).default("pending").notNull(),
  totalPrice: integer("totalPrice").notNull(),
  taxAmount: integer("taxAmount").notNull(),
  specialNotes: text("specialNotes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table - stores individual items in each order
 */
export const orderItems = sqliteTable("orderItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  menuItemId: integer("menuItemId").notNull(),
  name: text("name"), // Added to store item name at the time of order
  quantity: integer("quantity").notNull(),
  pricePerItem: integer("pricePerItem").notNull(),
  subtotal: integer("subtotal").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;