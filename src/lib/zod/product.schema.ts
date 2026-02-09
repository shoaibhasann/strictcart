import { z } from "zod";

export const createProductSchema = z.object({
    title: z.string().trim().min(2),
    price: z.number().min(0),
    discount: z.number().min(0),
    stock: z.number().min(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;