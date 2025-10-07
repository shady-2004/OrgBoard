import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesAPI } from '../../api/employees';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmployeesTable } from '../../components/tables/EmployeesTable';
import { Pagination } from '../../components/tables/Pagination';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';

export const AllEmployeesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [sortBy, setSortBy] = useState('expiry-asc'); // expiry-asc, expiry-desc, name-asc, name-desc
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, employeeId: null, employeeName: '' });

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch all organizations for filter
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations-names'],
    queryFn: () => organizationsAPI.getNamesAndIds(),
  });

  const organizations = organizationsData?.data?.organizations || [];

  // Fetch employees
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-employees', page, limit, debouncedSearch, selectedOrganization],
    queryFn: () => employeesAPI.getAll({ 
      page, 
      limit, 
      search: debouncedSearch,
      organization: selectedOrganization 
    }),
  });

  const employees = data?.data?.employees || [];

  // Filter out vacancies - only show actual employees
  const actualEmployees = employees.filter(emp => emp.type === 'employee');

  // Sort employees on client side
  const sortedEmployees = [...actualEmployees].sort((a, b) => {
    if (sortBy === 'expiry-asc') {
      return new Date(a.residencePermitExpiry) - new Date(b.residencePermitExpiry);
    } else if (sortBy === 'expiry-desc') {
      return new Date(b.residencePermitExpiry) - new Date(a.residencePermitExpiry);
    } else if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name, 'ar');
    } else if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name, 'ar');
    }
    return 0;
  });

    // Calculate statistics based on actual employees only
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const expired = actualEmployees.filter((employee) => {
    const expiryDate = new Date(employee.residencePermitExpiry);
    return expiryDate < now;
  }).length;

  const expiringSoon = actualEmployees.filter((employee) => {
    const expiryDate = new Date(employee.residencePermitExpiry);
    return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
  }).length;

  const valid = actualEmployees.filter((employee) => {
    const expiryDate = new Date(employee.residencePermitExpiry);
    return expiryDate > thirtyDaysFromNow;
  }).length;

  const stats = {
    expired,
    expiringSoon,
    valid
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => employeesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-employees']);
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

  const handleOrganizationChange = (orgId) => {
    setSelectedOrganization(orgId);
    setPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
  };

  const handleEdit = (employee) => {
    navigate(`/employees/edit/${employee._id}`);
  };

  const handleDelete = (employee) => {
    handleDeleteClick(employee);
  };


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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">جميع الموظفين</h1>
              <p className="text-gray-600 mt-1">عرض وإدارة جميع الموظفين مع الفلترة والترتيب</p>
            </div>
            <Button onClick={() => navigate('/organizations')}>
              + إضافة موظف جديد
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {!isLoading && sortedEmployees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 text-white text-3xl p-4 rounded-lg">
                  👥
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-800">{data?.pagination?.total || 0}</p>
                  <p className="text-gray-600 text-sm mt-1">إجمالي الموظفين</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="bg-green-500 text-white text-3xl p-4 rounded-lg">
                  ✅
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-800">{stats.valid}</p>
                  <p className="text-gray-600 text-sm mt-1">إقامات سارية</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 text-white text-3xl p-4 rounded-lg">
                  ⏰
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-800">{stats.expiringSoon}</p>
                  <p className="text-gray-600 text-sm mt-1">قريبة الانتهاء (30 يوم)</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="bg-red-500 text-white text-3xl p-4 rounded-lg">
                  ⚠️
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold text-gray-800">{stats.expired}</p>
                  <p className="text-gray-600 text-sm mt-1">إقامات منتهية</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Sort */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <SearchBar
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                  }}
                  placeholder="ابحث بالاسم أو رقم الإقامة..."
                />
              </div>

              {/* Organization Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فلترة حسب المنظمة
                </label>
                <select
                  value={selectedOrganization}
                  onChange={(e) => handleOrganizationChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع المنظمات</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.ownerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الترتيب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="expiry-asc">تاريخ انتهاء الإقامة (الأقرب أولاً)</option>
                  <option value="expiry-desc">تاريخ انتهاء الإقامة (الأبعد أولاً)</option>
                  <option value="name-asc">الاسم (أ - ي)</option>
                  <option value="name-desc">الاسم (ي - أ)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedOrganization || debouncedSearch) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">الفلاتر النشطة:</span>
                {selectedOrganization && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {organizations.find(o => o._id === selectedOrganization)?.ownerName}
                    <button
                      onClick={() => handleOrganizationChange('')}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    البحث: "{debouncedSearch}"
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setPage(1);
                      }}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Employees Table */}
        {!isLoading && sortedEmployees.length > 0 && (
          <Card>
            <div className="p-6">
              <EmployeesTable
                employees={sortedEmployees}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
                showOrganization={true}
                showFinancials={false}
                showViewButton={true}
              />

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    totalItems={data.pagination.total}
                    itemsPerPage={data.results}
                    onPageChange={setPage}
                    hasNext={!!data.pagination.next}
                    hasPrevious={!!data.pagination.previous}
                    itemLabel="موظف"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && sortedEmployees.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {debouncedSearch || selectedOrganization
                  ? 'لا توجد نتائج للبحث'
                  : 'لا يوجد موظفون بعد'}
              </h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearch || selectedOrganization
                  ? 'حاول تغيير معايير البحث أو الفلترة'
                  : 'ابدأ بإضافة موظفين من صفحة المنظمات'}
              </p>
              {!debouncedSearch && !selectedOrganization && (
                <Button onClick={() => navigate('/organizations')}>
                  انتقل إلى المنظمات
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الموظفين...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">خطأ في تحميل البيانات</h3>
              <p className="text-gray-600 mb-6">
                {error.response?.data?.message || 'حدث خطأ أثناء تحميل الموظفين'}
              </p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
