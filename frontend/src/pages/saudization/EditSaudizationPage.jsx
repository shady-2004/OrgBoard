import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { saudizationAPI } from '../../api/saudization';
import { organizationsAPI } from '../../api/organizations';
import { Card } from '../../components/ui/Card';
import { useEffect } from 'react';

export const EditSaudizationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const deportationStatus = watch('deportationStatus');

  // Fetch saudization record
  const { data, isLoading } = useQuery({
    queryKey: ['saudization', id],
    queryFn: () => saudizationAPI.getById(id),
  });

  // Fetch organizations for dropdown
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsAPI.getAll(),
  });

  const organizations = orgsData?.data?.organizations || [];

  const updateMutation = useMutation({
    mutationFn: (data) => saudizationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['saudization']);
      navigate('/saudization');
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (data?.data?.saudization) {
      const record = data.data.saudization;
      reset({
        organization: record.organization?._id || record.organization,
        employeeName: record.employeeName,
        date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
        workPermitStatus: record.workPermitStatus,
        deportationStatus: record.deportationStatus,
        deportationDate: record.deportationDate ? new Date(record.deportationDate).toISOString().split('T')[0] : '',
        notes: record.notes || '',
      });
    }
  }, [data, reset]);

  const onSubmit = (formData) => {
    const submitData = {
      ...formData,
      date: new Date(formData.date).toISOString(),
    };

    if (formData.deportationDate) {
      submitData.deportationDate = new Date(formData.deportationDate).toISOString();
    }

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/saudization')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← العودة للقائمة
        </button>
        <h1 className="text-3xl font-bold text-gray-800">تعديل سجل السعودة</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنظمة <span className="text-red-500">*</span>
            </label>
            <select
              {...register('organization', { required: 'المنظمة مطلوبة' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر المنظمة</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.ownerName}
                </option>
              ))}
            </select>
            {errors.organization && (
              <p className="text-red-500 text-sm mt-1">{errors.organization.message}</p>
            )}
          </div>

          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم الموظف <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('employeeName', {
                required: 'اسم الموظف مطلوب',
                minLength: { value: 2, message: 'الاسم يجب أن يكون حرفين على الأقل' },
                maxLength: { value: 100, message: 'الاسم لا يجب أن يتجاوز 100 حرف' },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل اسم الموظف"
            />
            {errors.employeeName && (
              <p className="text-red-500 text-sm mt-1">{errors.employeeName.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('date', { required: 'التاريخ مطلوب' })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Work Permit Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة رخصة العمل <span className="text-red-500">*</span>
            </label>
            <select
              {...register('workPermitStatus', { required: 'حالة رخصة العمل مطلوبة' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر الحالة</option>
              <option value="pending">قيد الانتظار</option>
              <option value="issue_problem">مشكلة في الإصدار</option>
              <option value="issued">تم الإصدار</option>
            </select>
            {errors.workPermitStatus && (
              <p className="text-red-500 text-sm mt-1">{errors.workPermitStatus.message}</p>
            )}
          </div>

          {/* Deportation Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              حالة الإبعاد <span className="text-red-500">*</span>
            </label>
            <select
              {...register('deportationStatus', { required: 'حالة الإبعاد مطلوبة' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">اختر الحالة</option>
              <option value="pending">قيد الانتظار</option>
              <option value="deported">تم الإبعاد</option>
            </select>
            {errors.deportationStatus && (
              <p className="text-red-500 text-sm mt-1">{errors.deportationStatus.message}</p>
            )}
          </div>

          {/* Deportation Date - shown only if status is deported */}
          {deportationStatus === 'deported' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الإبعاد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register('deportationDate', {
                  required: deportationStatus === 'deported' ? 'تاريخ الإبعاد مطلوب عند اختيار حالة تم الإبعاد' : false,
                })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deportationDate && (
                <p className="text-red-500 text-sm mt-1">{errors.deportationDate.message}</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 500, message: 'الملاحظات لا يجب أن تتجاوز 500 حرف' }
              })}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أضف أي ملاحظات إضافية..."
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/saudization')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>

          {updateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
