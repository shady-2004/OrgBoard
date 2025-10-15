import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { officeOperationsAPI } from '../../api/officeOperations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';

export const AddOfficeOperationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: '',
      paymentMethod: '',
      notes: '',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => officeOperationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['officeOperations']);
      setToast({ visible: true, message: 'تم إضافة العملية بنجاح', type: 'success' });
      setTimeout(() => {
        navigate('/office-operations', { replace: true });
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء إضافة العملية';
      setToast({ visible: true, message: errorMessage, type: 'error' });
    },
  });

  const onSubmit = (data) => {
    // Format the data
    const formattedData = {
      date: new Date(data.date).toISOString(),
      amount: parseFloat(data.amount),
      type: data.type,
      paymentMethod: data.paymentMethod,
    };

    // Add notes only if provided
    if (data.notes && data.notes.trim()) {
      formattedData.notes = data.notes.trim();
    }

    console.log('Submitting to backend:', formattedData);
    createMutation.mutate(formattedData);
  };

  // Type options
  const typeOptions = [
    { value: 'expense', label: 'مصروف' },
    { value: 'revenue', label: 'إيراد' },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'cash', label: 'كاش' },
    { value: 'transfer', label: 'تحويل بنكي' },
    { value: 'mada', label: 'شبكة' },
    { value: 'visa', label: 'فيزا' },
    { value: 'other', label: 'أخرى' },
  ];

  return (
    <>
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">إضافة عملية مكتب جديدة</h1>
            <p className="text-gray-600 mt-1">أدخل معلومات عملية المكتب</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/office-operations')}>
            إلغاء
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Main Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  معلومات العملية
                </h2>

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
                        validate: {
                          notFuture: (value) => {
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            return selectedDate <= today || 'التاريخ لا يمكن أن يكون في المستقبل';
                          },
                        },
                      })}
                      max={new Date().toISOString().split('T')[0]}
                      error={errors.date?.message}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع العملية <span className="text-red-500">*</span>
                    </label>
                    <Select
                      {...register('type', {
                        required: 'نوع العملية مطلوب',
                      })}
                      options={typeOptions}
                      placeholder="اختر نوع العملية"
                      error={errors.type?.message}
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
                        min: {
                          value: 0,
                          message: 'المبلغ لا يمكن أن يكون سالباً',
                        },
                        max: {
                          value: 100000000,
                          message: 'المبلغ كبير جداً',
                        },
                      })}
                      placeholder="1000.00"
                      min="0"
                      step="0.01"
                      error={errors.amount?.message}
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      طريقة الدفع <span className="text-red-500">*</span>
                    </label>
                    <Select
                      {...register('paymentMethod', {
                        required: 'طريقة الدفع مطلوبة',
                      })}
                      options={paymentMethodOptions}
                      placeholder="اختر طريقة الدفع"
                      error={errors.paymentMethod?.message}
                    />
                  </div>
                </div>

                {/* Notes - Full Width */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الملاحظات
                  </label>
                  <textarea
                    {...register('notes', {
                      maxLength: {
                        value: 500,
                        message: 'الملاحظات لا يمكن أن تتجاوز 500 حرف',
                      },
                    })}
                    rows="4"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أضف أي ملاحظات إضافية هنا..."
                  />
                  {errors.notes && (
                    <span className="text-red-500 text-sm mt-1 block">{errors.notes.message}</span>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    الحد الأقصى: 500 حرف
                  </p>
                </div>
              </div>
            </Card>

            {/* Required Fields Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ملاحظة:</span> الحقول المميزة بـ{' '}
                <span className="text-red-500">*</span> مطلوبة
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/office-operations')}
                disabled={createMutation.isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || isSubmitting}
              >
                {createMutation.isLoading ? 'جاري الحفظ...' : 'حفظ العملية'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
