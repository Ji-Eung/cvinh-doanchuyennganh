import React from "react";

// Lưu ý: Đây là phiên bản rút gọn từ template HTML gốc.
// Sẽ dần tách nhỏ thành Navbar, Footer, ProductCard, CategoryGrid...

const TemplateLayout: React.FC = () => {
  return (
    <>
      <header>
        <div className="container-fluid bg-dark text-light py-2 px-3 d-flex justify-content-between">
          <div className="d-none d-lg-flex gap-3 small">
            <span>Giới Thiệu</span>
            <span>Liên Hệ</span>
            <span>Hỗ Trợ</span>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-light">Đăng Nhập</button>
            <button className="btn btn-sm btn-primary">Đăng Ký</button>
          </div>
        </div>
        <div className="container-fluid bg-light py-3 px-4 d-none d-lg-flex align-items-center justify-content-between">
          <h1 className="h3 m-0">
            <span className="text-primary">Thanh</span> Lý
          </h1>
          <div style={{ maxWidth: 420 }}>
            <input className="form-control" placeholder="Tìm kiếm sản phẩm" />
          </div>
          <div className="text-right small">
            <div>Hỗ Trợ Khách Hàng</div>
            <strong>+012 345 6789</strong>
          </div>
        </div>
      </header>
      <main className="container my-4">
        <h2 className="h5 mb-3">Sản Phẩm Nổi Bật (Stub)</h2>
        <div className="row g-3">
          {[1, 2, 3, 4].map((n) => (
            <div className="col-6 col-md-3" key={n}>
              <div className="card h-100">
                <div className="ratio ratio-1x1 bg-secondary" />
                <div className="card-body p-2">
                  <div className="small text-truncate">Tên Sản Phẩm {n}</div>
                  <div className="fw-bold">1.500.000 VNĐ</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="bg-dark text-light py-4 mt-5">
        <div className="container small">
          © 2025 Thanh Lý Đồ Cũ - MVP Skeleton
        </div>
      </footer>
    </>
  );
};

export default TemplateLayout;
