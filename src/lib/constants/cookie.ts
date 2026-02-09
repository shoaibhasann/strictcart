import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
};
