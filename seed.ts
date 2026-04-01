import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { menuItems } from "./drizzle/schema.js";
import { menuItems as frontMenu } from "./client/src/data/menuData.js";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  const client = createClient({ url: "file:local.db" });
  const db = drizzle(client);

  console.log("Seeding menu items...");
  
  for (const item of frontMenu) {
    // Extract numeric ID
    const idParts = item.id.split('-');
    const numericId = parseInt(idParts[idParts.length - 1]);
    
    await db.insert(menuItems).values({
      id: numericId,
      name: item.name,
      category: item.category,
      price: item.price,
      imageUrl: item.image,
      description: item.description,
      isAvailable: 1
    }).onConflictDoUpdate({
      target: menuItems.id,
      set: {
        name: item.name,
        category: item.category,
        price: item.price,
        imageUrl: item.image,
        description: item.description
      }
    });
  }

  console.log("Seeding completed!");
}

seed().catch(console.error);
