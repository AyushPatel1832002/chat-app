import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message } from "@/models/Message";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { content, roomId, tempId } = await req.json();

    if (!content || !roomId) {
      return NextResponse.json({ error: "Missing content or roomId" }, { status: 400 });
    }

    const message = await Message.create({
      senderId: user.userId,
      senderName: user.name,
      content,
      roomId,
      tempId,
      delivered: true,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
