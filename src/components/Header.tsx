import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
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
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-[1920px] mx-auto text-sm font-medium">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={LogoLight} alt="이달여행" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-200 ${
                  isActive
                    ? 'text-primary-container font-bold border-b-2 border-primary-container pb-1'
                    : 'text-on-surface-variant hover:text-primary-container'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex px-5 py-2 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 rounded-full items-center gap-1.5">
            <LogIn size={16} />
            로그인
          </button>
          <button className="px-6 py-2.5 bg-primary-container text-on-primary rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all">
            시작하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
