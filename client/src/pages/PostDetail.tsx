import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";

interface Post {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  status: string;
  sellerRatingAverage?: number | null;
  sellerId: string;
  rejectionReason?: string;
}

interface Me {
  _id: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [pr, mr] = await Promise.all([
          api.get(`/posts/${id}`),
          api.get("/users/me").catch(() => null),
        ]);
        setPost(pr.data.data);
        if (mr) setMe(mr.data.data);
      } catch (e: any) {
        setError(e.response?.data?.message || "Không tải được bài viết");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const createTransaction = async () => {
    if (!post) return;
    if (!window.confirm("Tạo giao dịch cho bài đăng này?")) return;
    try {
      const r = await api.post("/transactions", { postId: post._id });
      success("Đã tạo giao dịch");
      navigate(`/transactions/${r.data.data._id}`);
    } catch (e: any) {
      showError(e.response?.data?.message || "Lỗi tạo giao dịch");
    }
  };

  const startChat = () => {
    if (!post) return;
    navigate(`/chat/${post.sellerId}`);
  };

  const viewRatings = () => {
    if (!post) return;
    navigate(`/users/${post.sellerId}/ratings`);
  };

  const reportSeller = async () => {
    if (!post) return;
    const reason = prompt("Nhập lý do báo cáo người bán (>=5 ký tự)");
    if (!reason || reason.trim().length < 5) return;
    try {
      await api.post("/reports", { reportedUserId: post.sellerId, reason });
      success("Đã gửi báo cáo");
    } catch (e: any) {
      showError(e.response?.data?.message || "Lỗi báo cáo");
    }
  };

  const reportPost = async () => {
    if (!post) return;
    const reason = prompt("Nhập lý do báo cáo bài đăng (>=5 ký tự)");
    if (!reason || reason.trim().length < 5) return;
    try {
      await api.post("/reports", { postId: post._id, reason });
      success("Đã gửi báo cáo");
    } catch (e: any) {
      showError(e.response?.data?.message || "Lỗi báo cáo");
    }
  };

  if (loading) return <div className="container py-4">Đang tải...</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;
  if (!post) return <div className="container py-4">Không tìm thấy</div>;

  return (
    <div className="container py-4">
      <h3>{post.title}</h3>
      <div className="text-danger h5">{post.price.toLocaleString()} VNĐ</div>
      <div className="mb-2 small text-capitalize">
        Trạng thái: {post.status}
      </div>
      {post.status === "approved" && me && me._id !== post.sellerId && (
        <div className="mb-3 d-flex flex-wrap gap-2">
          <button
            className="btn btn-sm btn-primary"
            onClick={createTransaction}
          >
            Tạo giao dịch
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={startChat}
          >
            Chat
          </button>
          <button className="btn btn-sm btn-outline-info" onClick={viewRatings}>
            Xem đánh giá
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={reportPost}
          >
            Báo cáo bài
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={reportSeller}
          >
            Báo cáo người bán
          </button>
        </div>
      )}
      {post.rejectionReason && (
        <div className="alert alert-warning p-2 small">
          Từ chối: {post.rejectionReason}
        </div>
      )}
      {post.sellerRatingAverage != null && (
        <div className="mb-2">
          Đánh giá người bán: {post.sellerRatingAverage} / 5
        </div>
      )}
      <p>
        {post.description || <em className="text-muted">(Không có mô tả)</em>}
      </p>
      <div className="row g-2">
        {post.images?.map((img) => (
          <div className="col-4" key={img}>
            <img
              src={/^(http|https)/.test(img) ? img : `/uploads/${img}`}
              alt="img"
              className="img-fluid rounded border"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default PostDetail;
