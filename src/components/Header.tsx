import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LogoLight from '../assets/logo/이달여행.svg';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  rightIcon?: ReactNode;
}

const Header = ({ showBack, title, rightIcon }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-surface-container">
      <div className="flex items-center px-4 h-12 gap-2">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-full hover:bg-surface-container transition-colors"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>
        ) : (
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={LogoLight} alt="이달의 여행" className="h-6 w-auto" />
          </Link>
        )}

        {title && (
          <span className="flex-1 text-sm font-label font-semibold text-on-surface truncate">
            {title}
          </span>
        )}

        {rightIcon && (
          <div className="ml-auto">{rightIcon}</div>
        )}
      </div>
    </header>
  );
};

export default Header;
