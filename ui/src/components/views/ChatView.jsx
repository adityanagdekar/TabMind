import { useState, useEffect, useRef } from "react";
import { getMessagesByProject, saveMessage } from "../../db";
import { getRelevantContext, sendChatMessage } from "../../chat";
import "../../../style/ChatView.css";

// Helper function to render message content with clickable URLs
function MessageContent({ content }) {
  // URL regex pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlPattern);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part is a URL
        if (part.match(urlPattern)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "blue",
                textDecoration: "underline",
                fontWeight: "500",
              }}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}

export default function ChatView({ activeProjectId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, [activeProjectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadChatHistory() {
    try {
      const history = await getMessagesByProject(activeProjectId);
      console.log("Loaded chat history:", history);
      setMessages(history);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSend() {
    const userMessage = inputMessage.trim();
    if (!userMessage) return;

    setInputMessage("");
    setError(null);
    setLoading(true);

    try {
      // Save user message
      await saveMessage({
        projectId: activeProjectId,
        role: "user",
        content: userMessage,
      });

      // Update UI with user message
      const userMsg = {
        projectId: activeProjectId,
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Get relevant context from browsing history
      const { context, maxScore, isRelevant } = await getRelevantContext(userMessage, activeProjectId);
      console.log(`[handleSend] Relevance score: ${maxScore.toFixed(3)}, Is relevant: ${isRelevant}`);

      // Check if query is related to browsing history
      if (!isRelevant) {
        throw new Error(
          "This question doesn't seem related to your browsing history. Please ask questions about pages you've visited."
        );
      }

      // Call chat API
      const aiResponse = await sendChatMessage(userMessage, context);
      // console.log("[handleSend] AI response:", aiResponse);

      // Save AI response
      await saveMessage({
        projectId: activeProjectId,
        role: "assistant",
        content: aiResponse,
      });

      // Update UI with AI message
      const aiMsg = {
        projectId: activeProjectId,
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="chat-view">
      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <p>No messages yet. Start a conversation about your browsing history!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === "user" ? "message-user" : "message-assistant"}`}
              >
                <div className="message-bubble">
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message message-assistant">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="chat-error">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
            </svg>
            {error}
          </div>
        )}

        <div className="chat-input-container">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your browsing history..."
            className="chat-input"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputMessage.trim()}
            className="chat-send-button"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
