import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

interface Fav {
  _id: string;
  postId?: { _id: string; title: string; price: number; status: string };
}

const Favorites: React.FC = () => {
  const [items, setItems] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/favorites");
        setItems(r.data.data || []);
      } catch {
        showError("Lỗi tải danh sách yêu thích");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) return <div className="container py-4">Đang tải...</div>;
  return (
    <div className="container py-4">
      <h3 className="mb-3">Yêu thích</h3>
      <div className="row g-3">
        {items.map(
          (f) =>
            f.postId && (
              <div className="col-6 col-md-3" key={f._id}>
                <div className="card product-card h-100">
                  <Link
                    to={`/posts/${f.postId._id}`}
                    className="ratio ratio-1x1 bg-secondary d-block"
                  />
                  <div className="card-body p-2">
                    <div className="small text-truncate">{f.postId.title}</div>
                    <div className="fw-bold text-danger">
                      {f.postId.price.toLocaleString()} VNĐ
                    </div>
                    <span className="badge bg-light text-dark text-capitalize">
                      {f.postId.status}
                    </span>
                  </div>
                </div>
              </div>
            )
        )}
        {items.length === 0 && (
          <div className="col-12 text-muted small">Chưa có mục yêu thích</div>
        )}
      </div>
    </div>
  );
};
export default Favorites;
