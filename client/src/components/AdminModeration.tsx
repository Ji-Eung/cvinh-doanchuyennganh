import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "./ToastProvider";

interface PendingPost {
  _id: string;
  title: string;
  price: number;
  status: string;
  sellerId: string;
}

const AdminModeration: React.FC = () => {
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await api.get("/posts?status=pending&limit=50&page=1");
      setPosts(r.data.data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || "Không tải được danh sách");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const { success, error: showError, info } = useToast();

  async function approve(id: string) {
    try {
      await api.patch(`/admin/posts/${id}/approve`);
      setPosts((arr) => arr.filter((p) => p._id !== id));
      success("Đã duyệt");
    } catch (e) {
      showError("Lỗi duyệt");
    }
  }

  async function reject(id: string) {
    const reason = window.prompt("Lý do từ chối?");
    if (reason == null || !reason.trim()) {
      info("Hủy");
      return;
    }
    try {
      await api.patch(`/admin/posts/${id}/reject`, { reason });
      setPosts((arr) => arr.filter((p) => p._id !== id));
      success("Đã từ chối");
    } catch (e) {
      showError("Lỗi từ chối");
    }
  }

  if (loading) return <div className="container py-4">Đang tải...</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-3">Duyệt bài chờ</h3>
      {posts.length === 0 && <div className="text-muted">Không có bài chờ</div>}
      <div className="row g-3">
        {posts.map((p) => (
          <div className="col-12 col-md-6" key={p._id}>
            <div className="card">
              <div className="card-body">
                <h6 className="card-title mb-1">{p.title}</h6>
                <div className="small mb-2">
                  Giá: {p.price.toLocaleString()} VNĐ
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => approve(p._id)}
                  >
                    Duyệt
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => reject(p._id)}
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminModeration;
