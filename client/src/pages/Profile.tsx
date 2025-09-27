import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";
import { useNavigate } from "react-router-dom";

interface Me {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  ratingAverage?: number | null;
  ratingsCount?: number;
}

const Profile: React.FC = () => {
  const [me, setMe] = useState<Me | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const { success, error: showError, info } = useToast();

  async function load() {
    try {
      const r = await api.get("/users/me");
      setMe(r.data.data);
      setName(r.data.data.name);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function updateProfile() {
    setSaving(true);
    setMsg("");
    try {
      await api.patch("/users/me/profile", { name });
      success("Đã lưu");
      await load();
    } catch (e: any) {
      showError(e.response?.data?.message || "Lỗi");
    } finally {
      setSaving(false);
    }
  }

  async function updateAvatar() {
    if (!avatar) return;
    setSaving(true);
    setMsg("");
    try {
      const form = new FormData();
      form.append("image", avatar);
      const up = await fetch("http://localhost:8080/api/uploads/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: form,
      });
      if (!up.ok) throw new Error("Upload thất bại");
      const data = await up.json();
      await api.patch("/users/me/avatar", { avatarUrl: data.data.url });
      success("Đã cập nhật ảnh");
      await load();
    } catch (e: any) {
      showError(e.message || "Lỗi upload");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="container py-4">Đang tải...</div>;
  if (!me) return <div className="container py-4">Không tải được hồ sơ</div>;

  return (
    <div className="container py-4">
      <h3>Hồ sơ của tôi</h3>
      {msg && <div className="alert alert-info py-2">{msg}</div>}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card p-3 text-center">
            <div className="mb-3">
              {me.avatarUrl ? (
                <img
                  src={me.avatarUrl}
                  alt="avatar"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  className="bg-secondary text-light d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    fontSize: 40,
                  }}
                >
                  {me.name.charAt(0)}
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="form-control form-control-sm mb-2"
              onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            />
            <button
              disabled={!avatar || saving}
              onClick={updateAvatar}
              className="btn btn-sm btn-outline-primary"
            >
              Cập nhật ảnh
            </button>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card p-3">
            <div className="mb-3">
              <label className="form-label small">Tên hiển thị</label>
              <input
                className="form-control form-control-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3 small text-muted">Email: {me.email}</div>
            {me.ratingAverage != null && (
              <div className="mb-2 small d-flex align-items-center gap-2">
                <span>
                  Đánh giá: {me.ratingAverage} ({me.ratingsCount} lượt)
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => navigate(`/users/${me.id}/ratings`)}
                >
                  Xem chi tiết
                </button>
              </div>
            )}
            <button
              className="btn btn-sm btn-primary"
              disabled={saving}
              onClick={updateProfile}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
