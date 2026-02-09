import { ROLE } from "@/src/types/model.types";
import { z } from "zod";

export const createUserSchema = z.object({
    username: z.string().trim().min(3),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    role: z.enum(ROLE).default("USER"),
    isActive: z.boolean().default(true),
    refreshToken: z.string().trim().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;



