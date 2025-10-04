import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { SimpleBarChart } from '../../components/charts/SimpleBarChart';
import { SimplePieChart } from '../../components/charts/SimplePieChart';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getStats,
  });

  const { data: expiredData } = useQuery({
    queryKey: ['expiredEmployees'],
    queryFn: dashboardAPI.getExpiredEmployees,
  });

  const { data: nearlyExpiredData } = useQuery({
    queryKey: ['nearlyExpiredEmployees'],
    queryFn: dashboardAPI.getNearlyExpiredEmployees,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => dashboardAPI.getRecentActivities(5),
  });

  const statsData = stats?.data || {};
  const expiredEmployees = expiredData?.data?.employees || [];
  const nearlyExpiredEmployees = nearlyExpiredData?.data?.employees || [];
  const activities = activitiesData?.data?.activities || [];

  const mainStats = [
    { 
      title: 'إجمالي المنظمات', 
      value: statsData.totalOrganizations || 0, 
      icon: '🏢', 
      color: 'bg-blue-500',
      link: '/organizations'
    },
    { 
      title: 'إجمالي الموظفين', 
      value: statsData.totalEmployees || 0, 
      icon: '👥', 
      color: 'bg-purple-500',
      link: '/organizations'
    },
    { 
      title: 'عمليات المكتب', 
      value: statsData.officeOperations || 0, 
      icon: '🏭', 
      color: 'bg-green-500',
      link: '/office-operations'
    },
    { 
      title: 'العمليات اليومية', 
      value: statsData.dailyOperations || 0, 
      icon: '📝', 
      color: 'bg-amber-500',
      link: null
    },
  ];

  const alertStats = [
    { 
      title: 'إقامات منتهية', 
      value: statsData.expiredEmployees || 0, 
      icon: '⚠️', 
      color: 'bg-red-500',
      severity: 'danger'
    },
    { 
      title: 'إقامات قريبة الانتهاء', 
      value: statsData.nearlyExpiredEmployees || 0, 
      icon: '⏰', 
      color: 'bg-orange-500',
      severity: 'warning'
    },
  ];

    const officeOpsChartData = [
    {
      label: 'الإيرادات',
      value: statsData.officeOperationsFinancials?.totalRevenue || 0,
      color: '#10b981'
    },
    {
      label: 'المصروفات',
      value: statsData.officeOperationsFinancials?.totalExpenses || 0,
      color: '#ef4444'
    },
  ];  const dailyOpsChartData = [
    {
      label: 'الإيرادات',
      value: statsData.dailyOperationsFinancials?.totalRevenue || 0,
      color: '#10b981'
    },
    {
      label: 'المصروفات',
      value: statsData.dailyOperationsFinancials?.totalExpenses || 0,
      color: '#ef4444'
    },
  ];  if (statsLoading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">نظرة عامة على النظام</p>
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
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">نظرة عامة على النظام</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card 
            key={index}
            className={stat.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
            onClick={() => stat.link && navigate(stat.link)}
          >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alertStats.map((stat, index) => (
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

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            الإحصائيات المالية للموظفين
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
              <div className="text-sm text-gray-600 mb-1">إجمالي المبالغ المطلوبة</div>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(statsData.employeeFinancials?.totalRequestedAmount || 0)}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
              <div className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statsData.employeeFinancials?.totalRevenue || 0)}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
              <div className="text-sm text-gray-600 mb-1">إجمالي المبالغ المدفوعة</div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(statsData.employeeFinancials?.totalPaid || 0)}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg min-h-[100px] flex flex-col justify-center">
              <div className="text-sm text-gray-600 mb-1">إجمالي المبالغ المتبقية</div>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(statsData.employeeFinancials?.totalRemaining || 0)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الإحصائيات المالية لعمليات المكتب</h3>
            <SimplePieChart data={officeOpsChartData} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">الإيرادات</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(statsData.officeOperationsFinancials?.totalRevenue || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">المصروفات</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(statsData.officeOperationsFinancials?.totalExpenses || 0)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الإحصائيات المالية للعمليات اليومية</h3>
            <SimplePieChart data={dailyOpsChartData} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">الإيرادات</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(statsData.dailyOperationsFinancials?.totalRevenue || 0)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">المصروفات</div>
                <div className="text-xl font-bold text-red-600">
                  {formatCurrency(statsData.dailyOperationsFinancials?.totalExpenses || 0)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              موظفون بإقامات منتهية ({expiredEmployees.length})
            </h3>
            {expiredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد موظفون بإقامات منتهية</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {expiredEmployees.map((employee) => (
                  <div 
                    key={employee._id} 
                    className="flex justify-between items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{employee.name}</div>
                      <div className="text-sm text-gray-600">
                        المنظمة: {' '}
                        <span 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                          onClick={() => navigate(`/organizations/${employee.organization?._id}`)}
                        >
                          {employee.organization?.ownerName || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      {formatDate(employee.residenceExpiryDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              موظفون بإقامات قريبة الانتهاء ({nearlyExpiredEmployees.length})
            </h3>
            {nearlyExpiredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد موظفون بإقامات قريبة الانتهاء</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {nearlyExpiredEmployees.map((employee) => (
                  <div 
                    key={employee._id} 
                    className="flex justify-between items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{employee.name}</div>
                      <div className="text-sm text-gray-600">
                        المنظمة: {' '}
                        <span 
                          className="text-blue-600 hover:text-blue-800 cursor-pointer underline"
                          onClick={() => navigate(`/organizations/${employee.organization?._id}`)}
                        >
                          {employee.organization?.ownerName || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-orange-600 font-medium">
                      {formatDate(employee.residenceExpiryDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

            <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            آخر الأنشطة
          </h3>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد أنشطة حديثة</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.description}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(activity.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
