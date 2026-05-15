const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

// --- Environment Configuration ---
const envPath = path.resolve(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    const value = valueParts.join("=").trim();
    if (key && value) {
      const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
      process.env[key.trim()] = cleanValue;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-12345";
const CLIENT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!MONGODB_URI) {
  console.error("CRITICAL: MONGODB_URI is not defined.");
  process.exit(1);
}

// --- Database Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Models ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  lastEmailSentAt: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  roomId: { type: String, required: true },
  delivered: { type: Boolean, default: true },
  read: { type: Boolean, default: false },
  tempId: { type: String },
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model("Room", RoomSchema);

// --- Express Setup ---
const app = express();
const httpServer = createServer(app);

// Security Middleware
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
  origin: [CLIENT_URL, "http://localhost:3000", "https://*.netlify.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use("/api/auth", limiter);

// --- Auth Middleware ---
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API Routes ---

// 1. Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", { sameSite: "none", secure: true });
  res.status(200).json({ message: "Logged out" });
});

// 2. User Routes
app.get("/api/users", authenticate, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } })
      .select("_id name email avatar lastSeen")
      .lean();
    
    // Inject online status from Socket memory
    const usersWithStatus = users.map(u => ({
      ...u,
      isOnline: onlineUsers.has(String(u._id))
    }));

    res.status(200).json({ users: usersWithStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Room Routes
app.get("/api/rooms", authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { isPrivate: false },
        { members: req.user.userId },
        { createdBy: req.user.userId }
      ]
    }).populate("members", "name avatar");
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/create", authenticate, async (req, res) => {
  try {
    const { name, description, isPrivate, members } = req.body;
    const room = await Room.create({
      name,
      description,
      isPrivate,
      members: members || [req.user.userId],
      createdBy: req.user.userId
    });
    res.status(201).json({ room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/add-member", authenticate, async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    res.status(200).json({ room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 4. Message Routes
app.get("/api/messages/history", authenticate, async (req, res) => {
  try {
    const { roomId } = req.query;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Socket.IO Section ---
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
});

const { sendOfflineMessageEmail } = require("./services/emailService");

const onlineUsers = new Map(); // userId -> { socketIds: Set, name }

async function handleOfflineNotification(recipientId, senderName, content) {
  try {
    const recipient = await User.findById(recipientId);
    if (!recipient || !recipient.email) return;

    const COOLDOWN_MINUTES = 15;
    const now = new Date();
    const lastSent = recipient.lastEmailSentAt;

    if (!lastSent || (now - new Date(lastSent)) > (COOLDOWN_MINUTES * 60 * 1000)) {
      await User.findByIdAndUpdate(recipientId, { lastEmailSentAt: now });
      sendOfflineMessageEmail({
        to: recipient.email,
        senderName: senderName,
        messagePreview: content
      }).catch(err => console.error("[Email] Async email error:", err));
    }
  } catch (error) {
    console.error("Offline notification failed:", error);
  }
}

io.on("connection", (socket) => {
  const { userId, name } = socket.handshake.query;
  
  if (userId && userId !== "undefined") {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, { socketIds: new Set(), name });
    }
    onlineUsers.get(userId).socketIds.add(socket.id);
    socket.join(userId);
    io.emit("online_users", Array.from(onlineUsers.keys()));
    socket.emit("online_users", Array.from(onlineUsers.keys()));
    console.log(`User ${name} connected: ${userId}`);
  }

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send_message", async (data) => {
    const { roomId, content, tempId } = data;
    try {
      const savedMessage = await Message.create({
        senderId: userId,
        senderName: name,
        content,
        roomId,
        tempId,
      });

      const message = {
        ...data,
        _id: savedMessage._id,
        senderId: userId,
        senderName: name,
        createdAt: savedMessage.createdAt,
      };

      socket.to(roomId).emit("new_message", message);
      
      if (roomId.includes("-")) {
        const recipientId = roomId.split("-").find(id => id !== String(userId));
        if (recipientId && recipientId !== "undefined") {
          if (onlineUsers.has(recipientId)) {
            io.to(recipientId).emit("new_message", message);
          } else {
            handleOfflineNotification(recipientId, name, content);
          }
        }
      }
      
      socket.emit("message_delivered", { roomId, tempId, messageId: savedMessage._id });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    if (userId && onlineUsers.has(userId)) {
      const userPresence = onlineUsers.get(userId);
      userPresence.socketIds.delete(socket.id);
      if (userPresence.socketIds.size === 0) {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
    }
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
