import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { dailyOperationsAPI } from '../../api/dailyOperations';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';

export const AddDailyOperationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const organizationId = searchParams.get('organizationId');
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Redirect if no organizationId
  useEffect(() => {
    if (!organizationId) {
      setToast({ 
        visible: true, 
        message: 'يجب اختيار منظمة أولاً', 
        type: 'error' 
      });
      setTimeout(() => {
        navigate('/organizations');
      }, 1500);
    }
  }, [organizationId, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      category: 'revenue',
      paymentMethod: 'cash',
    },
  });

  const category = watch('category');

  // Fetch organization name
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationsAPI.getById(organizationId),
    enabled: !!organizationId,
  });

  // Fetch employees names and IDs
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['organization-employees-names', organizationId],
    queryFn: () => organizationsAPI.getEmployeesNamesAndIds(organizationId),
    enabled: !!organizationId,
  });

  const organization = orgData?.data?.organization;
  const employees = employeesData?.data?.employees || [];

  const createMutation = useMutation({
    mutationFn: (data) => dailyOperationsAPI.create(data),
    onSuccess: () => {
      setToast({ visible: true, message: 'تم إضافة العملية اليومية بنجاح', type: 'success' });
      setTimeout(() => {
        navigate(`/organizations/${organizationId}/daily-operations`, { replace: true });
      }, 1500);
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء إضافة العملية اليومية',
        type: 'error',
      });
    },
  });

  const onSubmit = (data) => {
    // Add organizationId to data
    data.organization = organizationId;

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

    createMutation.mutate(cleanedData);
  };

  // Don't render form until organization is loaded
  if (!organizationId || orgLoading || employeesLoading) {
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
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
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
            <button onClick={() => navigate(`/organizations/${organizationId}/daily-operations`)} className="hover:text-blue-600">
              العمليات اليومية
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">إضافة عملية جديدة</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">إضافة عملية يومية جديدة</h1>
          <p className="text-gray-600 mt-1">
            إضافة عملية يومية لمنظمة: <span className="font-semibold">{organization?.ownerName}</span>
          </p>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموظف <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('employee', { required: 'الموظف مطلوب' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.employee ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر الموظف</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {errors.employee && (
                  <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
                )}
                {employees.length === 0 && (
                  <p className="mt-1 text-sm text-orange-600">
                    لا يوجد موظفون في هذه المنظمة. يجب إضافة موظف أولاً.
                  </p>
                )}
              </div>

              {/* Date and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        today.setHours(23, 59, 59, 999); // End of today
                        if (selectedDate > today) {
                          return 'التاريخ يجب أن يكون اليوم أو في الماضي';
                        }
                        return true;
                      }
                    })}
                    error={errors.date?.message}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النوع <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category', { required: 'النوع مطلوب' })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="revenue">إيراد</option>
                    <option value="expense">مصروف</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    {...register('amount', {
                      required: 'المبلغ مطلوب',
                      min: { value: 0, message: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' },
                    })}
                    placeholder="أدخل المبلغ"
                    error={errors.amount?.message}
                  />
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium ${
                    category === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category === 'revenue' ? '+ إيراد' : '- مصروف'}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة الدفع <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('paymentMethod', { required: 'طريقة الدفع مطلوبة' })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="cash">كاش</option>
                  <option value="transfer">تحويل بنكي</option>
                  <option value="mada">شبكة</option>
                  <option value="visa">فيزا</option>
                  <option value="other">أخرى</option>
                </select>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الفاتورة
                </label>
                <Input
                  {...register('invoice')}
                  placeholder="أدخل رقم الفاتورة (اختياري)"
                  error={errors.invoice?.message}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  placeholder="أدخل أي ملاحظات إضافية (اختياري)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
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
                  disabled={createMutation.isPending || employees.length === 0}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة عملية'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/organizations/${organizationId}/daily-operations`)}
                  disabled={createMutation.isPending}
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
