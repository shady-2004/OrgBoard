import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { t } from '../../utils/translations';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">جاري التحميل...</h2>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-xl font-semibold text-gray-800 truncate">
            <span className="hidden sm:inline">{t('nav.welcome')}، </span>
            <span className="sm:hidden">👋 </span>
            {user.email}
          </h2>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-gray-700">{user.email}</div>
            <div className="text-xs text-gray-500 capitalize">
              {user.role === 'admin' ? 'مدير' : user.role === 'moderator' ? 'مشرف' : 'مستخدم'}
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout} className="whitespace-nowrap text-xs sm:text-sm">
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </nav>
  );
};
