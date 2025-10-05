import axios from "axios";

const API_BASE = "http://localhost:8000/api";
const MCP_GATEWAY = "http://localhost:8080";

/**
 * Check network connectivity status via MCP Gateway
 * Returns: { online: boolean, cerebras_available: boolean }
 */
export async function checkNetworkStatus() {
  try {
    const response = await fetch(`${MCP_GATEWAY}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    return {
      online: data.online || false,
      cerebras_available: data.cerebras_available || false
    };
  } catch (error) {
    console.error("Network check failed:", error);
    return {
      online: false,
      cerebras_available: false
    };
  }
}

export async function sendMessage(sessionId, query, isOnline, onChunk, onFallback, abortSignal) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      query: query,
      online: isOnline,
    }),
    signal: abortSignal, // Add abort signal support
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            const parsed = JSON.parse(data);
            
            // Handle fallback notification
            if (parsed.fallback) {
              console.warn("Online model failed, falling back to offline model");
              if (onFallback) {
                onFallback();
              }
              // Continue to next chunk - the offline content will follow
              continue;
            }
            
            // Handle error
            if (parsed.error) {
              console.error("Stream error:", parsed.error);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            }
            
            // Handle normal content
            if (parsed.content && !parsed.error) {
              onChunk(parsed.content);
            }
          } catch (e) {
            // Skip invalid JSON
            console.warn("Could not parse chunk:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function clearChat(sessionId) {
  await axios.post(`${API_BASE}/chat/clear/${sessionId}`);
}
