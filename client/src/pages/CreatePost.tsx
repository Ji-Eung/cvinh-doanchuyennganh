import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

interface Category {
  _id: string;
  name: string;
}

const CreatePost: React.FC = () => {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/categories");
        setCategories(r.data.data || []);
      } catch {}
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/posts", {
        title,
        price: Number(price),
        categoryId,
        images,
      });
      nav("/");
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi tạo bài");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <h3 className="mb-3">Đăng bài mới</h3>
      <form className="vstack gap-3" onSubmit={submit}>
        <input
          className="form-control"
          placeholder="Tiêu đề"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="form-control"
          placeholder="Giá"
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <select
          className="form-select"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- Chọn danh mục --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <div>
          <label className="form-label">Hình ảnh (tối đa 8)</label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {images.map((img, i) => (
              <div key={i} className="position-relative">
                <img
                  src={/^(http|https)/.test(img) ? img : `/uploads/${img}`}
                  style={{ width: 90, height: 90, objectFit: "cover" }}
                  className="rounded border"
                />
                <button
                  type="button"
                  className="btn-close btn-close-white position-absolute top-0 end-0"
                  onClick={() =>
                    setImages((arr) => arr.filter((_, x) => x !== i))
                  }
                  style={{ background: "rgba(0,0,0,0.5)" }}
                />
              </div>
            ))}
            {images.length < 8 && (
              <label
                className="border rounded d-flex align-items-center justify-content-center"
                style={{ width: 90, height: 90, cursor: "pointer" }}
              >
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    const form = new FormData();
                    form.append("image", file);
                    try {
                      const r = await api.post("/uploads/image", form, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      setImages((arr) => [...arr, r.data.data.filename]);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                {uploading ? (
                  <span className="small text-muted">Đang tải...</span>
                ) : (
                  <span className="display-6">+</span>
                )}
              </label>
            )}
          </div>
        </div>
        {error && <div className="text-danger small">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Đang lưu..." : "Tạo bài"}
        </button>
      </form>
    </div>
  );
};
export default CreatePost;
