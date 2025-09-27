import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../components/ToastProvider";

interface Tx {
  id?: string; // new DTO field
  _id?: string; // legacy
  postId: string;
  buyerId: { _id: string; name: string };
  sellerId: { _id: string; name: string };
  priceAtSale: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  rated?: boolean;
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams();
  const [tx, setTx] = useState<Tx | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { success, error: showError } = useToast();

  const load = async () => {
    try {
      const r = await api.get(`/transactions/${id}`);
      setTx(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Lỗi tải");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  const action = async (kind: "complete" | "cancel") => {
    if (!id) return;
    if (!window.confirm("Xác nhận thực hiện?")) return;
    try {
      await api.post(`/transactions/${id}/${kind}`);
      success("Đã cập nhật");
      await load();
    } catch (e: any) {
      showError(e.response?.data?.message || "Lỗi thao tác");
    }
  };

  const submitRating = async () => {
    if (!tx) return;
    setSubmitting(true);
    try {
      await api.post("/ratings", {
        toUserId: tx.sellerId._id,
        transactionId: tx.id || tx._id,
        score: rating,
        comment,
      });
      success("Đã gửi đánh giá");
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-4">Đang tải...</div>;
  if (error) return <div className="container py-4 text-danger">{error}</div>;
  if (!tx) return null;

  const canRate = tx.status === "completed" && !tx.rated; // server flags rated

  return (
    <div className="container py-4">
      <h3>Chi tiết giao dịch</h3>
      <div className="card p-3 shadow-sm mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <div>
              <strong>Mã:</strong> {tx.id || tx._id}
            </div>
            <div>
              <strong>Bài đăng:</strong>{" "}
              <a href={`/posts/${tx.postId}`}>{tx.postId}</a>
            </div>
            <div>
              <strong>Giá:</strong> {tx.priceAtSale.toLocaleString()} VNĐ
            </div>
            <div>
              <strong>Trạng thái:</strong>{" "}
              <span className="badge bg-info text-dark">{tx.status}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div>
              <strong>Người bán:</strong> {tx.sellerId.name}
            </div>
            <div>
              <strong>Người mua:</strong> {tx.buyerId.name}
            </div>
            <div>
              <strong>Tạo lúc:</strong>{" "}
              {new Date(tx.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Cập nhật:</strong>{" "}
              {new Date(tx.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="mt-3 d-flex gap-2">
          {tx.status === "initiated" && (
            <>
              <button
                className="btn btn-sm btn-success"
                onClick={() => action("complete")}
              >
                Hoàn tất
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => action("cancel")}
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
      {canRate && (
        <div className="card p-3 shadow-sm">
          <h5>Đánh giá người bán</h5>
          <div className="mb-2">
            <div className="d-flex align-items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    cursor: "pointer",
                    color: s <= rating ? "#f5c518" : "#ccc",
                  }}
                  onClick={() => setRating(s)}
                >
                  ★
                </span>
              ))}
              <span className="small ms-2">{rating}/5</span>
            </div>
          </div>
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Nhận xét (tuỳ chọn)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm"
            disabled={submitting}
            onClick={submitRating}
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      )}
    </div>
  );
};
export default TransactionDetail;
