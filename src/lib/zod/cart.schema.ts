import { z } from "zod";

export const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    priceSnapshot: z.number().min(0)
});

export type CartItemInput = z.infer<typeof cartItemSchema>;

export const createCartSchema = z.object({
    userId: z.string().optional(),
    items: z.array(cartItemSchema).min(1),
    shipping: z.number().min(0).default(0)
});

export type CreateCartInput = z.infer<typeof createCartSchema>;


