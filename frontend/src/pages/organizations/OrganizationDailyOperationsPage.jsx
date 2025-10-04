import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { dailyOperationsAPI } from '../../api/dailyOperations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export const OrganizationDailyOperationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, operationId: null, operationDate: '' });

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  // Fetch organization basic info
  const { data: orgData } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsAPI.getById(id),
    enabled: !!id,
  });

  // Fetch daily operations
  const { data, isLoading, error } = useQuery({
    queryKey: ['organization-daily-operations', id, page, limit, debouncedSearch, debouncedStartDate, debouncedEndDate],
    queryFn: () => organizationsAPI.getDailyOperations(id, { 
      page, 
      limit, 
      employeeName: debouncedSearch,
      startDate: debouncedStartDate,
      endDate: debouncedEndDate,
    }),
    enabled: !!id,
  });

  // Fetch daily operations totals
  const { data: totalsData } = useQuery({
    queryKey: ['organization-daily-ops-totals', id],
    queryFn: () => organizationsAPI.getDailyOperationsTotals(id),
    enabled: !!id,
  });

  const organization = orgData?.data?.organization;
  const dailyOperations = data?.data?.dailyOperations || [];
  const totals = totalsData?.data?.totals;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => dailyOperationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-daily-operations', id]);
      queryClient.invalidateQueries(['organization-daily-ops-totals', id]);
      queryClient.invalidateQueries(['organization-daily-ops-count', id]);
      setToast({ visible: true, message: 'تم حذف العملية بنجاح', type: 'success' });
      setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' });
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء حذف العملية',
        type: 'error',
      });
      setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' });
    },
  });

  const handleDeleteClick = (operation) => {
    setConfirmDialog({
      isOpen: true,
      operationId: operation._id,
      operationDate: formatDate(operation.date),
    });
  };

  const handleDeleteConfirm = () => {
    if (confirmDialog.operationId) {
      deleteMutation.mutate(confirmDialog.operationId);
    }
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
        onClose={() => setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' })}
        onConfirm={handleDeleteConfirm}
        title="تأكيد حذف العملية"
        message={`هل أنت متأكد من حذف العملية بتاريخ "${confirmDialog.operationDate}"؟ لا يمكن التراجع عن هذا الإجراء.`}
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
              <Button onClick={() => navigate(`/daily-operations/add?organizationId=${id}`)}>
                + تسجيل عملية يومية
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        {totals && (
          <Card className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-purple-600">💰</span>
                الملخص المالي للعمليات اليومية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className={`${totals.netAmount >= 0 ? 'bg-blue-50' : 'bg-red-50'} rounded-lg p-4`}>
                  <p className="text-sm text-gray-500 mb-1">صافي المبلغ</p>
                  <p className={`text-xl font-bold ${totals.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.netAmount)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بحث بالموظف
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ابحث عن موظف..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                {(startDate || endDate || searchTerm) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSearchTerm('');
                      setPage(1);
                    }}
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Daily Operations Table - Only show if there are operations */}
        {!isLoading && dailyOperations.length > 0 && (
          <Card>
            <div className="p-6">
              <Table
                columns={[
                  {
                    label: 'التاريخ',
                    key: 'date',
                    className: 'text-gray-900 font-medium',
                    render: (row, value) => formatDate(value),
                  },
                  {
                    label: 'اسم الموظف',
                    key: 'employee',
                    className: 'text-gray-600',
                    render: (row, value) => value?.name || '-',
                  },
                  {
                    label: 'النوع',
                    key: 'category',
                    render: (row, value) => (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        value === 'revenue'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {value === 'revenue' ? 'إيراد' : 'مصروف'}
                      </span>
                    ),
                  },
                  {
                    label: 'المبلغ',
                    key: 'amount',
                    render: (row, value) => (
                      <span className={`font-semibold ${
                        row.category === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(value || 0)}
                      </span>
                    ),
                  },
                  {
                    label: 'طريقة الدفع',
                    key: 'paymentMethod',
                    className: 'text-gray-600',
                    render: (row, value) => {
                      const methods = {
                        cash: 'نقدي',
                        transfer: 'تحويل',
                        check: 'شيك',
                      };
                      return methods[value] || value;
                    },
                  },
                  {
                    label: 'رقم الفاتورة',
                    key: 'invoice',
                    className: 'text-gray-600',
                    render: (row, value) => value || '-',
                  },
                  {
                    label: 'ملاحظات',
                    key: 'notes',
                    className: 'text-gray-600 max-w-xs truncate',
                    render: (row, value) => value || '-',
                  },
                  {
                    key: 'actions',
                    render: (row) => (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/daily-operations/edit/${row._id}`)}
                        >
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteClick(row)}
                        >
                          حذف
                        </Button>
                      </div>
                    ),
                  },
                ]}
                data={dailyOperations}
                keyField="_id"
                loading={isLoading}
                loadingMessage="جاري تحميل العمليات اليومية..."
                emptyMessage={
                  debouncedSearch
                    ? `لا توجد نتائج للبحث عن "${debouncedSearch}"`
                    : 'لا توجد عمليات يومية مسجلة لهذه المنظمة'
                }
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
                    itemLabel="عملية"
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Empty State with Action */}
        {!isLoading && dailyOperations.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {debouncedSearch ? 'لا توجد نتائج للبحث' : 'لا توجد عمليات يومية بعد'}
              </h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearch 
                  ? `لم يتم العثور على عمليات تحتوي على "${debouncedSearch}"`
                  : 'ابدأ بتسجيل أول عملية يومية لهذه المنظمة'
                }
              </p>
              {!debouncedSearch && (
                <Button onClick={() => navigate(`/daily-operations/add?organizationId=${id}`)}>
                  + تسجيل أول عملية
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
