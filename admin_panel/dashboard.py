import streamlit as st
import socketio
import pandas as pd
import datetime
import time

# --- Configuration ---
st.set_page_config(page_title="Aura Chat Admin", layout="wide")
SOCKET_URL = "http://localhost:3001" # In production, use your Railway/Render URL

# --- State Management ---
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'online_users' not in st.session_state:
    st.session_state.online_users = 0

# --- Socket.IO Client ---
sio = socketio.Client()

@sio.event
def connect():
    print("Connected to Socket.IO server")

@sio.on("new_message")
def on_message(data):
    # Add timestamp
    data['received_at'] = datetime.datetime.now().strftime("%H:%M:%S")
    st.session_state.messages.append(data)
    # Limit to last 50 messages
    if len(st.session_state.messages) > 50:
        st.session_state.messages.pop(0)

@sio.on("online_users")
def on_online_users(users):
    st.session_state.online_users = len(users)

# --- UI Layout ---
st.title("🚀 Aura Chat Admin Dashboard")
st.markdown("---")

col1, col2, col3 = st.columns(3)
with col1:
    st.metric("Online Users", st.session_state.online_users)
with col2:
    st.metric("Total Messages (Session)", len(st.session_state.messages))
with col3:
    st.metric("Server Status", "🟢 Online" if sio.connected else "🔴 Offline")

st.subheader("📡 Live Message Feed")
if st.session_state.messages:
    df = pd.DataFrame(st.session_state.messages)
    st.table(df[['received_at', 'senderName', 'content', 'roomId']].tail(10))
else:
    st.info("Waiting for messages...")

# --- Sidebar Controls ---
st.sidebar.header("Connection Settings")
server_url = st.sidebar.text_input("Socket Server URL", value=SOCKET_URL)

if st.sidebar.button("Connect"):
    try:
        if sio.connected:
            sio.disconnect()
        sio.connect(server_url)
        st.sidebar.success("Connected!")
    except Exception as e:
        st.sidebar.error(f"Connection failed: {e}")

if st.sidebar.button("Disconnect"):
    sio.disconnect()
    st.sidebar.warning("Disconnected")

# --- Auto-Refresh Logic ---
# Streamlit doesn't natively support async background updates easily in the UI
# We use a simple loop or just let the user refresh
if sio.connected:
    time.sleep(2)
    st.rerun()
