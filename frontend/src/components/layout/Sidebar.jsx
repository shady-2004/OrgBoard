import { Link, useLocation } from 'react-router-dom';
import { t } from '../../utils/translations';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { path: '/organizations', label: t('nav.organizations'), icon: '🏢' },
    { path: '/employees', label: t('nav.employees'), icon: '👤' },
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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 xl:hidden bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-lg z-40 transition-transform duration-300
        ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }
        xl:translate-x-0
      `}>
        <div className="px-6 py-8 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-blue-400">لوحة المنظمات</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
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
    </>
  );
};
