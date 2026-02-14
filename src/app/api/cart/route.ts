import { getId } from "@/src/helpers/authorization";
import connectDB from "@/src/lib/connectDB";
import { CartModel } from "@/src/models/cart.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    await connectDB();

    try {
        const userId = await getId(request);

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const cart = await CartModel.findOne({ userId }).populate({
            path: "items.productId",
            select: "title priceSnapshot quantity stock",
        });

        if (!cart) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Cart is empty",
                    data: { items: [] },
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Cart fetched successfully",
                data: cart,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/cart error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
