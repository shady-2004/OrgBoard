import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { t } from '../../utils/translations';

export const OrganizationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">تفاصيل المنظمة</h1>
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

      {/* Placeholder Content */}
      <div className="space-y-6">
        <Card>
          <div className="p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              صفحة تفاصيل المنظمة
            </h3>
            <p className="text-gray-600 mb-1">معرف المنظمة: <span className="font-mono text-blue-600">{id}</span></p>
            <p className="text-gray-500 text-sm mt-4">
              سيتم إضافة المحتوى التفصيلي لاحقاً
            </p>
          </div>
        </Card>

        {/* Preview of what could be here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">📋</span>
                المعلومات الأساسية
              </h3>
              <p className="text-gray-500 text-sm">
                • اسم المالك<br />
                • الهوية الوطنية<br />
                • السجل التجاري<br />
                • تاريخ التسجيل<br />
                • حالة المنظمة
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-green-600">💰</span>
                المعلومات المالية
              </h3>
              <p className="text-gray-500 text-sm">
                • مبلغ الكفيل<br />
                • المبلغ المحول للكفيل<br />
                • المبلغ المتبقي<br />
                • تاريخ آخر تحويل<br />
                • سجل التحويلات
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-purple-600">👥</span>
                الموظفون المرتبطون
              </h3>
              <p className="text-gray-500 text-sm">
                • قائمة الموظفين<br />
                • عدد الموظفين<br />
                • الموظفون النشطون<br />
                • الموظفون المعلقون
              </p>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-orange-600">📊</span>
                العمليات والإحصائيات
              </h3>
              <p className="text-gray-500 text-sm">
                • العمليات اليومية<br />
                • العمليات المكتبية<br />
                • إحصائيات السعودة<br />
                • التقارير الشهرية
              </p>
            </div>
          </Card>
        </div>

        {/* Action Buttons Preview */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">الإجراءات المتاحة</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" disabled>إضافة موظف</Button>
              <Button variant="secondary" disabled>تسجيل عملية يومية</Button>
              <Button variant="secondary" disabled>تسجيل عملية مكتبية</Button>
              <Button variant="secondary" disabled>عرض التقارير</Button>
              <Button variant="secondary" disabled>تصدير البيانات</Button>
            </div>
            <p className="text-gray-500 text-sm mt-3">
              * الأزرار معطلة حالياً - سيتم تفعيلها عند بناء الصفحة
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
