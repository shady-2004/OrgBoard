import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/tables/Table';
import { Pagination } from '../../components/tables/Pagination';
import { dailyOperationsAPI } from '../../api/dailyOperations';
import { organizationsAPI } from '../../api/organizations';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export const DailyOperationsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const limit = 10;

  // Fetch daily operations with filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['allDailyOperations', page, search, startDate, endDate, selectedOrganization],
    queryFn: () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedOrganization) params.organization = selectedOrganization;
      return dailyOperationsAPI.getAll(params);
    },
  });

  // Fetch organizations for filter dropdown
  const { data: organizationsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsAPI.getAll({ page: 1, limit: 1000 }),
  });

  const operations = data?.data?.dailyOperations || [];
  const pagination = data?.data?.pagination || {};
  const organizations = organizationsData?.data?.organizations || [];

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedOrganization('');
    setPage(1);
  };

  const hasActiveFilters = search || startDate || endDate || selectedOrganization;

  // Payment method helper
  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: 'كاش',
      transfer: 'تحويل بنكي',
      mada: 'شبكة',
      visa: 'فيزا',
      other: 'أخرى',
    };
    return methods[method] || method;
  };

  // Category helper
  const getCategoryLabel = (category) => {
    return category === 'revenue' ? 'إيراد' : 'مصروف';
  };

  const columns = [
    {
      label: 'التاريخ',
      key: 'date',
      render: (row, value) => formatDate(value),
    },
    {
      label: 'المنظمة',
      key: 'organization',
      render: (row, value) => (
        <button
          onClick={() => navigate(`/organizations/${row.organization?._id}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {row.organization?.ownerName || 'غير محدد'}
        </button>
      ),
    },
    {
      label: 'الموظف',
      key: 'employee',
      render: (row, value) => value?.name || 'غير محدد',
    },
    {
      label: 'النوع',
      key: 'category',
      render: (row, value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'revenue'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {getCategoryLabel(value)}
        </span>
      ),
    },
    {
      label: 'المبلغ',
      key: 'amount',
      render: (row, value) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      label: 'طريقة الدفع',
      key: 'paymentMethod',
      render: (row, value) => getPaymentMethodLabel(value),
    },
    {
      label: 'رقم الفاتورة',
      key: 'invoice',
      render: (row, value) => value || '-',
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <p className="text-red-600 mb-4">حدث خطأ في تحميل العمليات اليومية</p>
            <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">العمليات اليومية</h1>
          <p className="text-gray-600 mt-1">عرض جميع العمليات اليومية</p>
        </div>
        <Button onClick={() => navigate('/organizations')}>
          + إضافة عملية يومية
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            البحث والتصفية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search by Employee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بحث باسم الموظف
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="ابحث باسم الموظف..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter by Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المنظمة
              </label>
              <select
                value={selectedOrganization}
                onChange={(e) => {
                  setSelectedOrganization(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">كل المنظمات</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.ownerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
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

            {/* End Date */}
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
          </div>

          {/* Active Filters Display & Clear Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {search && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    الموظف: {search}
                  </span>
                )}
                {selectedOrganization && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    المنظمة: {organizations.find(o => o._id === selectedOrganization)?.ownerName}
                  </span>
                )}
                {startDate && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    من: {formatDate(startDate)}
                  </span>
                )}
                {endDate && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    إلى: {formatDate(endDate)}
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                ✕ مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              قائمة العمليات اليومية
              {pagination.total > 0 && (
                <span className="text-sm text-gray-500 font-normal mr-2">
                  ({pagination.total} عملية)
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : operations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {hasActiveFilters
                  ? 'لا توجد عمليات يومية تطابق معايير البحث'
                  : 'لا توجد عمليات يومية'}
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table columns={columns} data={operations} />
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages || 1}
                  onPageChange={setPage}
                  totalItems={pagination.total || 0}
                  itemsPerPage={limit}
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
