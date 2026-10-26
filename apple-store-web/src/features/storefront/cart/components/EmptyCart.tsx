import { Link } from "react-router-dom";
import { Button } from "antd";
import { ShoppingCartOutlined, ArrowRightOutlined } from "@ant-design/icons";

export const EmptyCart = () => {
  return (
    <div className="py-16 sm:py-24 px-4 text-center max-w-lg mx-auto">
      <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-4xl mb-6 shadow-xs border border-blue-100">
        <ShoppingCartOutlined />
      </div>

      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Giỏ hàng của bạn đang trống
      </h2>

      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        Chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay các sản phẩm công nghệ Apple chính hãng mới nhất và chọn cho mình sản phẩm ưng ý!
      </p>

      <Link to="/products">
        <Button
          type="primary"
          size="large"
          icon={<ArrowRightOutlined />}
          className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold text-sm shadow-md shadow-blue-500/20 border-none inline-flex items-center gap-2 cursor-pointer"
        >
          Khám phá sản phẩm ngay
        </Button>
      </Link>
    </div>
  );
};
