import { FloatButton } from "antd";
import { UpCircleOutlined } from "@ant-design/icons";

export const ScrollToTopButton = () => {
  return (
    <FloatButton.BackTop
      target={() => document.getElementById("main-content-scroll") || window}
      visibilityHeight={400}
      duration={450}
      tooltip="Cuộn lên đầu trang"
      icon={<UpCircleOutlined />}
      type="primary"
      className="right-6 bottom-6 shadow-lg"
    />
  );
};

export default ScrollToTopButton;
