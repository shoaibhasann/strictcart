import connectDB from "@/src/lib/connectDB";
import { CreateProductInput, createProductSchema } from "@/src/lib/zod/product.schema";
import { NextResponse } from "next/server";

export default async function POST(request){
    await connectDB();

    try {
        const raw = await request.json();
        const parsed = createProductSchema.safeParse(raw);

        if(!parsed.success){
            console.error(
                "Body validation error while creating product:",
                parsed.error
            );
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed while creating product",
                },
                { status: 400 }
            );
        }

        const data : CreateProductInput = parsed.data;

        
    } catch (error) {
        
    }
}