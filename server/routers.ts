import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  menu: router({
    getAll: publicProcedure.query(() => db.getAllMenuItems()),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getMenuItemById(input)),
    getByCategory: publicProcedure.input(z.string()).query(({ input }) => db.getMenuItemsByCategory(input)),
  }),

  order: router({
    getAll: publicProcedure.query(async () => {
      const orders = await db.getAllOrders();
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await db.getOrderItems(order.id);
        const detailedItems = items.map((item) => {
          return {
            name: item.name || 'Unknown Item',
            quantity: item.quantity,
            price: item.pricePerItem,
          };
        });
        
        return {
          ...order,
          items: detailedItems,
          totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        };
      }));
      return ordersWithItems;
    }),
    create: publicProcedure
      .input(z.object({
        tableNumber: z.number(),
        items: z.array(z.object({
          menuItemId: z.number(),
          name: z.string(), // Name from frontend
          quantity: z.number(),
          pricePerItem: z.number(),
        })),
        specialNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const totalPrice = input.items.reduce((sum, item) => sum + (item.pricePerItem * item.quantity), 0);
        const taxAmount = 0; // Tax removed as requested

        const orderId = await db.createOrder(
          {
            userId: ctx.user?.id || 0,
            tableNumber: input.tableNumber,
            totalPrice,
            taxAmount,
            specialNotes: input.specialNotes,
          },
          input.items.map(item => ({
            orderId: 0,
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            pricePerItem: item.pricePerItem,
            subtotal: item.pricePerItem * item.quantity,
          }))
        );

        return { orderId, totalPrice, taxAmount };
      }),
    getById: publicProcedure.input(z.number()).query(({ input }) => db.getOrderById(input)),
    getByStatus: publicProcedure.input(z.enum(["pending", "in_progress", "completed", "cancelled"]))
      .query(({ input }) => db.getOrdersByStatus(input)),
    getItems: publicProcedure.input(z.number()).query(({ input }) => db.getOrderItems(input)),
    updateStatus: publicProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
      }))
      .mutation(({ input }) => db.updateOrderStatus(input.orderId, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
