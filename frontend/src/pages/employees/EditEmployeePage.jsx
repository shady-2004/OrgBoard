import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeesAPI } from '../../api/employees';
import { organizationsAPI } from '../../api/organizations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';

export const EditEmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [selectedType, setSelectedType] = useState('employee');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  // Fetch employee data
  const { data: empData, isLoading: empLoading, error: empError } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesAPI.getById(id),
    enabled: !!id,
  });

  const employee = empData?.data?.employee;
  const organizationId = employee?.organization?._id || employee?.organization;

  // Fetch organization name
  const { data: orgData } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: () => organizationsAPI.getById(organizationId),
    enabled: !!organizationId,
  });

  const organization = orgData?.data?.organization;

  // Populate form with employee data
  useEffect(() => {
    if (employee) {
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setSelectedType(employee.type || 'employee');

      reset({
        type: employee.type || 'employee',
        name: employee.name || '',
        isSold: employee.isSold || false,
        hasArrived: employee.hasArrived || false,
        nationality: employee.nationality || '',
        phoneNumber: employee.phoneNumber || '',
        addedBy: employee.addedBy || '',
        residencePermitNumber: employee.residencePermitNumber || '',
        residencePermitExpiry: formatDateForInput(employee.residencePermitExpiry),
        workCardIssueDate: formatDateForInput(employee.workCardIssueDate),
        requestedAmount: employee.requestedAmount || '',
      });
    }
  }, [employee, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => employeesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      queryClient.invalidateQueries(['employee', id]);
      queryClient.invalidateQueries(['organization', organizationId, 'employees']);
      setToast({ visible: true, message: 'تم تحديث الموظف بنجاح', type: 'success' });
      setTimeout(() => {
        navigate(`/organizations/${organizationId}/employees`, { replace: true });
      }, 1500);
    },
    onError: (error) => {
      setToast({
        visible: true,
        message: error.response?.data?.message || 'حدث خطأ أثناء تحديث الموظف',
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

    // Convert booleans
    if (cleanedData.isSold !== undefined) {
      cleanedData.isSold = cleanedData.isSold === 'true' || cleanedData.isSold === true;
    }
    if (cleanedData.hasArrived !== undefined) {
      cleanedData.hasArrived = cleanedData.hasArrived === 'true' || cleanedData.hasArrived === true;
    }

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

    updateMutation.mutate(cleanedData);
  };

  // Loading state
  if (empLoading) {
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
            <p className="text-gray-600">جاري تحميل بيانات الموظف...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (empError || !employee) {
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
                {empError?.response?.data?.message || 'حدث خطأ أثناء تحميل بيانات الموظف'}
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
            <button onClick={() => navigate(`/organizations/${organizationId}/employees`)} className="hover:text-blue-600">
              الموظفون
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">تعديل موظف</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">تعديل موظف</h1>
          <p className="text-gray-600 mt-1">
            تحديث بيانات الموظف: <span className="font-semibold">{employee?.name}</span>
          </p>
        </div>

        {/* Form */}
        <Card>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Selection */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع السجل <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="employee"
                      {...register('type')}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">موظف</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="vacancy"
                      {...register('type')}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">شاغر وظيفي</span>
                  </label>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  يمكنك تحويل الشاغر الوظيفي إلى موظف والعكس
                </p>
              </div>

              {/* Employee/Vacancy Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedType === 'vacancy' ? 'اسم الشاغر الوظيفي' : 'اسم الموظف'} <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name', { required: selectedType === 'vacancy' ? 'اسم الشاغر الوظيفي مطلوب' : 'اسم الموظف مطلوب' })}
                  placeholder={selectedType === 'vacancy' ? 'مثال: سائق، عامل نظافة، محاسب' : 'أدخل اسم الموظف الكامل'}
                  error={errors.name?.message}
                />
              </div>

              {/* Vacancy Fields */}
              {selectedType === 'vacancy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  {/* Has Arrived */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تم الوصول
                    </label>
                    <select
                      {...register('hasArrived')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">لا</option>
                      <option value="true">نعم</option>
                    </select>
                  </div>

                  {/* Is Sold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تم البيع
                    </label>
                    <select
                      {...register('isSold')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">لا</option>
                      <option value="true">نعم</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Employee Fields - Only show if type is 'employee' */}
              {selectedType === 'employee' && (
                <>
                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الجنسية <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('nationality', { 
                        required: selectedType === 'employee' ? 'الجنسية مطلوبة' : false,
                        minLength: { value: 2, message: 'الجنسية يجب أن تكون حرفين على الأقل' },
                        maxLength: { value: 50, message: 'الجنسية لا يمكن أن تتجاوز 50 حرف' }
                      })}
                      placeholder="أدخل الجنسية (مثال: سعودي، مصري، هندي)"
                      error={errors.nationality?.message}
                    />
                  </div>

                  {/* Phone Number and Added By Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <Input
                        {...register('phoneNumber', { 
                          required: selectedType === 'employee' ? 'رقم الهاتف مطلوب' : false,
                          pattern: {
                            value: /^(05|\+9665)[0-9]{8}$/,
                            message: 'صيغة رقم الهاتف غير صحيحة (مثال: 0512345678)'
                          }
                        })}
                        placeholder="05xxxxxxxx"
                        error={errors.phoneNumber?.message}
                      />
                    </div>

                    {/* Added By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بواسطة
                      </label>
                      <Input
                        {...register('addedBy')}
                        placeholder="اسم الشخص المضاف من قبله (اختياري)"
                        error={errors.addedBy?.message}
                      />
                    </div>
                  </div>

                  {/* Residence Permit Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الإقامة <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('residencePermitNumber', { required: selectedType === 'employee' ? 'رقم الإقامة مطلوب' : false })}
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
                        {...register('residencePermitExpiry', { required: selectedType === 'employee' ? 'تاريخ انتهاء الإقامة مطلوب' : false })}
                        error={errors.residencePermitExpiry?.message}
                      />
                    </div>

                    {/* Work Card Issue Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ إصدار رخصة العمل <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        {...register('workCardIssueDate', {
                          required: selectedType === 'employee' ? 'تاريخ إصدار رخصة العمل مطلوب' : false,
                          validate: (value) => {
                            if (!value) return true;
                            const selectedDate = new Date(value);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
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

                </>
              )}

              {/* Requested Amount - Available for both employees and vacancies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ المطلوب
                </label>
                <Input
                  type="number"
                  {...register('requestedAmount', {
                    min: { value: 0, message: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' },
                  })}
                  placeholder="أدخل المبلغ المطلوب (اختياري)"
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
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? 'جاري التحديث...' : 'تحديث الموظف'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/organizations/${organizationId}/employees`)}
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
