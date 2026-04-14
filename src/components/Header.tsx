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
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={LogoLight} alt="이달여행" className="h-7 w-auto" />
          </Link>
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-[#ff6b35] font-bold border-b-2 border-[#ff6b35] pb-1'
                      : 'text-slate-600 hover:text-[#ff6b35] font-medium'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block px-5 py-2 text-slate-600 hover:bg-slate-50 transition-colors duration-200 rounded-full text-sm font-medium">
            로그인
          </button>
          <button className="px-6 py-2.5 bg-primary-container text-on-primary rounded-full text-sm font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
            시작하기
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
