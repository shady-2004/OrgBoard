import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../api/dashboard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { SimpleBarChart } from '../../components/charts/SimpleBarChart';
import { SimplePieChart } from '../../components/charts/SimplePieChart';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/tables/Pagination';
import { useState } from 'react';

// Helper function to get month name in Arabic
const getMonthName = (month) => {
  const months = {
    '1': 'يناير', '2': 'فبراير', '3': 'مارس', '4': 'أبريل',
    '5': 'مايو', '6': 'يونيو', '7': 'يوليو', '8': 'أغسطس',
    '9': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
  };
  return months[month] || month;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [expiredPage, setExpiredPage] = useState(1);
  const [nearlyExpiredPage, setNearlyExpiredPage] = useState(1);
  
  // Separate filters for Office Operations
  const [officeYear, setOfficeYear] = useState('');
  const [officeMonth, setOfficeMonth] = useState('');
  
  // Separate filters for Daily Operations
  const [dailyYear, setDailyYear] = useState('');
  const [dailyMonth, setDailyMonth] = useState('');
  
  const limit = 5;

  // Main stats (not filtered)
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardAPI.getStats(),
  });

  // Office Operations Financials (separate query with its own filters)
  const { data: officeFinancials, isLoading: officeLoading } = useQuery({
    queryKey: ['officeOperationsFinancials', officeMonth, officeYear],
    queryFn: () => {
      const params = {};
      if (officeMonth) params.month = officeMonth;
      if (officeYear) params.year = officeYear;
      return dashboardAPI.getOfficeOperationsFinancials(params);
    },
  });

  // Daily Operations Financials (separate query with its own filters)
  const { data: dailyFinancials, isLoading: dailyLoading } = useQuery({
    queryKey: ['dailyOperationsFinancials', dailyMonth, dailyYear],
    queryFn: () => {
      const params = {};
      if (dailyMonth) params.month = dailyMonth;
      if (dailyYear) params.year = dailyYear;
      return dashboardAPI.getDailyOperationsFinancials(params);
    },
  });

  const { data: expiredData } = useQuery({
    queryKey: ['expiredEmployees', expiredPage],
    queryFn: () => dashboardAPI.getExpiredEmployees({ page: expiredPage, limit }),
  });

  const { data: nearlyExpiredData } = useQuery({
    queryKey: ['nearlyExpiredEmployees', nearlyExpiredPage],
    queryFn: () => dashboardAPI.getNearlyExpiredEmployees({ page: nearlyExpiredPage, limit }),
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => dashboardAPI.getRecentActivities(5),
  });

  const statsData = stats?.data || {};
  const officeFinancialsData = officeFinancials?.data || {};
  const dailyFinancialsData = dailyFinancials?.data || {};
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
      link: '/employees'
    },
    { 
      title: 'الشواغر المتاحة', 
      value: statsData.totalAvailableSlots || 0, 
      icon: '✨', 
      color: 'bg-green-500',
      link: '/organizations'
    },
  ];

  const secondaryStats = [
    { 
      title: 'عمليات المكتب', 
      value: statsData.officeOperations || 0, 
      icon: '🏭', 
      color: 'bg-teal-500',
      link: '/office-operations'
    },
    { 
      title: 'العمليات اليومية', 
      value: statsData.dailyOperations || 0, 
      icon: '📝', 
      color: 'bg-amber-500',
      link: '/daily-operations'
    },
  ];

  const alertStats = [
    { 
      title: 'إقامات منتهية', 
      value: statsData.expiredEmployees || 0, 
      icon: '⚠️', 
      color: 'bg-red-500',
      severity: 'danger',
      scrollTo: 'expired-section'
    },
    { 
      title: 'إقامات قريبة الانتهاء', 
      value: statsData.nearlyExpiredEmployees || 0, 
      icon: '⏰', 
      color: 'bg-orange-500',
      severity: 'warning',
      scrollTo: 'expiring-section'
    },
  ];

  const officeOpsChartData = [
    {
      label: 'الإيرادات',
      value: officeFinancialsData.totalRevenue || 0,
      color: '#10b981'
    },
    {
      label: 'المصروفات',
      value: officeFinancialsData.totalExpenses || 0,
      color: '#ef4444'
    },
  ];
  
  const dailyOpsChartData = [
    {
      label: 'الإيرادات',
      value: dailyFinancialsData.totalRevenue || 0,
      color: '#10b981'
    },
    {
      label: 'المصروفات',
      value: dailyFinancialsData.totalExpenses || 0,
      color: '#ef4444'
    },
  ];

  if (statsLoading) {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainStats.map((stat, index) => (
          <Card 
            key={index}
            className={stat.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} text-white text-3xl p-4 rounded-lg`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {secondaryStats.map((stat, index) => (
          <Card 
            key={index}
            className={stat.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
            onClick={() => stat.link && navigate(stat.link)}
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} text-white text-3xl p-4 rounded-lg`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alertStats.map((stat, index) => (
          <Card 
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              if (stat.scrollTo) {
                const element = document.getElementById(stat.scrollTo);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            }}
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

      {/* Financial Statistics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Office Operations Financials */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏭</span>
              الإحصائيات المالية لعمليات المكتب
            </h3>
            
            {/* Office Operations Filters */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    السنة
                  </label>
                  <select
                    value={officeYear}
                    onChange={(e) => {
                      setOfficeYear(e.target.value);
                      if (!e.target.value) setOfficeMonth(''); // Clear month if year is cleared
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">كل السنوات</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    الشهر
                  </label>
                  <select
                    value={officeMonth}
                    onChange={(e) => setOfficeMonth(e.target.value)}
                    disabled={!officeYear}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">كل الشهور</option>
                    <option value="1">يناير</option>
                    <option value="2">فبراير</option>
                    <option value="3">مارس</option>
                    <option value="4">أبريل</option>
                    <option value="5">مايو</option>
                    <option value="6">يونيو</option>
                    <option value="7">يوليو</option>
                    <option value="8">أغسطس</option>
                    <option value="9">سبتمبر</option>
                    <option value="10">أكتوبر</option>
                    <option value="11">نوفمبر</option>
                    <option value="12">ديسمبر</option>
                  </select>
                </div>
              </div>
              {(officeMonth || officeYear) && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-blue-600">
                    📌 {officeMonth && officeYear ? `${getMonthName(officeMonth)} ${officeYear}` : officeYear ? `سنة ${officeYear}` : 'كل البيانات'}
                  </div>
                  <button
                    onClick={() => {
                      setOfficeYear('');
                      setOfficeMonth('');
                    }}
                    className="text-xs text-gray-600 hover:text-red-600 underline"
                  >
                    إعادة تعيين
                  </button>
                </div>
              )}
            </div>

            {officeLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <SimplePieChart data={officeOpsChartData} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">الإيرادات</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(officeFinancialsData.totalRevenue || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">المصروفات</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(officeFinancialsData.totalExpenses || 0)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Daily Operations Financials */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              الإحصائيات المالية للعمليات اليومية
            </h3>
            
            {/* Daily Operations Filters */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    السنة
                  </label>
                  <select
                    value={dailyYear}
                    onChange={(e) => {
                      setDailyYear(e.target.value);
                      if (!e.target.value) setDailyMonth(''); // Clear month if year is cleared
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">كل السنوات</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    الشهر
                  </label>
                  <select
                    value={dailyMonth}
                    onChange={(e) => setDailyMonth(e.target.value)}
                    disabled={!dailyYear}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">كل الشهور</option>
                    <option value="1">يناير</option>
                    <option value="2">فبراير</option>
                    <option value="3">مارس</option>
                    <option value="4">أبريل</option>
                    <option value="5">مايو</option>
                    <option value="6">يونيو</option>
                    <option value="7">يوليو</option>
                    <option value="8">أغسطس</option>
                    <option value="9">سبتمبر</option>
                    <option value="10">أكتوبر</option>
                    <option value="11">نوفمبر</option>
                    <option value="12">ديسمبر</option>
                  </select>
                </div>
              </div>
              {(dailyMonth || dailyYear) && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-blue-600">
                    📌 {dailyMonth && dailyYear ? `${getMonthName(dailyMonth)} ${dailyYear}` : dailyYear ? `سنة ${dailyYear}` : 'كل البيانات'}
                  </div>
                  <button
                    onClick={() => {
                      setDailyYear('');
                      setDailyMonth('');
                    }}
                    className="text-xs text-gray-600 hover:text-red-600 underline"
                  >
                    إعادة تعيين
                  </button>
                </div>
              )}
            </div>

            {dailyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <SimplePieChart data={dailyOpsChartData} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">الإيرادات</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(dailyFinancialsData.totalRevenue || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">المصروفات</div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(dailyFinancialsData.totalExpenses || 0)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card id="expired-section" className="scroll-mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              موظفون بإقامات منتهية ({expiredData?.pagination?.total || 0})
            </h3>
            {expiredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد موظفون بإقامات منتهية</p>
            ) : (
              <>
                <div className="space-y-2">
                  {expiredEmployees.map((employee) => (
                    <div 
                      key={employee._id} 
                      className="flex flex-col gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/organizations/${employee.organization?._id}/employees`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{employee.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            الجنسية: {employee.nationality || 'غير محدد'}
                          </div>
                        </div>
                        <div className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                          منتهية
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-600">
                          المنظمة: {' '}
                          <span className="text-blue-600 font-medium">
                            {employee.organization?.ownerName || 'غير محدد'}
                          </span>
                        </div>
                        <div className="text-red-700 font-medium">
                          {formatDate(employee.residencePermitExpiry)}
                        </div>
                      </div>
                      {employee.phoneNumber && (
                        <div className="text-xs text-gray-500">
                          📱 {employee.phoneNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {expiredData?.pagination && expiredData.pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={expiredPage}
                      totalPages={expiredData.pagination.totalPages}
                      totalItems={expiredData.pagination.total}
                      itemsPerPage={limit}
                      onPageChange={setExpiredPage}
                      hasNext={!!expiredData.pagination.next}
                      hasPrevious={!!expiredData.pagination.previous}
                      itemLabel="موظف"
                      compact
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        <Card id="expiring-section" className="scroll-mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              موظفون بإقامات قريبة الانتهاء ({nearlyExpiredData?.pagination?.total || 0})
            </h3>
            {nearlyExpiredEmployees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا يوجد موظفون بإقامات قريبة الانتهاء</p>
            ) : (
              <>
                <div className="space-y-2">
                  {nearlyExpiredEmployees.map((employee) => (
                    <div 
                      key={employee._id} 
                      className="flex flex-col gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/organizations/${employee.organization?._id}/employees`)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{employee.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            الجنسية: {employee.nationality || 'غير محدد'}
                          </div>
                        </div>
                        <div className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-1 rounded">
                          قريبة الانتهاء
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-600">
                          المنظمة: {' '}
                          <span className="text-blue-600 font-medium">
                            {employee.organization?.ownerName || 'غير محدد'}
                          </span>
                        </div>
                        <div className="text-orange-700 font-medium">
                          {formatDate(employee.residencePermitExpiry)}
                        </div>
                      </div>
                      {employee.phoneNumber && (
                        <div className="text-xs text-gray-500">
                          📱 {employee.phoneNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {nearlyExpiredData?.pagination && nearlyExpiredData.pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={nearlyExpiredPage}
                      totalPages={nearlyExpiredData.pagination.totalPages}
                      totalItems={nearlyExpiredData.pagination.total}
                      itemsPerPage={limit}
                      onPageChange={setNearlyExpiredPage}
                      hasNext={!!nearlyExpiredData.pagination.next}
                      hasPrevious={!!nearlyExpiredData.pagination.previous}
                      itemLabel="موظف"
                      compact
                    />
                  </div>
                )}
              </>
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
