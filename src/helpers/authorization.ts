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