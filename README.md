# Aura Chat - Real-time Next.js 15 Application

A production-ready real-time chat application built with Next.js 15 (App Router), Socket.IO, MongoDB, and Zustand.

## Features

- **Hybrid Architecture**: Next.js App Router for UI/APIs + Standalone Node.js server for WebSockets.
- **Edge Middleware**: Low-latency authentication and route protection.
- **Real-time**: Instant messaging, typing indicators, and presence detection via Socket.IO.
- **Optimistic UI**: Instant feedback on message delivery with background synchronization.
- **Responsive Design**: Premium dark-themed UI with glassmorphism and animations.
- **Infinite Scroll**: Progressive loading of message history.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js (WebSockets) & Edge (Middleware)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- MongoDB instance (Local or Atlas)

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 4. Run the Application

#### Terminal 1: Next.js Development Server
```bash
npm run dev
```

#### Terminal 2: Socket.IO WebSocket Server
```bash
npm run socket
```

## Deployment

### Frontend (Next.js)
Deploy to **Vercel** as a standard Next.js project.

### Real-time Server (Socket.IO)
Deploy `server.js` to a Node.js hosting provider (Railway, Render, DigitalOcean, etc.).
Update `NEXT_PUBLIC_SOCKET_URL` in your Vercel environment variables to point to this server.

## Folder Structure
- `/app`: App Router pages and API routes.
- `/components`: Reusable UI components.
- `/lib`: Utilities (MongoDB, Auth).
- `/models`: Mongoose schemas.
- `/store`: Zustand state management.
- `/hooks`: Custom React hooks (Socket).
- `server.js`: The WebSocket server.
