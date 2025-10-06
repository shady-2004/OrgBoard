import { useNavigate } from 'react-router-dom';
import { Table } from './Table';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { canEdit, canDelete } from '../../utils/permissions';

/**
 * Reusable Employees Table Component
 * @param {Object} props
 * @param {Array} props.employees - Array of employee objects
 * @param {Object} props.user - Current user object with role
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {Function} props.onView - Optional callback when view button is clicked
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {boolean} props.showOrganization - Whether to show organization column (default: false)
 * @param {boolean} props.showFinancials - Whether to show financial columns (default: false)
 * @param {boolean} props.showViewButton - Whether to show view button (default: false)
 */
export const EmployeesTable = ({
  employees = [],
  user,
  onEdit,
  onDelete,
  onView,
  loading = false,
  emptyMessage = 'لا يوجد موظفون',
  showOrganization = false,
  showFinancials = false,
  showViewButton = false,
}) => {
  const navigate = useNavigate();

  // Helper function to calculate residence status
  const getResidenceStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const isExpired = expiry < today;
    const isExpiringSoon = expiry >= today && expiry <= thirtyDaysLater;
    
    return { isExpired, isExpiringSoon };
  };

  // Build columns based on props
  const buildColumns = () => {
    const columns = [
      {
        label: 'اسم الموظف',
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

    // Add common columns
    columns.push(
      {
        label: 'رقم الهاتف',
        key: 'phoneNumber',
        className: 'text-gray-600',
      },
      {
        label: 'بواسطة',
        key: 'addedBy',
        className: 'text-gray-600',
        render: (row, value) => value || '-',
      },
      {
        label: 'رقم الإقامة',
        key: 'residencePermitNumber',
        className: 'text-gray-600',
      },
      {
        label: 'تاريخ انتهاء الإقامة',
        key: 'residencePermitExpiry',
        className: 'text-gray-600',
        render: (row, value) => {
          const { isExpired, isExpiringSoon } = getResidenceStatus(value);
          
          return (
            <span className={
              isExpired
                ? 'text-red-600 font-semibold'
                : isExpiringSoon
                ? 'text-orange-600 font-semibold'
                : showOrganization ? 'text-green-600' : ''
            }>
              {formatDate(value)}
              {isExpired && (showOrganization ? ' ❌' : ' (منتهية)')}
              {isExpiringSoon && (showOrganization ? ' ⚠️' : ' (قريبة الانتهاء)')}
              {!isExpired && !isExpiringSoon && showOrganization && ' ✅'}
            </span>
          );
        },
      }
    );

    // Add status badge column if showing organization
    if (showOrganization) {
      columns.push({
        label: 'الحالة',
        key: 'status',
        render: (row) => {
          const { isExpired, isExpiringSoon } = getResidenceStatus(row.residencePermitExpiry);
          
          if (isExpired) {
            return (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                منتهية
              </span>
            );
          } else if (isExpiringSoon) {
            return (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                قريبة الانتهاء
              </span>
            );
          }
          return (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              سارية
            </span>
          );
        },
      });
    }

    // Add financial columns if needed
    if (showFinancials) {
      columns.push(
        {
          label: 'المبلغ المطلوب',
          key: 'requestedAmount',
          className: 'text-gray-900',
          render: (row, value) => formatCurrency(value || 0),
        },
        {
          label: 'الإيرادات',
          key: 'totalRevenue',
          className: 'text-green-600',
          render: (row, value) => formatCurrency(value || 0),
        },
        {
          label: 'المصروفات',
          key: 'totalExpenses',
          className: 'text-red-600',
          render: (row, value) => formatCurrency(value || 0),
        },
        {
          label: 'المتبقي',
          key: 'remaining',
          className: 'text-orange-600 font-semibold',
          render: (row, value) => formatCurrency(value || 0),
        }
      );
    }

    // Add actions column
    columns.push({
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2 justify-end">
          {showViewButton && onView && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onView(row)}
            >
              عرض
            </Button>
          )}
          {canEdit(user?.role) && onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(row)}
            >
              تعديل
            </Button>
          )}
          {canDelete(user?.role) && onDelete && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(row)}
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
      data={employees}
      keyField="_id"
      loading={loading}
      loadingMessage="جاري تحميل الموظفين..."
      emptyMessage={emptyMessage}
    />
  );
};
