import { Link, useLocation } from 'react-router-dom';
import { t } from '../../utils/translations';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/organizations', label: t('nav.organizations'), icon: '🏢' },
    { path: '/office-operations', label: t('nav.officeOperations'), icon: '🏭' },
    { path: '/saudization', label: t('nav.saudization'), icon: '🇸🇦' },
    { path: '/users', label: t('nav.users'), icon: '👥', adminOnly: true },
    { path: '/settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-lg">
      <div className="px-6 py-8 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">لوحة المنظمات</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white border-l-4 border-blue-400' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
