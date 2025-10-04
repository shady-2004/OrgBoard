import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { saudizationAPI } from '../../api/saudization';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import { t } from '../../utils/translations';

export const SaudizationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentPage, pageSize, setCurrentPage } = usePagination();
  const [searchName, setSearchName] = useState('');
  
  // Debounce search to avoid too many requests
  const debouncedSearchName = useDebounce(searchName, 500);
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    recordId: null, 
    employeeName: '' 
  });

  // Fetch saudization records
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['saudization', currentPage, pageSize, debouncedSearchName],
    queryFn: () => saudizationAPI.getAll({ page: currentPage, limit: pageSize, name: debouncedSearchName }),
    placeholderData: keepPreviousData,
    staleTime: 30000, // 30 seconds
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: saudizationAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['saudization']);
      setConfirmDialog({ isOpen: false, recordId: null, employeeName: '' });
    },
    onError: () => {
      setConfirmDialog({ isOpen: false, recordId: null, employeeName: '' });
    },
  });

  const records = data?.data?.saudizations || [];
  const pagination = data?.pagination || {};

  const handleDelete = (recordId, employeeName) => {
    setConfirmDialog({ isOpen: true, recordId, employeeName });
  };
  
  const confirmDelete = () => {
    if (confirmDialog.recordId) {
      deleteMutation.mutate(confirmDialog.recordId);
    }
  };

  const getWorkPermitStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      issue_problem: 'مشكلة في الإصدار',
      issued: 'تم الإصدار',
    };
    return labels[status] || status;
  };

  const getWorkPermitStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      issue_problem: 'text-red-600 bg-red-50',
      issued: 'text-green-600 bg-green-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getDeportationStatusLabel = (status) => {
    const labels = {
      deported: 'تم الإبعاد',
      pending: 'قيد الانتظار',
    };
    return labels[status] || status;
  };

  const getDeportationStatusColor = (status) => {
    const colors = {
      deported: 'text-red-600 bg-red-50',
      pending: 'text-blue-600 bg-blue-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  // Show loading only on initial load (no data yet)
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">السعودة</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, recordId: null, employeeName: '' })}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف سجل الموظف "${confirmDialog.employeeName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">السعودة</h1>
          <p className="text-gray-600 mt-1">إدارة سجلات السعودة ورخص العمل</p>
        </div>
        <button
          onClick={() => navigate('/saudization/add')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + إضافة سجل جديد
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="p-4 relative">
          <input
            key="search-input"
            type="text"
            placeholder="البحث باسم الموظف..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
          {isFetching && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المنظمة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  اسم الموظف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  حالة رخصة العمل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  حالة الإبعاد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ الإبعاد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    {searchName ? 'لا توجد نتائج للبحث' : 'لا توجد سجلات'}
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {record.organization?.ownerName || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {record.employeeName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getWorkPermitStatusColor(record.workPermitStatus)}`}>
                        {getWorkPermitStatusLabel(record.workPermitStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeportationStatusColor(record.deportationStatus)}`}>
                        {getDeportationStatusLabel(record.deportationStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {record.deportationDate ? formatDate(record.deportationDate) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/saudization/edit/${record._id}`)}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(record._id, record.employeeName)}
                          disabled={deleteMutation.isPending}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              صفحة {pagination.page} من {pagination.totalPages} - إجمالي {pagination.total} سجل
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.previous}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                السابق
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.next}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
