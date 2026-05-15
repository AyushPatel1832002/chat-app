import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/models/Room";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    // Return rooms where user is a member OR public rooms
    const rooms = await Room.find({
      $or: [
        { isPrivate: false },
        { members: authUser.userId }
      ]
    }).populate("createdBy", "name").lean();

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPrivate } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Room name is required" }, { status: 400 });
    }

    await dbConnect();
    const room = await Room.create({
      name,
      description,
      isPrivate: !!isPrivate,
      createdBy: authUser.userId,
      members: [authUser.userId],
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
