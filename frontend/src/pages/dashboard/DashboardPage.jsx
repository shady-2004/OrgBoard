import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getStats,
  });

  const dashboardStats = [
    { 
      title: t('dashboard.totalOrganizations'), 
      value: stats?.data?.totalOrganizations || '0', 
      icon: '🏢', 
      color: 'bg-blue-500' 
    },
    { 
      title: t('dashboard.dailyOperations'), 
      value: stats?.data?.dailyOperations || '0', 
      icon: '📝', 
      color: 'bg-amber-500' 
    },
    { 
      title: t('dashboard.activeUsers'), 
      value: stats?.data?.activeUsers || '0', 
      icon: '👥', 
      color: 'bg-purple-500' 
    },
    { 
      title: t('dashboard.officeOperations'), 
      value: stats?.data?.officeOperations || '0', 
      icon: '🏭', 
      color: 'bg-green-500' 
    },
  ];

  if (isLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-4 animate-pulse">
                <div className="bg-gray-300 w-16 h-16 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <div className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl shadow-md`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title={t('dashboard.recentActivities')}>
        <div className="text-gray-500 text-center py-8">
          <p>{t('dashboard.noRecentActivities')}</p>
        </div>
      </Card>
    </div>
  );
};
