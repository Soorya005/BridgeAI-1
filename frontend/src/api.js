import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export async function sendMessage(sessionId, query) {
  const res = await axios.post(`${API_BASE}/chat`, {
    session_id: sessionId,
    query: query,
  });
  return res.data.response;
}

export async function clearChat(sessionId) {
  await axios.post(`${API_BASE}/chat/clear/${sessionId}`);
}
