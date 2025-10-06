import { useNavigate } from 'react-router-dom';
import { Table } from './Table';
import { Button } from '../ui/Button';
import { canEdit, canDelete } from '../../utils/permissions';

/**
 * Reusable Vacancies Table Component
 * @param {Object} props
 * @param {Array} props.vacancies - Array of vacancy objects
 * @param {Object} props.user - Current user object with role
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {boolean} props.showOrganization - Whether to show organization column (default: false)
 */
export const VacanciesTable = ({
  vacancies = [],
  user,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = 'لا يوجد شواغر وظيفية',
  showOrganization = false,
}) => {
  const navigate = useNavigate();

  // Build columns
  const buildColumns = () => {
    const columns = [
      {
        label: 'اسم الشاغر الوظيفي',
        key: 'name',
        className: 'text-gray-900 font-medium',
      },
    ];

    // Add organization column if needed
    if (showOrganization) {
      columns.push({
        label: 'المنظمة',
        key: 'organization',
        className: 'text-gray-700',
        render: (row) => row.organization?.ownerName || '-',
      });
    }

    // Add vacancy-specific columns
    columns.push(
      {
        label: 'المبلغ المطلوب',
        key: 'requestedAmount',
        className: 'text-gray-700',
        render: (row) => row.requestedAmount ? `${row.requestedAmount.toLocaleString('ar-SA')} ر.س` : '-',
      },
      {
        label: 'تم الوصول',
        key: 'hasArrived',
        render: (row) => (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.hasArrived 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {row.hasArrived ? 'نعم ✓' : 'لا'}
          </span>
        ),
      },
      {
        label: 'تم البيع',
        key: 'isSold',
        render: (row) => (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            row.isSold 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {row.isSold ? 'نعم ✓' : 'لا'}
          </span>
        ),
      },
      {
        label: 'بواسطة',
        key: 'addedBy',
        className: 'text-gray-600',
        render: (row, value) => value || '-',
      },
      {
        label: 'الحالة',
        key: 'status',
        render: (row) => {
          if (row.hasArrived && row.isSold) {
            return (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                مكتمل ✓
              </span>
            );
          } else if (row.hasArrived) {
            return (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                وصل
              </span>
            );
          } else if (row.isSold) {
            return (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                مباع
              </span>
            );
          } else {
            return (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                قيد الانتظار
              </span>
            );
          }
        },
      }
    );

    // Add actions column
    columns.push({
      key: 'actions',
      render: (row) => (
        <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
          
          {canEdit(user?.role) && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(row)}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              تعديل
            </Button>
          )}
          {canDelete(user?.role) && onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(row)}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              حذف
            </Button>
          )}
        </div>
      ),
    });

    return columns;
  };

  return (
    <Table
      columns={buildColumns()}
      data={vacancies}
      keyField="_id"
      loading={loading}
      loadingMessage="جاري تحميل الشواغر الوظيفية..."
      emptyMessage={emptyMessage}
    />
  );
};
