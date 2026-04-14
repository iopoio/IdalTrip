import { Link, useLocation } from 'react-router-dom';
import LogoLight from '../assets/logo/이달여행.svg';

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { name: '홈', path: '/' },
    { name: '축제 정보', path: '/festivals' },
    { name: 'AI 코스 추천', path: '/course-gen' },
    { name: '커뮤니티', path: '/community' },
  ];

  return (
    <header className="sticky top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20">
      <div className="flex justify-between items-center px-10 h-24 max-w-[1440px] mx-auto overflow-hidden">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={LogoLight} alt="IdalTrip" className="h-[28px] w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-14">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-[15px] transition-all duration-300 ${
                  isActive
                    ? 'text-brand-primary font-black'
                    : 'text-gray-400 hover:text-brand-primary font-bold'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-10">
          <button className="text-[14px] font-bold text-gray-400 hover:text-brand-primary transition-colors">로그인</button>
          <button className="px-10 py-3.5 bg-brand-primary text-white rounded-full font-black text-[14px] shadow-2xl shadow-brand-primary/20 hover:scale-110 active:scale-95 transition-all">
            시작하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
