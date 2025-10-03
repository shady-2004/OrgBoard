import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const OrganizationDailyOperationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch organization basic info
  const { data: orgData } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsAPI.getById(id),
    enabled: !!id,
  });

  const organization = orgData?.data?.organization;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <button onClick={() => navigate('/organizations')} className="hover:text-blue-600">
            المنظمات
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/organizations/${id}`)} className="hover:text-blue-600">
            {organization?.ownerName || 'جاري التحميل...'}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">العمليات اليومية</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">العمليات اليومية - {organization?.ownerName}</h1>
            <p className="text-gray-600 mt-1">إدارة الإيرادات والمصروفات اليومية</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/organizations/${id}`)}>
              العودة للمنظمة
            </Button>
            <Button onClick={() => navigate(`/organizations/${id}/daily-operations/add`)}>
              + تسجيل عملية يومية
            </Button>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <Card>
        <div className="p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">قريباً</h2>
          <p className="text-gray-600 mb-6">
            سيتم إضافة صفحة العمليات اليومية قريباً
          </p>
          <div className="max-w-md mx-auto text-right bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-3">الميزات القادمة:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>تسجيل العمليات اليومية (إيرادات ومصروفات)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>البحث والتصفية حسب التاريخ والفئة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>ملخص مالي شامل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>رسوم بيانية للإيرادات والمصروفات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>تصدير التقارير</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
