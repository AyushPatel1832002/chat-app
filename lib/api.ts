const getApiUrl = () => {
  if (typeof window !== "undefined") {
    // In the browser, if we are not on localhost/127.0.0.1, default to relative paths to use Next.js Route Handlers
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "";
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

export const API_URL = getApiUrl();
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      ...options.headers,
    },
    // Required for cookies to be sent/received cross-origin
    credentials: "include",
  };

  const response = await fetch(url, defaultOptions);
  return response;
};
