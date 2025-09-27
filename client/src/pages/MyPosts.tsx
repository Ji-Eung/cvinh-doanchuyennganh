import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

interface Post {
  _id: string;
  title: string;
  price: number;
  status: string;
  createdAt: string;
}

const MyPosts: React.FC = () => {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { error: showError } = useToast();
  async function load() {
    setLoading(true);
    setError("");
    try {
      const r = await api.get("/posts/mine/list");
      setItems(r.data.data || []);
    } catch (e: any) {
      const msg = e.response?.data?.message || "Lỗi tải";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="container py-4">Đang tải...</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Bài của tôi</h3>
        <Link to="/posts/new" className="btn btn-sm btn-primary">
          Đăng bài
        </Link>
      </div>
      <div className="table-responsive">
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id}>
                <td>
                  <Link to={`/posts/${p._id}`}>{p.title}</Link>
                </td>
                <td>{p.price.toLocaleString()} VNĐ</td>
                <td className="text-capitalize">
                  <span className="badge bg-light text-dark">{p.status}</span>
                </td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted small">
                  Chưa có bài
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MyPosts;
