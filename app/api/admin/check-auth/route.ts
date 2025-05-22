import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Get token from cookies
    const token = cookies().get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    try {
      const decoded = verify(token, process.env.JWT_SECRET || "telegram-mini-app-secret");
      
      if (!decoded || !(decoded as any).isAdmin) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        );
      }

      return NextResponse.json({ authenticated: true });
    } catch (error) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Authentication check failed" },
      { status: 500 }
    );
  }
}