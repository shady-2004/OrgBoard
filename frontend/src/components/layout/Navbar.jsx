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

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{t('nav.welcome')}، {user?.email || t('nav.user')}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">{user?.email}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role || t('nav.user')}</div>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </nav>
  );
};
