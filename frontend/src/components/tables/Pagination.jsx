import { Button } from '../ui/Button';
import { t } from '../../utils/translations';

/**
 * Reusable Pagination Component
 * 
 * @param {Object} props
 * @param {Number} props.currentPage - Current page number
 * @param {Number} props.totalPages - Total number of pages
 * @param {Number} props.totalItems - Total number of items
 * @param {Number} props.itemsPerPage - Items displayed per page
 * @param {Function} props.onPageChange - Page change handler
 * @param {Boolean} props.hasNext - Has next page
 * @param {Boolean} props.hasPrevious - Has previous page
 * @param {String} props.itemLabel - Label for items (e.g., 'منظمة', 'مستخدم')
 * @param {Boolean} props.compact - Use compact layout for smaller spaces
 */
export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasNext = true,
  hasPrevious = true,
  itemLabel = 'عنصر',
  showPageNumbers = true,
  maxPageButtons = 5,
  compact = false,
}) => {
  if (!totalPages || totalPages <= 1) return null;

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxPageButtons - 1) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Compact layout for dashboard and smaller spaces
  if (compact) {
    return (
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          <span className="font-semibold">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
          <span className="mx-2">·</span>
          <span>{totalItems} {itemLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
          >
            السابق
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            التالي
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      {/* Items count info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{t('common.showing')}</span>
        <span className="font-semibold">
          {Math.min(itemsPerPage, totalItems)}
        </span>
        <span>{t('common.of')}</span>
        <span className="font-semibold">{totalItems}</span>
        <span>{itemLabel}</span>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
        >
          {t('common.previous')}
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="flex items-center gap-1">
            {/* First page if not in range */}
            {pageNumbers[0] > 1 && (
              <>
                <button
                  onClick={() => onPageChange(1)}
                  className="px-3 py-1 rounded-md text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  1
                </button>
                {pageNumbers[0] > 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </>
            )}

            {/* Page number buttons */}
            {pageNumbers.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Last page if not in range */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
              <>
                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => onPageChange(totalPages)}
                  className="px-3 py-1 rounded-md text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        )}

        {/* Next button */}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  );
};
