import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    
    cookieStore.set("access_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0, 
      path: "/"
    });

    cookieStore.set("refresh_token", "", {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 0,
      path: "/"
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { message: "Error during logout" },
      { status: 500 }
    );
  }
}
