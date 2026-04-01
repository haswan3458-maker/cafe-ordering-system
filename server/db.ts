import { createClient } from "@libsql/client";
import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { InsertUser, users, menuItems, orders, orderItems, InsertOrder, InsertOrderItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _sqliteParams: string | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Create data directory if we're using local sqlite and it contains a path
      const dbUrl = process.env.DATABASE_URL;
      
      const client = createClient({ url: `file:${dbUrl}` });
      _db = drizzle(client);
      _sqliteParams = dbUrl;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Menu queries
export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.isAvailable, 1));
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getMenuItemsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems)
    .where(and(
      eq(menuItems.category, category),
      eq(menuItems.isAvailable, 1)
    ));
}

// Order queries
export async function createOrder(order: InsertOrder, items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(order).returning({ id: orders.id });
  const orderId = result[0]?.id || 0;
  
  if (items.length > 0 && orderId) {
    const itemsWithOrderId = items.map(item => ({
      ...item,
      orderId: Number(orderId)
    }));
    await db.insert(orderItems).values(itemsWithOrderId);
  }
  
  return orderId;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByStatus(status: "pending" | "in_progress" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.status, status))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(orderId: number, status: "pending" | "in_progress" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
}
