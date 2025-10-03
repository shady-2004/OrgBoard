import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';

export const DashboardPage = () => {
  const stats = [
    { title: t('dashboard.totalOrganizations'), value: '24', icon: '🏢', color: 'bg-blue-500' },
    { title: t('dashboard.dailyOperations'), value: '43', icon: '�', color: 'bg-amber-500' },
    { title: t('dashboard.activeUsers'), value: '12', icon: '�', color: 'bg-purple-500' },
    { title: t('dashboard.officeOperations'), value: '28', icon: '🏭', color: 'bg-green-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t('dashboard.title')}</h1>
        <p className="text-gray-600 mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
