import connectDB from "@/src/lib/connectDB";
import { COOKIE_OPTIONS } from "@/src/lib/constants/cookie";
import { UserModel } from "@/src/models/user.model";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest){
    await connectDB();

    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const user = await UserModel.findOne({ email});

        if(!user){
            return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
        }

        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){
            return NextResponse.json({
                success: false,
                message: "Password is incorrect"
            }, { status: 401 });
        }

        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save();

        const cookieStore = await cookies();

        cookieStore.set({
            name: "refreshToken",
            value: refreshToken,
            ...COOKIE_OPTIONS
        });

    } catch (error) {
        console.error("POST /api/auth/login error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}