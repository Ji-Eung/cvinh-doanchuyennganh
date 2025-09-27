import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/ToastProvider";

interface MessageDTO {
  _id?: string;
  id?: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { id: otherId } = useParams();
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    if (!otherId) return;
    setLoading(true);
    try {
      const res = await api.get(`/chat/with/${otherId}`);
      setMessages(res.data?.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi tải tin nhắn");
    } finally {
      setLoading(false);
      scrollBottom();
    }
  };

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [otherId]);

  // Realtime SSE
  useEffect(() => {
    if (!otherId) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    const url = new URL("http://localhost:8080/api/chat/stream");
    url.searchParams.set("token", token);
    url.searchParams.set("withUser", otherId);
    const es = new EventSource(url.toString());
    es.addEventListener("message", (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setMessages((prev) => {
          // avoid duplicate (if we already optimistic-added when sending)
          const exists = prev.some(
            (m) =>
              m.createdAt === data.createdAt &&
              m.body === data.body &&
              m.fromUserId === data.fromUserId
          );
          if (exists) return prev;
          return [...prev, data];
        });
        scrollBottom();
      } catch {}
    });
    es.onerror = () => {
      es.close();
    };
    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId]);

  const scrollBottom = () => {
    requestAnimationFrame(() => {
      if (boxRef.current)
        boxRef.current.scrollTop = boxRef.current.scrollHeight;
    });
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !otherId) return;
    const body = input.trim();
    setInput("");
    try {
      await api.post("/chat/send", { toUserId: otherId, body });
      setMessages((m) => [
        ...m,
        {
          fromUserId: user!.id,
          toUserId: otherId,
          body,
          createdAt: new Date().toISOString(),
        } as any,
      ]);
      scrollBottom();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gửi thất bại");
    }
  };

  if (!user) return <div className="container py-4">Hãy đăng nhập.</div>;

  return (
    <div className="container py-4">
      <h3>Chat</h3>
      {loading && <div>Đang tải...</div>}
      <div
        ref={boxRef}
        className="border rounded p-2 mb-3"
        style={{ height: "50vh", overflowY: "auto", background: "#fafafa" }}
      >
        {messages.map((m, i) => {
          const mine = m.fromUserId === user.id;
          return (
            <div
              key={i}
              className={`d-flex ${mine ? "justify-content-end" : ""} mb-2`}
            >
              <div
                className={`p-2 rounded ${
                  mine ? "bg-primary text-white" : "bg-light"
                }`}
                style={{ maxWidth: "70%" }}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                <div className="small text-muted text-end">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })}
        {!loading && messages.length === 0 && (
          <div className="text-muted">Chưa có tin nhắn.</div>
        )}
      </div>
      <form onSubmit={send} className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="btn btn-primary"
          type="submit"
          disabled={!input.trim()}
        >
          Gửi
        </button>
      </form>
    </div>
  );
};
export default Chat;
