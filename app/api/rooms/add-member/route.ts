import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, userId, userEmail } = await req.json();
    if (!roomId || (!userId && !userEmail)) {
      return NextResponse.json({ error: "Room ID and User (ID or Email) are required" }, { status: 400 });
    }

    await dbConnect();
    
    let targetUserId = userId;
    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return NextResponse.json({ error: "User with this email not found" }, { status: 404 });
      }
      targetUserId = user._id;
    }

    // Check if user is the creator or already a member
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.members.includes(targetUserId)) {
      room.members.push(targetUserId);
      await room.save();
    }

    return NextResponse.json({ message: "User added successfully", room }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
