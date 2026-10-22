export const AuthFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col items-center gap-2 text-xxs text-slate-400 select-none mt-6">
      <p className="font-medium text-center">
        &copy; {currentYear} Urban Stitch Việt Nam. Bảo lưu mọi quyền.
      </p>
      <div className="flex gap-3 justify-center">
        <span className="hover:text-slate-600 cursor-pointer transition-colors duration-150">Trợ giúp</span>
        <span>&bull;</span>
        <span className="hover:text-slate-600 cursor-pointer transition-colors duration-150">Bảo mật</span>
        <span>&bull;</span>
        <span className="hover:text-slate-600 cursor-pointer transition-colors duration-150">Điều khoản</span>
      </div>
    </div>
  );
};

export default AuthFooter;
