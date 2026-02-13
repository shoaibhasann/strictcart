import { getId } from "@/src/helpers/authorization";
import connectDB from "@/src/lib/connectDB";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const cookieOptionDefaults : Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
};

export async function GET(request: NextRequest){
    await connectDB();

    try {
        const userId = await getId(request);

        if(!userId){
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const cookieStore = await cookies();

        cookieStore.set({
                    name: "refreshToken",
                    value: "",
                    ...cookieOptionDefaults
                });

        return NextResponse.json({
            success: false,
            message: "Logged out successfully"
        }, { status: 200 });


    } catch (error) {
        console.error("GET /api/auth/logout error:", error);
        return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
    }
}