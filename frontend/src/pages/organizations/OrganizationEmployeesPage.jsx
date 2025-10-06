import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { employeesAPI } from '../../api/employees';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmployeesTable } from '../../components/tables/EmployeesTable';
import { VacanciesTable } from '../../components/tables/VacanciesTable';
import { Pagination } from '../../components/tables/Pagination';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';

export const OrganizationEmployeesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, employeeId: null, employeeName: '' });

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch organization basic info
  const { data: orgData } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsAPI.getById(id),
    enabled: !!id,
  });

  // Fetch employees
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization-employees', id, page, limit, debouncedSearch],
    queryFn: () => organizationsAPI.getEmployees(id, { page, limit, search: debouncedSearch }),
    enabled: !!id,
  });

  // Fetch employees totals
  const { data: totalsData } = useQuery({
    queryKey: ['organization-employees-totals', id],
    queryFn: () => organizationsAPI.getEmployeesTotals(id),
    enabled: !!id,
  });

  const organization = orgData?.data?.organization;
  const allRecords = data?.data?.employees || [];
  
  // Separate employees and vacancies
  const employees = allRecords.filter(record => record.type === 'employee');
  const vacancies = allRecords.filter(record => record.type === 'vacancy');
  
  // Calculate available vacancy slots (4 - number of actual employees)
  const maxEmployeesPerOrg = 4;
  const availableSlots = Math.max(0, maxEmployeesPerOrg - employees.length);
  
  const totals = totalsData?.data?.totals;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-employees', id]);
      queryClient.invalidateQueries(['organization-employees-totals', id]);
      queryClient.invalidateQueries(['organization-employees-count', id]);
      setToast({ visible: true, message: 'تم حذف الموظف بنجاح', type: 'success' });
      setConfirmDialog({ isOpen: false, employeeId: null, employeeName: '' });
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء حذف الموظف',
        type: 'error',
      });
      setConfirmDialog({ isOpen: false, employeeId: null, employeeName: '' });
    },
  });

  const handleDeleteClick = (employee) => {
    setConfirmDialog({
      isOpen: true,
      employeeId: employee._id,
      employeeName: employee.name,
    });
  };

  const handleDeleteConfirm = () => {
    if (confirmDialog.employeeId) {
      deleteMutation.mutate(confirmDialog.employeeId);
    }
  };

  const handleEdit = (employee) => {
    navigate(`/employees/edit/${employee._id}`);
  };

  const handleDelete = (employee) => {
    handleDeleteClick(employee);
  };

  if (!organization && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">المنظمة غير موجودة</h2>
            <Button onClick={() => navigate('/organizations')}>
              العودة للقائمة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, employeeId: null, employeeName: '' })}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف الموظف"
        message={`هل أنت متأكد من حذف الموظف "${confirmDialog.employeeName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

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
            <span className="text-gray-900 font-medium">الموظفون</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">موظفو {organization?.ownerName}</h1>
              <p className="text-gray-600 mt-1">
                إدارة ومتابعة الموظفين ({employees.length}) والشواغر الوظيفية ({vacancies.length})
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate(`/organizations/${id}`)}>
                العودة للمنظمة
              </Button>
              <Button onClick={() => navigate(`/employees/add?organizationId=${id}`)}>
                + إضافة موظف
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Summary + Insights */}
        {totals && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Financial Summary */}
            <Card className="lg:col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-purple-600">💰</span>
                  الملخص المالي للموظفين
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">إجمالي المطلوب</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totals.totalRequested)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">إجمالي الإيرادات</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(totals.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">إجمالي المصروفات</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(totals.totalExpenses)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">صافي الإيرادات</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(totals.totalRevenueRemaining)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">المتبقي</p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(totals.totalRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vacancy Insights */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-purple-600">📊</span>
                  إحصائيات الشواغر
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">عدد الموظفين الحاليين</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {employees.length} / {maxEmployeesPerOrg}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">الشواغر المتاحة</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {availableSlots}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {availableSlots > 0 ? `يمكن إضافة ${availableSlots} موظف` : 'الحد الأقصى مكتمل'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search */}
        {(employees.length > 0 || vacancies.length > 0) && (
          <SearchBar
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
            placeholder="ابحث عن موظف أو شاغر وظيفي..."
            showResults={!!debouncedSearch}
            resultsText={debouncedSearch}
            resultsCount={data?.pagination?.total}
          />
        )}

        {/* Employees Table */}
        {!isLoading && employees.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-blue-600">👥</span>
                الموظفون ({employees.length})
              </h3>
              <EmployeesTable
                employees={employees}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
                emptyMessage={
                  debouncedSearch
                    ? `لا توجد نتائج للبحث عن "${debouncedSearch}"`
                    : 'لا يوجد موظفون'
                }
                showOrganization={false}
                showFinancials={true}
                showViewButton={false}
              />
            </div>
          </Card>
        )}

        {/* Vacancies Table */}
        {!isLoading && vacancies.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-purple-600">📋</span>
                الشواغر الوظيفية ({vacancies.length})
              </h3>
              <VacanciesTable
                vacancies={vacancies}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
                emptyMessage={
                  debouncedSearch
                    ? `لا توجد نتائج للبحث عن "${debouncedSearch}"`
                    : 'لا توجد شواغر وظيفية'
                }
                showOrganization={false}
              />
            </div>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && (employees.length > 0 || vacancies.length > 0) && data?.pagination && data.pagination.totalPages > 1 && (
          <Card>
            <div className="p-6">
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                totalItems={data.pagination.total}
                itemsPerPage={data.results}
                onPageChange={setPage}
                hasNext={!!data.pagination.next}
                hasPrevious={!!data.pagination.previous}
                itemLabel="سجل"
              />
            </div>
          </Card>
        )}

        {/* Empty State with Action */}
        {!isLoading && employees.length === 0 && vacancies.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {debouncedSearch ? 'لا توجد نتائج للبحث' : 'لا يوجد موظفون أو شواغر وظيفية بعد'}
              </h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearch 
                  ? `لم يتم العثور على نتائج تحتوي على "${debouncedSearch}"`
                  : 'ابدأ بإضافة موظف أو شاغر وظيفي لهذه المنظمة'
                }
              </p>
              {!debouncedSearch && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate(`/employees/add?organizationId=${id}`)}>
                    + إضافة موظف
                  </Button>
                  <Button variant="secondary" onClick={() => navigate(`/employees/add?organizationId=${id}`)}>
                    + إضافة شاغر وظيفي
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
