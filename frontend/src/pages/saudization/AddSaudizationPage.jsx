import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { saudizationAPI } from '../../api/saudization';
import { organizationsAPI } from '../../api/organizations';
import { Card } from '../../components/ui/Card';

export const AddSaudizationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    }
  });

  const deportationStatus = watch('deportationStatus');

  // Fetch organizations for dropdown
  const { data: orgsData } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsAPI.getAll(),
  });

  const organizations = orgsData?.data?.organizations || [];

  const createMutation = useMutation({
    mutationFn: saudizationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['saudization']);
      navigate('/saudization');
    },
  });

  const onSubmit = (data) => {
    const submitData = {
      ...data,
      date: new Date(data.date).toISOString(),
    };

    if (data.deportationDate) {
      submitData.deportationDate = new Date(data.deportationDate).toISOString();
    }

    createMutation.mutate(submitData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate('/saudization')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← العودة للقائمة
        </button>
        <h1 className="text-3xl font-bold text-gray-800">إضافة سجل سعودة جديد</h1>
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
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>

          {createMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
