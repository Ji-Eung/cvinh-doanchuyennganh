import React, { useEffect, useState, useCallback, useRef } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import { PostListItem, FavoriteItemDto } from "../types/api";

interface FavoriteMap {
  [postId: string]: boolean;
}

interface Post extends PostListItem {}

const Posts: React.FC = () => {
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteMap>({});
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("approved");

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    return params;
  };

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setNextCursor(null);
    try {
      const params = buildSearchParams();
      const r = await api.get(`/posts?${params.toString()}`);
      setItems(r.data.data || []);
      setNextCursor(r.data.meta?.cursor || null);
      try {
        const fav = await api.get("/favorites");
        const map: FavoriteMap = {};
        (fav.data.data || []).forEach((f: FavoriteItemDto) => {
          if (f.post?._id) map[f.post._id] = true;
        });
        setFavorites(map);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [q, minPrice, maxPrice, status]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const params = buildSearchParams();
      params.set("cursor", nextCursor);
      const r = await api.get(`/posts?${params.toString()}`);
      setItems((prev) => [...prev, ...(r.data.data || [])]);
      setNextCursor(r.data.meta?.cursor || null);
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, q, minPrice, maxPrice, status]);

  // Infinite scroll observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const { error: showError } = useToast();
  async function toggleFavorite(id: string) {
    try {
      await api.post("/favorites/toggle", { postId: id });
      setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
    } catch {
      showError("Không thể cập nhật yêu thích");
    }
  }

  if (loading) return <div className="container py-4">Đang tải...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h3 className="m-0">Danh sách bài đăng</h3>
        <Link className="btn btn-sm btn-primary" to="/posts/new">
          Đăng bài
        </Link>
      </div>
      <form
        className="filter-bar row g-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          loadInitial();
        }}
      >
        <div className="col-auto">
          <input
            className="form-control form-control-sm"
            placeholder="Tìm..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Giá từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <select
            className="form-select form-select-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="sold">Đã bán</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
        <div className="col-auto">
          <button className="btn btn-sm btn-secondary" type="submit">
            Lọc
          </button>
        </div>
      </form>
      {items.length === 0 && !loading && (
        <div className="text-muted">Chưa có bài đăng</div>
      )}
      <div className="row g-3">
        {items.map((p) => (
          <div className="col-6 col-md-3" key={p.id}>
            <div className="card h-100">
              <Link
                to={`/posts/${p.id}`}
                className="ratio ratio-1x1 bg-secondary d-block"
              />
              <div className="card-body p-2">
                <div className="small text-truncate fw-semibold">{p.title}</div>
                <div className="fw-bold text-danger">
                  {p.price.toLocaleString()} VNĐ
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span className="badge bg-light text-dark text-capitalize">
                    {p.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(p.id)}
                    className={`btn btn-sm ${
                      favorites[p.id] ? "btn-warning" : "btn-outline-secondary"
                    }`}
                    title="Yêu thích"
                  >
                    ★
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="py-3 text-center text-muted small">
        {loadingMore
          ? "Đang tải thêm..."
          : nextCursor
          ? "Kéo xuống để tải thêm"
          : items.length > 0 && "Hết dữ liệu"}
      </div>
    </div>
  );
};
export default Posts;
