import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchBar } from '../../components/ui/SearchBar';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';
import { canEdit, canDelete } from '../../utils/permissions';
import { t } from '../../utils/translations';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    orgId: null, 
    orgName: '' 
  });
  
  // Debounce search input using custom hook
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', page, limit, debouncedSearch],
    queryFn: () => organizationsAPI.getAll({ page, limit, ownerName: debouncedSearch }),
    keepPreviousData: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => organizationsAPI.delete(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['organizations']);
      setConfirmDialog({ isOpen: false, orgId: null, orgName: '' });
      setToast({ visible: true, message: 'تم حذف المنظمة بنجاح', type: 'success' });
    },
    onError: (error) => {
      setConfirmDialog({ isOpen: false, orgId: null, orgName: '' });
      setToast({ 
        visible: true, 
        message: `فشل الحذف: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  const handleRowClick = (org) => {
    navigate(`/organizations/${org._id}`);
  };

  const handleEdit = (orgId) => {
    navigate(`/organizations/edit/${orgId}`);
  };

  const handleDelete = (orgId, orgName) => {
    setConfirmDialog({ isOpen: true, orgId, orgName });
  };

  const confirmDelete = () => {
    if (confirmDialog.orgId) {
      deleteMutation.mutate(confirmDialog.orgId);
    }
  };

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
        onClose={() => setConfirmDialog({ isOpen: false, orgId: null, orgName: '' })}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف منظمة "${confirmDialog.orgName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        confirmVariant="danger"
        isLoading={deleteMutation.isLoading}
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('organizations.title')}</h1>
            <p className="text-gray-600 mt-1">{t('organizations.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/organizations/add')}>
            {t('organizations.addOrganization')}
          </Button>
        </div>

        {/* Search Bar - Reusable Component */}
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(1); // Reset to page 1 when search changes
          }}
          placeholder="ابحث عن منظمة بالاسم..."
          showResults={!!debouncedSearch}
          resultsText={debouncedSearch}
          resultsCount={data?.pagination?.total}
        />

        {/* Table with columns definition */}
        <Table
          onRowClick={handleRowClick}
          columns={[
            {
              label: t('organizations.ownerName'),
              key: 'ownerName',
              className: 'text-gray-900',
            },
            {
              label: t('organizations.nationalId'),
              key: 'nationalId',
              className: 'text-gray-600',
            },
            {
              label: t('organizations.commercialRecord'),
              key: 'commercialRecordNumber',
              className: 'text-gray-600',
            },
            {
              label: t('organizations.absherCode'),
              key: 'absherCode',
              className: 'text-gray-900',
            
            },
            {
              label: t('organizations.birthDate'),
              key: 'birthDate',
              className: 'text-gray-600',
              render: (row, value) => (
                <>{value ? new Date(value).toLocaleDateString('ar-SA') : '-'}</>
              ),
            },
            {
              key: 'actions',
              render: (row) => (
                <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                  {canEdit(user?.role) && (
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
                  )}
                  {canDelete(user?.role) && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row._id, row.ownerName);
                      }}
                      disabled={deleteMutation.isLoading}
                    >
                      {deleteMutation.isLoading ? 'جاري الحذف...' : t('common.delete')}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={data?.data?.organizations}
          keyField="_id"
          emptyMessage={t('organizations.noOrganizations')}
          loading={isLoading}
          loadingMessage={t('organizations.loadingOrganizations')}
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
            itemLabel="منظمة"
          />
        )}
      </div>
    </>
  );
};
