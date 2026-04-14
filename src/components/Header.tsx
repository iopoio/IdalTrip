import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import LogoLight from '../assets/logo/이달여행.svg';

const Header: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { name: '홈', path: '/' },
    { name: '축제 정보', path: '/festivals' },
    { name: 'AI 코스 추천', path: '/course-gen' },
    { name: '커뮤니티', path: '/community' },
  ];

  return (
    <header className="fixed top-0 w-full h-20 bg-white/80 backdrop-blur-md z-50 transition-all duration-300">
      <div className="max-w-[1920px] mx-auto h-full px-8 flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img src={LogoLight} alt="이달여행" className="h-9 w-auto" />
        </Link>

        {/* Global Navigation - Hidden on mobile/tablet, shown on lg+ (Editorial density check) */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all duration-200 border-b-2 pb-1 ${
                  isActive
                    ? 'text-primary-container border-primary-container font-bold'
                    : 'text-on-surface-variant border-transparent hover:text-primary-container cursor-pointer'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Actions - Desktop Only group as per Chief's request */}
        <div className="hidden sm:flex items-center gap-4">
          <button className="px-5 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-full flex items-center gap-2">
            <LogIn size={18} />
            <span>로그인</span>
          </button>
          <button className="px-6 py-2.5 bg-primary-container text-on-primary rounded-full text-sm font-bold shadow-soft hover:shadow-vibrant hover:scale-105 active:scale-95 transition-all">
            시작하기
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
