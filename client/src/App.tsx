import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { ToastProvider } from "./components/ToastProvider";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import PostDetail from "./pages/PostDetail";
import AdminModeration from "./components/AdminModeration";
import ReportsAdmin from "./pages/ReportsAdmin";
import UserRatings from "./pages/UserRatings";
import Chat from "./pages/Chat";
import NotificationBell from "./components/NotificationBell";
import MyPosts from "./pages/MyPosts";
import Favorites from "./pages/Favorites";
import Transactions from "./pages/Transactions";
import TransactionDetail from "./pages/TransactionDetail";
import Profile from "./pages/Profile";

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link to="/" className="navbar-brand">
        OldMarket
      </Link>
      <div className="ms-auto d-flex align-items-center gap-2">
        {user && (
          <Link to="/posts/new" className="btn btn-sm btn-primary">
            Đăng bài
          </Link>
        )}
        {user && (
          <Link to="/myposts" className="btn btn-sm btn-outline-light">
            Bài của tôi
          </Link>
        )}
        {user && (
          <Link to="/favorites" className="btn btn-sm btn-outline-light">
            Yêu thích
          </Link>
        )}
        {user && (
          <Link to="/transactions" className="btn btn-sm btn-outline-light">
            Giao dịch
          </Link>
        )}
        {user && (
          <Link to="/me" className="btn btn-sm btn-outline-light">
            Hồ sơ
          </Link>
        )}
        {user?.role === "admin" && (
          <>
            <Link to="/admin/mod" className="btn btn-sm btn-warning">
              Duyệt bài
            </Link>
            <Link
              to="/admin/reports"
              className="btn btn-sm btn-outline-warning"
            >
              Báo cáo
            </Link>
          </>
        )}
        {user && <NotificationBell />}
        {user ? (
          <button className="btn btn-sm btn-outline-light" onClick={logout}>
            Đăng xuất
          </button>
        ) : (
          <>
            <Link to="/login" className="btn btn-sm btn-outline-light">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-sm btn-primary">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="layout-container">
    <NavBar />
    <main className="main-content">{children}</main>
    <footer className="footer text-center small">
      <div className="container">
        OldMarket &copy; {new Date().getFullYear()}
      </div>
    </footer>
  </div>
);

const AppInner: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Posts />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/posts/new" element={<CreatePost />} />
      <Route path="/posts/:id" element={<PostDetail />} />
      <Route path="/admin/mod" element={<AdminModeration />} />
      <Route path="/admin/reports" element={<ReportsAdmin />} />
      <Route path="/users/:id/ratings" element={<UserRatings />} />
      <Route path="/chat/:id" element={<Chat />} />
      <Route path="/myposts" element={<MyPosts />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/transactions/:id" element={<TransactionDetail />} />
      <Route path="/me" element={<Profile />} />
    </Routes>
  </Layout>
);

const App: React.FC = () => (
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

export default App;
