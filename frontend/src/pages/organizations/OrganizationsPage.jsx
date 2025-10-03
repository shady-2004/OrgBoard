import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationsAPI } from '../../api/organizations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { t } from '../../utils/translations';

export const OrganizationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', page, limit],
    queryFn: () => organizationsAPI.getAll({ page, limit }),
    keepPreviousData: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">{t('organizations.loadingOrganizations')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {t('organizations.errorLoading')}: {error.message}
      </div>
    );
  }

  return (
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

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.ownerName')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.nationalId')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.commercialRecord')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.sponsorAmount')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.transferredAmount')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('organizations.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!data?.data?.organizations || data?.data?.organizations?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {t('organizations.noOrganizations')}
                  </td>
                </tr>
              ) : (
                data?.data?.organizations?.map((org) => (
                  <tr key={org._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{org.ownerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{org.nationalId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{org.commercialRecordNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{org.sponsorAmount?.toLocaleString('ar-SA')} {t('organizations.sar')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold text-right">{org.transferredToSponsorTotal?.toLocaleString('ar-SA')} {t('organizations.sar')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="secondary">
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="danger">
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
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{t('common.showing')}</span>
              <span className="font-semibold">{data.results}</span>
              <span>{t('common.of')}</span>
              <span className="font-semibold">{data.pagination.total}</span>
              <span>منظمة</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.previous}
              >
                {t('common.previous')}
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.next}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
