import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/ToastProvider";

interface ReportDTO {
  _id?: string; // before normalization fallback
  id?: string;
  reporterId: string;
  postId?: string;
  reportedUserId?: string;
  reason: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: "badge bg-danger",
  reviewing: "badge bg-warning text-dark",
  closed: "badge bg-success",
};

const ReportsAdmin: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [reports, setReports] = useState<ReportDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    try {
      const res = await api.get("/reports", {
        params: filter ? { status: filter } : {},
      });
      setReports(res.data?.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Lỗi tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/reports/${id}/status`, { status });
      toast.success("Cập nhật thành công");
      setReports((r) =>
        r.map((x) => ((x.id || x._id) === id ? { ...x, status } : x))
      );
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdating(null);
    }
  };

  if (!user || user.role !== "admin")
    return <div className="container py-4">Không có quyền.</div>;

  return (
    <div className="container py-4">
      <h3 className="mb-3">Quản lý báo cáo</h3>
      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="open">Open</option>
          <option value="reviewing">Reviewing</option>
          <option value="closed">Closed</option>
        </select>
        <button className="btn btn-sm btn-outline-secondary" onClick={load}>
          Tải lại
        </button>
      </div>
      {loading && <div>Đang tải...</div>}
      {!loading && reports.length === 0 && <div>Không có báo cáo.</div>}
      <div className="list-group">
        {reports.map((r) => {
          const rid = r.id || r._id!;
          return (
            <div key={rid} className="list-group-item">
              <div className="d-flex justify-content-between">
                <div>
                  <div>
                    <strong>Lý do:</strong> {r.reason}
                  </div>
                  {r.postId && (
                    <div>
                      Bài: <code>{r.postId}</code>
                    </div>
                  )}
                  {r.reportedUserId && (
                    <div>
                      Người dùng: <code>{r.reportedUserId}</code>
                    </div>
                  )}
                  <small className="text-muted">
                    Reporter: {r.reporterId} •{" "}
                    {new Date(r.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="text-end">
                  <span
                    className={statusColors[r.status] || "badge bg-secondary"}
                  >
                    {r.status}
                  </span>
                  <div className="mt-2 btn-group">
                    {r.status !== "open" && (
                      <button
                        disabled={!!updating}
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => updateStatus(rid, "open")}
                      >
                        Open
                      </button>
                    )}
                    {r.status !== "reviewing" && (
                      <button
                        disabled={!!updating}
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => updateStatus(rid, "reviewing")}
                      >
                        Review
                      </button>
                    )}
                    {r.status !== "closed" && (
                      <button
                        disabled={!!updating}
                        className="btn btn-sm btn-outline-success"
                        onClick={() => updateStatus(rid, "closed")}
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsAdmin;
