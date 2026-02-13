import { Secret } from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";
import { UserPayload } from "./models/user.model";
import jwt from "jsonwebtoken";

const secretKey: Secret = process.env.REFRESH_TOKEN_SECRET as Secret

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
        const decoded = jwt.verify(cookieToken, secretKey) as UserPayload;
        console.log("payload", decoded);
        const role = decoded.role;

        // if user is loggedin should not see login and signup page
        if(pathname === "/login" || pathname === "/signup"){
            if(role === "ADMIN"){
                return NextResponse.redirect(new URL("/admin", request.url));
            }
                return NextResponse.redirect(new URL("/", request.url));
        }

        // Admin only protection
        if(pathname === "/admin" && role !== "ADMIN"){
            return NextResponse.redirect(new URL("/", request.url));
        }

        // Provider only protection
        if(pathname === "/provider" && role !== "PROVIDER"){
            return NextResponse.redirect(new URL("/", request.url));
        }

        // set header in the request
        const headers = new Headers(request.headers);
        headers.set("x-user-id", String(decoded._id));
        if(role) headers.set("x-user-role", role);

        return NextResponse.next({ request: { headers }});


    } catch (error) {
        // invalid error -> token treat them as guest
        console.error("Error verifying token in proxy middleware: ", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }
}


export const config = {
    matcher: ["/api/auth/:path*"]
}