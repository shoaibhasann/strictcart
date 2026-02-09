import connectDB from "@/src/lib/connectDB";
import { CreateUserInput, createUserSchema } from "@/src/lib/zod/user.schema";
import { UserModel } from "@/src/models/user.model";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { COOKIE_OPTIONS } from "@/src/lib/constants/cookie";


export async function POST(request : NextRequest){
    await connectDB();

    try {

        const raw = await request.json();
        const parsed = createUserSchema.safeParse(raw);

        if(!parsed.success){
            console.error(
                "Body validation error while creating product: ",
                parsed.error
            );
            return NextResponse.json({
                success: false,
                message: "Validation failed while creating user"
            }, { status: 400 });
        }

        const data : CreateUserInput = parsed.data;

        const isUserExists = await UserModel.findOne({ email: data.email });

        if(isUserExists){
            return NextResponse.json({
                success: false,
                message: "email already exists"
            });
        }

        const candidateHash = await bcrypt.hash(data.password, 10);

        const user = await UserModel.create({
            username: data.username,
            email: data.email,
            password: candidateHash,
        });

        if(!user){
            return NextResponse.json({
                success: false,
                message: "Failed to create user"
            }, { status: 400 });
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


        return NextResponse.json({
            success: true,
            message: "User created successfully"
        }, { status: 201 });


    } catch (err) {
        console.error("POST /auth/signup error: ", err);
        return NextResponse.json({
            success: false,
            message: "Internal Server Error"
        }, { status: 500 });
    }
}
