import type { NextRequest } from "next/server";

export async function getId(request : NextRequest){
    return (
        request.headers.get("x-user-id") || request.headers.get("X-User-Id") || null
    )
}

export async function getRole(request: NextRequest){
    return (
        request.headers.get("x-user-role") || request.headers.get("X-User-Role") || null
    )
}

export async function requireAdmin(request: NextRequest) {
    const role = await getRole(request);

    if(!role){
        throw new Error("UNAUTHENTICATED");
    }

    if(role !== "ADMIN"){
        throw new Error("FORBIDDEN");
    }
}