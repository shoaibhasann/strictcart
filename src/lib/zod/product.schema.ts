import { PRODUCT_STATUS } from "@/src/types/model.types";
import { z } from "zod";

export const createProductSchema = z.object({
    title: z.string().trim().min(2),
    price: z.number().min(0),
    discount: z.number().min(0),
    stock: z.number().min(0),
    status: z.enum(PRODUCT_STATUS)
});

export const updateProductScehma = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;