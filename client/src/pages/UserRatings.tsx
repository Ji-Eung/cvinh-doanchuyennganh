import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useParams } from "react-router-dom";

interface RatingDTO {
  _id?: string;
  id?: string;
  score: number;
  comment?: string;
  raterId: string;
  createdAt: string;
}

const UserRatings: React.FC = () => {
  const { id } = useParams();
  const [ratings, setRatings] = useState<RatingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/ratings/user/${id}`);
        setRatings(res.data?.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="container py-4">
      <h3>Đánh giá người dùng</h3>
      {loading && <div>Đang tải...</div>}
      {!loading && ratings.length === 0 && <div>Chưa có đánh giá.</div>}
      <ul className="list-group">
        {ratings.map((r) => (
          <li className="list-group-item" key={r.id || r._id}>
            <strong>{r.score}⭐</strong>{" "}
            {r.comment && <span>- {r.comment}</span>}
            <div className="small text-muted">
              Bởi: {r.raterId} • {new Date(r.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default UserRatings;
