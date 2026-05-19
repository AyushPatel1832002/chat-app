export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
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
