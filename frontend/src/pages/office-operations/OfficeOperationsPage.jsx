import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { officeOperationsAPI } from '../../api/officeOperations';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';
import { t } from '../../utils/translations';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export const OfficeOperationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    operationId: null, 
    operationDate: '' 
  });

  // Build query parameters
  const queryParams = {
    page,
    limit,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(type && { type }),
    ...(paymentMethod && { paymentMethod }),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['officeOperations', queryParams],
    queryFn: () => officeOperationsAPI.getAll(queryParams),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => officeOperationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['officeOperations']);
      setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' });
      setToast({ visible: true, message: 'تم حذف العملية بنجاح', type: 'success' });
    },
    onError: (error) => {
      setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' });
      setToast({ 
        visible: true, 
        message: `فشل الحذف: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  const handleEdit = (operationId) => {
    navigate(`/office-operations/edit/${operationId}`);
  };

  const handleDelete = (operationId, operationDate) => {
    setConfirmDialog({ isOpen: true, operationId, operationDate });
  };

  const confirmDelete = () => {
    if (confirmDialog.operationId) {
      deleteMutation.mutate(confirmDialog.operationId);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setType('');
    setPaymentMethod('');
    setPage(1);
  };

  const hasActiveFilters = startDate || endDate || type || paymentMethod;

  // Type options
  const typeOptions = [
    { value: 'expense', label: 'مصروف' },
    { value: 'revenue', label: 'إيراد' },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'cash', label: 'نقدي' },
    { value: 'bank', label: 'بنكي' },
    { value: 'credit', label: 'بطاقة ائتمان' },
    { value: 'other', label: 'أخرى' },
  ];

  // Helper function to get type label
  const getTypeLabel = (type) => {
    const option = typeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  // Helper function to get payment method label
  const getPaymentMethodLabel = (method) => {
    const option = paymentMethodOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  };

  // Calculate totals
  const totals = data?.data?.officeOperations?.reduce(
    (acc, op) => {
      if (op.type === 'expense') {
        acc.expenses += op.amount;
      } else {
        acc.revenues += op.amount;
      }
      acc.net = acc.revenues - acc.expenses;
      return acc;
    },
    { expenses: 0, revenues: 0, net: 0 }
  ) || { expenses: 0, revenues: 0, net: 0 };

  return (
    <>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, operationId: null, operationDate: '' })}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف عملية "${confirmDialog.operationDate}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        confirmVariant="danger"
        isLoading={deleteMutation.isLoading}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('officeOperations.title')}</h1>
            <p className="text-gray-600 mt-1">{t('officeOperations.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/office-operations/add')}>
            {t('officeOperations.addOperation')}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">الفلاتر</h2>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  من تاريخ
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  max={endDate || new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إلى تاريخ
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العملية
                </label>
                <Select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                  options={typeOptions}
                  placeholder="جميع الأنواع"
                />
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع
                </label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setPage(1);
                  }}
                  options={paymentMethodOptions}
                  placeholder="جميع الطرق"
                />
              </div>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {startDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      من: {formatDate(startDate)}
                    </span>
                  )}
                  {endDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      إلى: {formatDate(endDate)}
                    </span>
                  )}
                  {type && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                      النوع: {getTypeLabel(type)}
                    </span>
                  )}
                  {paymentMethod && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      الدفع: {getPaymentMethodLabel(paymentMethod)}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Summary Cards */}
        {data?.data?.officeOperations && data.data.officeOperations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.revenues)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📈</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.expenses)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📉</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الصافي</p>
                    <p className={`text-2xl font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatCurrency(totals.net)}
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${totals.net >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Table */}
        <Table
          columns={[
            {
              label: 'التاريخ',
              key: 'date',
              className: 'text-gray-900 font-medium',
              render: (row, value) => (
                <>{formatDate(value)}</>
              ),
            },
            {
              label: 'النوع',
              key: 'type',
              render: (row, value) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  value === 'expense' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getTypeLabel(value)}
                </span>
              ),
            },
            {
              label: 'المبلغ',
              key: 'amount',
              className: 'text-gray-900 font-semibold',
              render: (row, value) => (
                <span className={row.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(value)}
                </span>
              ),
            },
            {
              label: 'طريقة الدفع',
              key: 'paymentMethod',
              className: 'text-gray-600',
              render: (row, value) => (
                <>{getPaymentMethodLabel(value)}</>
              ),
            },
            {
              label: 'الملاحظات',
              key: 'notes',
              className: 'text-gray-600',
              render: (row, value) => (
                <>{value || '-'}</>
              ),
            },
            {
              key: 'actions',
              render: (row) => (
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row._id);
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row._id, formatDate(row.date));
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? 'جاري الحذف...' : t('common.delete')}
                  </Button>
                </div>
              ),
            },
          ]}
          data={data?.data?.officeOperations}
          keyField="_id"
          emptyMessage={t('officeOperations.noOperations')}
          loading={isLoading}
          loadingMessage="جاري تحميل العمليات..."
        />

        {/* Pagination */}
        {data?.pagination && (
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
        )}
      </div>
    </>
  );
};
