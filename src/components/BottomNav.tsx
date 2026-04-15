import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, MapPin } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: '홈', path: '/', icon: Home },
    { name: '축제 소식', path: '/festivals', icon: Calendar },
    { name: '최근 코스', path: '/recent-course', icon: MapPin },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] bg-white/90 backdrop-blur-xl border-t border-surface-container z-50 flex items-center justify-around px-4 pt-3 pb-6">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10 shadow-sm' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
