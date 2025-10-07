import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { organizationDailyOperationsAPI } from '../../api/organizationDailyOperations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { canEdit, canDelete } from '../../utils/permissions';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export const OrganizationDailyOperationsListPage = () => {
  const { id: organizationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, operation: null });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  // Fetch organization
  const { data: orgData } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationsAPI.getById(organizationId),
    enabled: !!organizationId,
  });

  const organization = orgData?.data?.organization;

  // Fetch organization daily operations
  const { data, isLoading } = useQuery({
    queryKey: ['organization-daily-operations', organizationId, page, debouncedStartDate, debouncedEndDate],
    queryFn: () =>
      organizationsAPI.getOrganizationDailyOperations(organizationId, {
        page,
        limit: 10,
        startDate: debouncedStartDate,
        endDate: debouncedEndDate,
      }),
    enabled: !!organizationId,
  });

  const operations = data?.data?.dailyOperations || [];
  const pagination = data?.pagination || {};

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => organizationDailyOperationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-daily-operations']);
      setToast({ visible: true, message: 'تم حذف العملية بنجاح', type: 'success' });
      setDeleteDialog({ open: false, operation: null });
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء حذف العملية',
        type: 'error',
      });
    },
  });

  const handleDeleteClick = (operation) => {
    setDeleteDialog({ open: true, operation });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.operation) {
      deleteMutation.mutate(deleteDialog.operation._id);
    }
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
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, operation: null })}
        onConfirm={handleDeleteConfirm}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف العملية بتاريخ ${
          deleteDialog.operation ? formatDate(deleteDialog.operation.date) : ''
        }؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />

      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button onClick={() => navigate('/organizations')} className="hover:text-blue-600">
            المنظمات
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/organizations/${organizationId}`)} className="hover:text-blue-600">
            {organization?.ownerName}
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">التحويلات المالية</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">التحويلات المالية للمنظمة</h1>
            <p className="text-gray-600 mt-1">
              المبالغ المحولة لمنظمة: <span className="font-semibold">{organization?.ownerName}</span>
            </p>
          </div>
          <Button onClick={() => navigate(`/organization-daily-operations/add?organizationId=${organizationId}`)}>
            + إضافة تحويل جديد
          </Button>
        </div>

        {/* Date Filters */}
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                {(startDate || endDate) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
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

        {/* Loading State */}
        {isLoading && (
          <Card>
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل العمليات اليومية...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && operations.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {startDate || endDate ? 'لا توجد نتائج' : 'لا توجد تحويلات مالية'}
              </h3>
              <p className="text-gray-600 mb-6">
                {startDate || endDate
                  ? 'لا توجد نتائج للفترة المحددة'
                  : 'لا توجد تحويلات مالية مسجلة لهذه المنظمة'}
              </p>
              {!startDate && !endDate && (
                <Button onClick={() => navigate(`/organization-daily-operations/add?organizationId=${organizationId}`)}>
                  + إضافة تحويل جديد
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Operations Table - Only show if there are operations */}
        {!isLoading && operations.length > 0 && (
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
                    label: 'المبلغ',
                    key: 'amount',
                    className: 'text-gray-900 font-semibold',
                    render: (row, value) => (
                      <span className="text-blue-600">{formatCurrency(value)}</span>
                    ),
                  },
                  {
                    label: 'الملاحظات',
                    key: 'notes',
                    className: 'text-gray-600',
                    render: (row, value) => (
                      <span className="max-w-md truncate block" title={value || ''}>
                        {value || '-'}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    render: (row) => (
                      <div className="flex gap-2 justify-end">
                        {canEdit(user?.role) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/organization-daily-operations/edit/${row._id}`)}
                          >
                            تعديل
                          </Button>
                        )}
                        {canDelete(user?.role) && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteClick(row)}
                          >
                            حذف
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={operations}
                keyField="_id"
                loading={isLoading}
                loadingMessage="جاري تحميل العمليات اليومية..."
                emptyMessage={
                  startDate || endDate
                    ? 'لا توجد نتائج للفترة المحددة'
                    : 'لا توجد تحويلات مالية مسجلة لهذه المنظمة'
                }
              />

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                  />
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
};
