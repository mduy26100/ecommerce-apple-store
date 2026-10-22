import { Button, Space } from "antd";
import { HomeOutlined, ArrowLeftOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface NotFoundPageProps {
  inAdminContext?: boolean;
  inAuthContext?: boolean;
}

export const NotFoundPage = ({
  inAdminContext = false,
  inAuthContext = false,
}: NotFoundPageProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (inAdminContext) {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleGoToLogin = () => {
    navigate("/auth/login");
  };

  let wrapperClass = "flex flex-col items-center justify-center flex-1 w-full min-h-[60vh] select-none font-sans";
  if (!inAdminContext && !inAuthContext) {
    wrapperClass = "flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 select-none font-sans p-6";
  } else if (inAuthContext) {
    wrapperClass = "flex flex-col items-center justify-center w-full py-6 select-none font-sans";
  }

  return (
    <div className={wrapperClass}>
      <div className="max-w-md w-full text-center flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <h1 className="text-8xl font-black text-slate-200/80 tracking-tight leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-800 uppercase tracking-widest bg-slate-50 px-3">
              Không Tìm Thấy Trang
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
          Đường dẫn bạn truy cập có thể đã bị xóa hoặc không còn tồn tại trên hệ thống Urban Stitch.
        </p>

        <Space size="middle" className="justify-center">
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
            className="hover:border-slate-400 hover:text-slate-800 transition-all duration-200 h-9 px-4 rounded-xl font-medium text-slate-600 border-slate-200"
          >
            Quay lại
          </Button>

          {inAuthContext ? (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleGoToLogin}
              className="bg-blue-600 hover:bg-blue-500 border-none h-9 px-4 rounded-xl font-medium text-white shadow-xs"
            >
              Về trang Đăng nhập
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-500 border-none h-9 px-4 rounded-xl font-medium text-white shadow-xs"
            >
              {inAdminContext ? "Về Bảng Điều Khiển" : "Về Trang Chủ Cửa Hàng"}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default NotFoundPage;
