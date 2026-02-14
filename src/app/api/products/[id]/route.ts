import { requireAdmin } from "@/src/helpers/authorization";
import connectDB from "@/src/lib/connectDB";
import { updateProductScehma } from "@/src/lib/zod/product.schema";
import { ProductModel } from "@/src/models/product.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    ctx: RouteContext<"/api/products/[id]">
) {
    await connectDB();

    try {
        requireAdmin(request);
    } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
        }
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await ctx.params;

        if (!id) {
            return NextResponse.json({ success: false, message: "Invalid Product ID" }, { status: 400 });
        }

        const raw = await request.json();
        const parsed = updateProductScehma.safeParse(raw);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    error: parsed.error.message
                },
                { status: 400 }
            );
        }

        const product = await ProductModel.findByIdAndUpdate(
            id,
            parsed.data,
            { new: true }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Product updated successfully",
                data: product
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("PATCH /api/products error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/products/[id]">){
    await connectDB();

    try {
        requireAdmin(request);
    } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHENTICATED") {
            return NextResponse.json({ success: false, message: "Unauthenticated" }, { status: 401 });
        }
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const { id } = await ctx.params;

        if(!id){
            return NextResponse.json({
                success: false,
                message: "Invalid Product ID"
            }, { status: 400 });
        }

        const product = await ProductModel.findByIdAndDelete(id, {
            status: "OUT_OF_STOCK"
        });

        if(!product){
            return NextResponse.json({
                success: false,
                message: "Product not found"
            }, { status: 404})
        }

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("DELETE /api/products error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
