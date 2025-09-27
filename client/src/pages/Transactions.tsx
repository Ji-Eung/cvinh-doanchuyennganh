import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

interface Tx {
  _id: string;
  postId: string;
  buyerId: string;
  sellerId: string;
  priceAtSale: number;
  status: string;
  createdAt: string;
}

const Transactions: React.FC = () => {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();
  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/transactions/mine");
        setItems(r.data.data || []);
      } catch {
        showError("Lỗi tải giao dịch");
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) return <div className="container py-4">Đang tải...</div>;
  return (
    <div className="container py-4">
      <h3 className="mb-3">Giao dịch</h3>
      <div className="table-responsive">
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Bài</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t._id}>
                <td>
                  <Link to={`/transactions/${t._id}`}>{t._id.slice(-6)}</Link>
                </td>
                <td>
                  <Link to={`/posts/${t.postId}`}>{t.postId}</Link>
                </td>
                <td>{t.priceAtSale.toLocaleString()} VNĐ</td>
                <td className="text-capitalize">
                  <span className="badge bg-light text-dark">{t.status}</span>
                </td>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-muted small">
                  Không có giao dịch
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Transactions;
