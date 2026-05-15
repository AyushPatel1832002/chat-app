import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    const payload = await getAuthUser();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select("-password");
    
    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 401 });
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
