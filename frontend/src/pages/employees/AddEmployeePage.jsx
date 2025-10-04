import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { employeesAPI } from '../../api/employees';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';

export const AddEmployeePage = () => {
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
  } = useForm();

  // Fetch organization name
  const { data: orgData, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationsAPI.getById(organizationId),
    enabled: !!organizationId,
  });

  const organization = orgData?.data?.organization;

  const createMutation = useMutation({
    mutationFn: (data) => employeesAPI.create(data),
    onSuccess: () => {
      setToast({ visible: true, message: 'تم إضافة الموظف بنجاح', type: 'success' });
      setTimeout(() => {
        navigate(`/organizations/${organizationId}/employees`, { replace: true });
      }, 1500);
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف',
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

    // Convert dates to ISO format
    if (cleanedData.residencePermitExpiry) {
      cleanedData.residencePermitExpiry = new Date(cleanedData.residencePermitExpiry).toISOString();
    }
    if (cleanedData.workCardIssueDate) {
      cleanedData.workCardIssueDate = new Date(cleanedData.workCardIssueDate).toISOString();
    }

    // Convert requestedAmount to number
    if (cleanedData.requestedAmount) {
      cleanedData.requestedAmount = Number(cleanedData.requestedAmount);
    }

    createMutation.mutate(cleanedData);
  };

  // Don't render form until organization is loaded
  if (!organizationId || orgLoading) {
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
            <button onClick={() => navigate(`/organizations/${organizationId}/employees`)} className="hover:text-blue-600">
              الموظفون
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">إضافة موظف جديد</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">إضافة موظف جديد</h1>
          <p className="text-gray-600 mt-1">
            إضافة موظف جديد لمنظمة: <span className="font-semibold">{organization?.ownerName}</span>
          </p>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name', { required: 'اسم الموظف مطلوب' })}
                  placeholder="أدخل اسم الموظف الكامل"
                  error={errors.name?.message}
                />
              </div>

              {/* Residence Permit Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الإقامة <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('residencePermitNumber', { required: 'رقم الإقامة مطلوب' })}
                  placeholder="أدخل رقم الإقامة"
                  error={errors.residencePermitNumber?.message}
                />
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Residence Permit Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء الإقامة <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    {...register('residencePermitExpiry', { required: 'تاريخ انتهاء الإقامة مطلوب' })}
                    error={errors.residencePermitExpiry?.message}
                  />
                </div>

                {/* Work Card Issue Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ إصدار رخصة العمل
                  </label>
                  <Input
                    type="date"
                    {...register('workCardIssueDate', {
                      validate: (value) => {
                        if (!value) return true; // Optional field
                        const selectedDate = new Date(value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
                        if (selectedDate > today) {
                          return 'تاريخ إصدار رخصة العمل يجب أن يكون في الماضي';
                        }
                        return true;
                      }
                    })}
                    error={errors.workCardIssueDate?.message}
                  />
                </div>
              </div>

              {/* Requested Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ المطلوب <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('requestedAmount', {
                    required: 'المبلغ المطلوب مطلوب',
                    min: { value: 0, message: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' },
                  })}
                  placeholder="أدخل المبلغ المطلوب"
                  error={errors.requestedAmount?.message}
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
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة موظف'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/organizations/${organizationId}/employees`)}
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
