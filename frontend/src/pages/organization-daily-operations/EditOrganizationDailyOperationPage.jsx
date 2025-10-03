import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationDailyOperationsAPI } from '../../api/organizationDailyOperations';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';

export const EditOrganizationDailyOperationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Fetch operation data
  const { data: opData, isLoading: opLoading, error: opError } = useQuery({
    queryKey: ['organization-daily-operation', id],
    queryFn: () => organizationDailyOperationsAPI.getById(id),
    enabled: !!id,
  });

  const operation = opData?.data?.operation;
  const organizationId = operation?.organization?._id || operation?.organization;

  // Fetch organization name
  const { data: orgData } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationsAPI.getById(organizationId),
    enabled: !!organizationId,
  });

  const organization = orgData?.data?.organization;

  // Populate form with operation data
  useEffect(() => {
    if (operation) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      reset({
        date: formatDateForInput(operation.date),
        amount: operation.amount || '',
        notes: operation.notes || '',
      });
    }
  }, [operation, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => organizationDailyOperationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organization-daily-operations']);
      queryClient.invalidateQueries(['organization-daily-operation', id]);
      setToast({ visible: true, message: 'تم تحديث العملية بنجاح', type: 'success' });
      setTimeout(() => {
        navigate(`/organizations/${organizationId}/organization-daily-operations`, { replace: true });
      }, 1500);
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء تحديث العملية',
        type: 'error',
      });
    },
  });

  const onSubmit = (data) => {
    // Clean data - remove empty strings
    const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Convert date to ISO format
    if (cleanedData.date) {
      cleanedData.date = new Date(cleanedData.date).toISOString();
    }

    // Convert amount to number
    if (cleanedData.amount) {
      cleanedData.amount = Number(cleanedData.amount);
    }

    updateMutation.mutate(cleanedData);
  };

  // Loading state
  if (opLoading) {
    return (
      <>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات العملية...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (opError || !operation) {
    return (
      <>
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
        />
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <div className="p-6 text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
              <p className="text-gray-600 mb-4">
                {opError?.response?.data?.message || 'حدث خطأ أثناء تحميل بيانات العملية'}
              </p>
              <Button onClick={() => navigate('/organizations')}>
                العودة للمنظمات
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <button onClick={() => navigate('/organizations')} className="hover:text-blue-600">
              المنظمات
            </button>
            <span>/</span>
            <button onClick={() => navigate(`/organizations/${organizationId}`)} className="hover:text-blue-600">
              {organization?.ownerName}
            </button>
            <span>/</span>
            <button onClick={() => navigate(`/organizations/${organizationId}/organization-daily-operations`)} className="hover:text-blue-600">
              التحويلات المالية
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">تعديل تحويل</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">تعديل تحويل مالي للمنظمة</h1>
          <p className="text-gray-600 mt-1">
            تحديث بيانات التحويل المالي
          </p>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  {...register('date', {
                    required: 'التاريخ مطلوب',
                    validate: (value) => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      if (selectedDate > today) {
                        return 'التاريخ يجب أن يكون اليوم أو في الماضي';
                      }
                      return true;
                    }
                  })}
                  error={errors.date?.message}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ (ريال) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('amount', {
                    required: 'المبلغ مطلوب',
                    min: { value: 0, message: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' },
                  })}
                  placeholder="أدخل المبلغ"
                  error={errors.amount?.message}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الملاحظات
                </label>
                <textarea
                  {...register('notes', {
                    maxLength: { value: 500, message: 'الملاحظات لا يمكن أن تتجاوز 500 حرف' }
                  })}
                  rows={4}
                  placeholder="أدخل ملاحظات (مثل: دفعة من العميل، إيجار مستلم، تحويل من الكفيل...)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

              {/* Required Fields Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ملاحظة:</span> الحقول المميزة بـ{' '}
                  <span className="text-red-500">*</span> مطلوبة
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? 'جاري التحديث...' : 'تحديث التحويل'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/organizations/${organizationId}/organization-daily-operations`)}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};
