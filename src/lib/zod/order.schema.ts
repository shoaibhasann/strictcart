import { z } from "zod";

export const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1).default(1),
    priceSnapshot: z.number().min(0)
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
    userId: z.string().optional(),
    items: z.array(orderItemSchema).min(1),
    shipping: z.number().min(0).default(70),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
