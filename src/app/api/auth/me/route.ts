import { getId } from "@/src/helpers/authorization";
import connectDB from "@/src/lib/connectDB";
import { UserModel } from "@/src/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest){
    await connectDB();
    try {
        const userId = await getId(request);

        if(!userId){
            return NextResponse.json({
                success: false,
                message: "Unauthroized"
            }, { status: 401 });
        }

        const user = await UserModel.findById(userId).select("-refreshToken");

        if(!user){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "User fetched successfully",
            isAuthenticated: true,
            data: user
        });

    } catch (error) {
        console.error("GET: /api/auth/me error: ", error);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}