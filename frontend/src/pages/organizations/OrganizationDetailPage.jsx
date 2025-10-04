import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export const OrganizationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch organization data
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsAPI.getById(id),
    enabled: !!id,
  });

  // Fetch employees count (lightweight)
  const { data: employeesCountData } = useQuery({
    queryKey: ['organization-employees-count', id],
    queryFn: () => organizationsAPI.getEmployeesCount(id),
    enabled: !!id,
  });

  // Fetch employees totals
  const { data: employeesTotalsData } = useQuery({
    queryKey: ['organization-employees-totals', id],
    queryFn: () => organizationsAPI.getEmployeesTotals(id),
    enabled: !!id,
  });

  // Fetch daily operations count
  const { data: dailyOpsCountData } = useQuery({
    queryKey: ['organization-daily-ops-count', id],
    queryFn: () => organizationsAPI.getDailyOperationsCount(id),
    enabled: !!id,
  });

  // Fetch daily operations totals
  const { data: dailyOpsTotalsData } = useQuery({
    queryKey: ['organization-daily-ops-totals', id],
    queryFn: () => organizationsAPI.getDailyOperationsTotals(id),
    enabled: !!id,
  });

  const organization = data?.data?.organization;
  const employeesCount = employeesCountData?.data?.count || 0;
  const employeesTotals = employeesTotalsData?.data?.totals;
  const dailyOpsCount = dailyOpsCountData?.data?.count || 0;
  const dailyOpsTotals = dailyOpsTotalsData?.data?.totals;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المنظمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 mb-4">
              {error.response?.data?.message || error.message || 'حدث خطأ أثناء تحميل بيانات المنظمة'}
            </p>
            <Button onClick={() => navigate('/organizations')}>
              العودة للقائمة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">المنظمة غير موجودة</h2>
            <p className="text-gray-600 mb-4">لم يتم العثور على المنظمة المطلوبة</p>
            <Button onClick={() => navigate('/organizations')}>
              العودة للقائمة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{organization.ownerName}</h1>
          <p className="text-gray-600 mt-1">معلومات تفصيلية عن المنظمة</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/organizations')}>
            العودة للقائمة
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/organizations/edit/${id}`)}>
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* Organization Details */}
      <div className="space-y-6">
        {/* Basic Information */}
                {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">📋</span>
              المعلومات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">اسم المالك</p>
                <p className="text-base font-medium text-gray-900">{organization.ownerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">الهوية الوطنية</p>
                <p className="text-base font-medium text-gray-900">{organization.nationalId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ الميلاد</p>
                <p className="text-base font-medium text-gray-900">
                  {organization.birthDate ? formatDate(organization.birthDate) : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">كود أبشر</p>
                <p className="text-base font-medium text-gray-900">{organization.absherCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">رقم السجل التجاري</p>
                <p className="text-base font-medium text-gray-900">{organization.commercialRecordNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">تاريخ السجل التجاري</p>
                <p className="text-base font-medium text-gray-900">
                  {organization.commercialRecordDate ? formatDate(organization.commercialRecordDate) : '-'}
                </p>
              </div>
              {organization.qawiSubscriptionDate && (
                <div>
                  <p className="text-sm text-gray-500">تاريخ اشتراك قوى</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(organization.qawiSubscriptionDate)}
                  </p>
                </div>
              )}
              {organization.absherSubscriptionDate && (
                <div>
                  <p className="text-sm text-gray-500">تاريخ اشتراك أبشر</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(organization.absherSubscriptionDate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

       

        {/* Financial Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-purple-600">�</span>
              المعلومات المالية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">مبلغ الكفيل</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(organization.sponsorAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المبلغ المحول للكفيل</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(organization.transferredToSponsorTotal || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">المبلغ المتبقي</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(organization.sponsorAmount - (organization.transferredToSponsorTotal || 0))}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Operations Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-green-600">�</span>
                  العمليات اليومية
                </h3>
                <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {dailyOpsCount}
                </span>
              </div>

              {/* Daily Operations Quick Stats */}
              {dailyOpsTotals && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي الإيرادات</span>
                    <span className="font-semibold text-green-600">{formatCurrency(dailyOpsTotals.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي المصروفات</span>
                    <span className="font-semibold text-red-600">{formatCurrency(dailyOpsTotals.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">صافي المبلغ</span>
                    <span className={`font-bold ${dailyOpsTotals.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(dailyOpsTotals.netAmount)}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full"
                onClick={() => navigate(`/organizations/${id}/daily-operations`)}
              >
                عرض العمليات اليومية →
              </Button>
            </div>
          </Card>

          {/* Employees Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600">👥</span>
                  الموظفون
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {employeesCount}
                </span>
              </div>

              {/* Employees Quick Stats */}
              {employeesTotals && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي المطلوب</span>
                    <span className="font-semibold">{formatCurrency(employeesTotals.totalRequested)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي الإيرادات</span>
                    <span className="font-semibold text-green-600">{formatCurrency(employeesTotals.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">إجمالي المصروفات</span>
                    <span className="font-semibold text-red-600">{formatCurrency(employeesTotals.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">صافي الإيرادات</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(employeesTotals.totalRevenueRemaining)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المتبقي</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(employeesTotals.totalRemaining)}</span>
                  </div>
                </div>
              )}

              <Button 
                className="w-full"
                onClick={() => navigate(`/organizations/${id}/employees`)}
              >
                عرض جميع الموظفين →
              </Button>
            </div>
          </Card>

          {/* Organization Daily Operations Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-purple-600">�</span>
                  التحويلات المالية
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                تتبع المبالغ المحولة للمنظمة (دفعات العملاء، إيجارات مستلمة، تحويلات الكفيل)
              </p>
              <Button 
                className="w-full"
                onClick={() => navigate(`/organizations/${id}/organization-daily-operations`)}
              >
                عرض التحويلات المالية →
              </Button>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">إجراءات سريعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="secondary"
                onClick={() => navigate(`/employees/add?organizationId=${id}`)}
              >
                + إضافة موظف
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/daily-operations/add?organizationId=${id}`)}
              >
                + تسجيل عملية يومية
              </Button>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/organization-daily-operations/add?organizationId=${id}`)}
              >
                + إضافة تحويل مالي
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
