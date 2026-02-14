import { requireAdmin } from "@/src/helpers/authorization";
import connectDB from "@/src/lib/connectDB";
import { CreateProductInput, createProductSchema } from "@/src/lib/zod/product.schema";
import { ProductModel } from "@/src/models/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){

    await connectDB();

    try {
        requireAdmin(request);
    } catch (err) {
        if (err instanceof Error) {
            if (err.message === "UNAUTHENTICATED") {
                return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
            }
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }
    }

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
                    error: parsed.error.message
                },
                { status: 400 }
            );
        }

        const data : CreateProductInput = parsed.data;

        if(data.price <= data.discount){
            return NextResponse.json({
                success: false,
                message: "Discount can't be equal or greater than product price"
            }, { status: 400 });
        }

        const newProduct = await ProductModel.create(data);

        if(!newProduct){
            return NextResponse.json({
                success: false,
                message: "Failed to create new product"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Product created successfully",
            data: newProduct
        });

        
    } catch (error) {
        console.error("POST /api/products error: ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}