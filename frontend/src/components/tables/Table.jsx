import { Card } from '../ui/Card';

/**
 * Reusable Table Component
 * 
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 *   - label: Column header text
 *   - key: Data key to access
 *   - render: Optional custom render function (row, value) => JSX
 *   - className: Optional cell className
 *   - headerClassName: Optional header className
 * @param {Array} props.data - Array of data objects
 * @param {String} props.keyField - Unique key field (default: '_id')
 * @param {String} props.emptyMessage - Message when no data
 * @param {Function} props.onRowClick - Optional row click handler
 * @param {Boolean} props.loading - Show loading state
 * @param {String} props.loadingMessage - Loading message
 */
export const Table = ({
  columns = [],
  data = [],
  keyField = '_id',
  emptyMessage = 'لا توجد بيانات',
  onRowClick,
  loading = false,
  loadingMessage = 'جاري التحميل...',
  className = '',
}) => {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">{loadingMessage}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.headerClassName || ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[keyField]}
                  className={`transition-colors ${
                    onRowClick
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column, colIndex) => {
                    const value = column.key
                      ? column.key.split('.').reduce((obj, key) => obj?.[key], row)
                      : null;

                    return (
                      <td
                        key={column.key || colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                          column.className || 'text-gray-900'
                        }`}
                      >
                        {column.render ? column.render(row, value) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
