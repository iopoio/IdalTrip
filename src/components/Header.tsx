import { Link } from 'react-router-dom';
import LogoLight from '../assets/logo/이달여행.svg';

const Header = () => {
  return (
    <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-surface-container">
      <div className="flex items-center px-4 h-12">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <img src={LogoLight} alt="이달의 여행" className="h-6 w-auto" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
