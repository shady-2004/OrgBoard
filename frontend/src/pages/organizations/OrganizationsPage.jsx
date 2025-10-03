import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { useNavigate } from 'react-router-dom';
import { t } from '../../utils/translations';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    orgId: null, 
    orgName: '' 
  });
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', page, limit],
    queryFn: () => organizationsAPI.getAll({ page, limit }),
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
              label: t('organizations.sponsorAmount'),
              key: 'sponsorAmount',
              className: 'text-gray-900',
              render: (row, value) => (
                <>{value?.toLocaleString('ar-SA')} {t('organizations.sar')}</>
              ),
            },
            {
              label: t('organizations.transferredAmount'),
              key: 'transferredToSponsorTotal',
              className: 'text-green-600 font-semibold',
              render: (row, value) => (
                <>{value?.toLocaleString('ar-SA')} {t('organizations.sar')}</>
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
                      handleDelete(row._id, row.ownerName);
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? 'جاري الحذف...' : t('common.delete')}
                  </Button>
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
