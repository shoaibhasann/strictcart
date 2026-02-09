import { Secret } from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";
import { UserPayload } from "./models/user.model";
import jwt from "jsonwebtoken";

const secretKey : Secret = process.env.REFRESH_TOKEN_SECRET as Secret

export async function proxy(request : NextRequest){
    const { pathname} = new URL(request.url);
    const cookieToken = request.cookies.get("refreshToken")?.value;

    // No token case
    if(!cookieToken){
        if(pathname.startsWith("/admin")){
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    }

    // token is present 
    try {
        const { payload } = await jwt.verify(cookieToken, secretKey) as { payload: UserPayload };
        const role = payload.role;

        // if user is loggedin should not see login and signup page
        if((pathname === "/login" || pathname === "/signup") && role === "USER"){

            if(role === "ADMIN"){
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            
            return NextResponse.redirect(new URL("/", request.url));
        }
    } catch (error) {
        // invalid error -> token treat them as guest
        return NextResponse.redirect(new URL("/login", request.url));
        console.error("Error verifying token in proxy middleware: ", error);
    }
}