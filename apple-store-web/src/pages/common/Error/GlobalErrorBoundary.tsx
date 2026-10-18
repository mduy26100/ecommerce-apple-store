import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { Button, Space, Collapse } from "antd";
import { HomeOutlined, ReloadOutlined, WarningOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { NotFoundPage } from "../NotFound/NotFoundPage";

interface GlobalErrorBoundaryProps {
  inAdminContext?: boolean;
  inAuthContext?: boolean;
}

export const GlobalErrorBoundary = ({
  inAdminContext = false,
  inAuthContext = false,
}: GlobalErrorBoundaryProps) => {
  const error = useRouteError();
  const navigate = useNavigate();
  const isDev = import.meta.env.DEV;

  const handleGoHome = () => {
    if (inAdminContext) {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage inAdminContext={inAdminContext} inAuthContext={inAuthContext} />;
  }

  let statusCode = "500";
  let errorTitle = "Lỗi Ứng Dụng";
  let errorMessage = "Đã xảy ra sự cố ngoài ý muốn trong quá trình xử lý yêu cầu.";
  let errorStack = "";

  if (isRouteErrorResponse(error)) {
    statusCode = String(error.status);
    errorTitle = error.statusText || `Mã lỗi ${error.status}`;
    if (error.status === 403 || error.status === 401) {
      errorTitle = "Từ Chối Truy Cập";
      errorMessage = "Bạn không có quyền truy cập vào tài nguyên hoặc trang này.";
    } else if (error.status === 503) {
      errorTitle = "Hệ Thống Đang Bảo Trì";
      errorMessage = "Dịch vụ hiện đang tạm thời gián đoạn. Vui lòng quay lại sau.";
    } else {
      errorMessage = typeof error.data === "string" ? error.data : JSON.stringify(error.data) || errorMessage;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || "";
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object") {
    errorMessage = JSON.stringify(error);
  }

  let wrapperClass = "flex flex-col items-center justify-center flex-1 w-full min-h-[60vh] select-none font-sans p-4";
  if (!inAdminContext && !inAuthContext) {
    wrapperClass = "flex flex-col items-center justify-center min-h-screen w-full bg-slate-50 select-none font-sans p-6";
  } else if (inAuthContext) {
    wrapperClass = "flex flex-col items-center justify-center w-full py-6 select-none font-sans";
  }

  return (
    <div className={wrapperClass}>
      <div className="max-w-xl w-full text-center flex flex-col items-center justify-center">
        <div className="mb-4">
          {statusCode === "403" || statusCode === "401" ? (
            <SafetyCertificateOutlined className="text-5xl text-rose-500" />
          ) : (
            <WarningOutlined className="text-5xl text-rose-500" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
          {errorTitle} ({statusCode})
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <Space size="middle" className="justify-center mb-6">
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={handleReload}
            className="hover:border-slate-400 hover:text-slate-800 transition-all duration-200 h-9 px-4 rounded-xl font-medium text-slate-600 border-slate-200"
          >
            Tải lại trang
          </Button>
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-500 border-none h-9 px-4 rounded-xl font-medium text-white shadow-xs"
          >
            {inAdminContext ? "Về Bảng Điều Khiển" : "Về Trang Chủ"}
          </Button>
        </Space>

        {isDev && (errorStack || errorMessage) && (
          <div className="w-full text-left border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 max-w-lg mx-auto">
            <Collapse
              ghost
              size="small"
              items={[
                {
                  key: "diagnostics",
                  label: (
                    <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase font-mono">
                      Chi tiết chuẩn đoán (Dành cho Lập trình viên)
                    </span>
                  ),
                  children: (
                    <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2 overflow-auto max-h-37.5 custom-scrollbar border-t border-slate-200">
                      {errorStack ? (
                        <pre className="whitespace-pre">{errorStack}</pre>
                      ) : (
                        <pre className="whitespace-pre">{errorMessage}</pre>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalErrorBoundary;
