import React, { useEffect, useState, useRef } from "react";
import { api } from "../api";

interface Noti {
  _id: string;
  type: string;
  message: string;
  data?: any;
  readAt?: string;
  createdAt: string;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Noti[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get("/notifications");
      setItems(r.data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (open && items.length === 0) load();
  }, [open]);

  // SSE realtime
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return; // chỉ khi đăng nhập
    const es = new EventSource(
      `http://localhost:8080/api/notifications/stream?token=${encodeURIComponent(
        token
      )}`
    );
    es.onmessage = () => {}; // noop
    es.addEventListener("notification", (e: any) => {
      try {
        const data = JSON.parse(e.data);
        setItems((prev) =>
          [
            {
              _id: data.id,
              type: data.type,
              message: data.message,
              data: data.data,
              createdAt: data.createdAt,
              readAt: undefined,
            },
            ...prev,
          ].slice(0, 100)
        );
      } catch {}
    });
    es.onerror = () => {
      es.close();
    }; // dừng nếu lỗi liên tục
    return () => es.close();
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  async function markRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((arr) =>
        arr.map((n) =>
          n._id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch {}
  }

  const unread = items.filter((i) => !i.readAt).length;

  function go(n: Noti) {
    markRead(n._id);
    if (n.type.startsWith("post.") && n.data?.postId) {
      window.location.href = `/posts/${n.data.postId}`;
    } else if (n.type.startsWith("tx.") && n.data?.transactionId) {
      window.location.href = `/transactions/${n.data.transactionId}`;
    }
  }

  async function markAll() {
    try {
      await api.post("/notifications/mark-all-read");
      setItems((arr) =>
        arr.map((n) =>
          n.readAt ? n : { ...n, readAt: new Date().toISOString() }
        )
      );
    } catch {}
  }

  return (
    <div className="notification-bell" ref={ref}>
      <button
        type="button"
        className="btn btn-sm btn-outline-light position-relative"
        onClick={() => setOpen((o) => !o)}
      >
        <i className="fas fa-bell"></i>
        {unread > 0 && <span className="count">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown-noti">
          <div className="p-2 border-bottom d-flex justify-content-between align-items-center gap-2">
            <strong>Thông báo</strong>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-link p-0"
                onClick={markAll}
                disabled={loading || unread === 0}
                title="Đánh dấu tất cả đã đọc"
              >
                ✓
              </button>
              <button
                className="btn btn-sm btn-link p-0"
                onClick={load}
                disabled={loading}
              >
                {loading ? "..." : "↻"}
              </button>
            </div>
          </div>
          {items.length === 0 && (
            <div className="p-3 text-muted small">Không có thông báo</div>
          )}
          {items.map((n) => (
            <div
              key={n._id}
              className={`item ${!n.readAt ? "unread" : ""}`}
              onClick={() => go(n)}
            >
              <div className="small">{n.message}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default NotificationBell;
