import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { organizationsAPI } from '../../api/organizations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';

export const EditOrganizationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Fetch organization data
  const { data: orgData, isLoading, error } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsAPI.getById(id),
    enabled: !!id,
  });

  const organization = orgData?.data?.organization;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm();

  // Populate form with organization data
  useEffect(() => {
    if (organization) {
      // Format dates to YYYY-MM-DD for input[type="date"]
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      reset({
        ownerName: organization.ownerName || '',
        ownerPhoneNumber: organization.ownerPhoneNumber || '',
        brokerPhoneNumber: organization.brokerPhoneNumber || '',
        nationalId: organization.nationalId || '',
        absherCode: organization.absherCode || '',
        birthDate: formatDateForInput(organization.birthDate),
        qawiSubscriptionDate: formatDateForInput(organization.qawiSubscriptionDate),
        absherSubscriptionDate: formatDateForInput(organization.absherSubscriptionDate),
        commercialRecordDate: formatDateForInput(organization.commercialRecordDate),
        commercialRecordNumber: organization.commercialRecordNumber || '',
        sponsorAmount: organization.sponsorAmount || '',
      });
    }
  }, [organization, reset]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => organizationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      queryClient.invalidateQueries(['organization', id]);
      setToast({ visible: true, message: 'تم تحديث المنظمة بنجاح', type: 'success' });
      setTimeout(() => {
        navigate(`/organizations/${id}`, { replace: true });
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء تحديث المنظمة';
      setToast({ visible: true, message: errorMessage, type: 'error' });
    },
  });

  const onSubmit = (data) => {
    // Clean up the data: remove empty strings and convert types
    const formattedData = {
      ownerName: data.ownerName.trim(),
      ownerPhoneNumber: data.ownerPhoneNumber.trim(),
      brokerPhoneNumber: data.brokerPhoneNumber.trim(),
      nationalId: data.nationalId.trim(),
      absherCode: data.absherCode.trim().toUpperCase(),
      birthDate: data.birthDate,
      commercialRecordNumber: data.commercialRecordNumber.trim(),
      sponsorAmount: parseInt(data.sponsorAmount, 10),
    };

    // Add optional fields only if they have values
    if (data.qawiSubscriptionDate) {
      formattedData.qawiSubscriptionDate = data.qawiSubscriptionDate;
    }
    if (data.absherSubscriptionDate) {
      formattedData.absherSubscriptionDate = data.absherSubscriptionDate;
    }
    if (data.commercialRecordDate) {
      formattedData.commercialRecordDate = data.commercialRecordDate;
    }

    updateMutation.mutate(formattedData);
  };

  // Validation helper
  const birthDate = watch('birthDate');
  const getMinDate = (type) => {
    if (!birthDate) return '';
    return birthDate;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المنظمة...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <div className="p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
            <p className="text-gray-600 mb-4">
              {error?.response?.data?.message || 'حدث خطأ أثناء تحميل بيانات المنظمة'}
            </p>
            <Button onClick={() => navigate('/organizations')}>
              العودة للقائمة
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-800">تعديل المنظمة</h1>
            <p className="text-gray-600 mt-1">تحديث معلومات المنظمة: {organization.ownerName}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/organizations/${id}`)}>
            إلغاء
          </Button>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                المعلومات الأساسية
              </h2>
              
              {/* Owner Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.ownerName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('ownerName', { 
                    required: 'اسم المالك مطلوب',
                    minLength: { value: 3, message: 'الاسم يجب أن يكون 3 أحرف على الأقل' }
                  })}
                  placeholder="أدخل اسم المالك"
                  error={errors.ownerName?.message}
                />
              </div>

              {/* Phone Numbers Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم جوال صاحب المؤسسة <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('ownerPhoneNumber', {
                      required: 'رقم جوال صاحب المؤسسة مطلوب',
                      pattern: {
                        value: /^(05|\+9665)[0-9]{8}$/,
                        message: 'صيغة رقم الجوال غير صحيحة (مثال: 0512345678)',
                      },
                    })}
                    placeholder="05xxxxxxxx"
                    error={errors.ownerPhoneNumber?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم جوال وسيط المؤسسة <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('brokerPhoneNumber', {
                      required: 'رقم جوال وسيط المؤسسة مطلوب',
                      pattern: {
                        value: /^(05|\+9665)[0-9]{8}$/,
                        message: 'صيغة رقم الجوال غير صحيحة (مثال: 0512345678)',
                      },
                    })}
                    placeholder="05xxxxxxxx"
                    error={errors.brokerPhoneNumber?.message}
                  />
                </div>
              </div>

              {/* National ID and Absher Code Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.nationalId')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('nationalId', { 
                      required: 'الهوية الوطنية مطلوبة',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'الهوية الوطنية يجب أن تكون 10 أرقام'
                      }
                    })}
                    placeholder="أدخل الهوية الوطنية (10 أرقام)"
                    maxLength={10}
                    error={errors.nationalId?.message}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.absherCode')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('absherCode', { 
                      required: 'كود أبشر مطلوب',
                      minLength: { value: 2, message: 'كود أبشر يجب أن يكون حرفين على الأقل' }
                    })}
                    placeholder="أدخل كود أبشر"
                    error={errors.absherCode?.message}
                  />
                </div>
              </div>

              {/* Birth Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.birthDate')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  {...register('birthDate', { 
                    required: 'تاريخ الميلاد مطلوب',
                    validate: (value) => {
                      const birthYear = new Date(value).getFullYear();
                      const currentYear = new Date().getFullYear();
                      const age = currentYear - birthYear;
                      if (age < 18) return 'يجب أن يكون العمر 18 سنة على الأقل';
                      if (age > 100) return 'تاريخ الميلاد غير صحيح';
                      return true;
                    }
                  })}
                  max={new Date().toISOString().split('T')[0]}
                  error={errors.birthDate?.message}
                />
              </div>
            </div>

            {/* Commercial Record Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                معلومات السجل التجاري
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.commercialRecordNumber')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register('commercialRecordNumber', { 
                      required: 'رقم السجل التجاري مطلوب',
                      minLength: {
                        value: 1,
                        message: 'رقم السجل التجاري مطلوب'
                      }
                    })}
                    placeholder="أدخل رقم السجل التجاري"
                    error={errors.commercialRecordNumber?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.commercialRecordDate')}
                  </label>
                  <Input
                    type="date"
                    {...register('commercialRecordDate', {
                      validate: (value) => {
                        if (!value) return true;
                        if (!birthDate) return 'يجب إدخال تاريخ الميلاد أولاً';
                        if (new Date(value) < new Date(birthDate)) {
                          return 'تاريخ السجل التجاري يجب أن يكون بعد تاريخ الميلاد';
                        }
                        return true;
                      }
                    })}
                    min={getMinDate('commercial')}
                    max={new Date().toISOString().split('T')[0]}
                    error={errors.commercialRecordDate?.message}
                  />
                </div>
              </div>
            </div>

            {/* Subscription Dates Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                تواريخ الاشتراكات
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.qawiSubscriptionDate')}
                  </label>
                  <Input
                    type="date"
                    {...register('qawiSubscriptionDate', {
                      validate: (value) => {
                        if (!value) return true;
                        if (!birthDate) return 'يجب إدخال تاريخ الميلاد أولاً';
                        if (new Date(value) < new Date(birthDate)) {
                          return 'تاريخ اشتراك قوى يجب أن يكون بعد تاريخ الميلاد';
                        }
                        return true;
                      }
                    })}
                    min={getMinDate('qawi')}
                    max={new Date().toISOString().split('T')[0]}
                    error={errors.qawiSubscriptionDate?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('organizations.absherSubscriptionDate')}
                  </label>
                  <Input
                    type="date"
                    {...register('absherSubscriptionDate', {
                      validate: (value) => {
                        if (!value) return true;
                        if (!birthDate) return 'يجب إدخال تاريخ الميلاد أولاً';
                        if (new Date(value) < new Date(birthDate)) {
                          return 'تاريخ اشتراك أبشر يجب أن يكون بعد تاريخ الميلاد';
                        }
                        return true;
                      }
                    })}
                    min={getMinDate('absher')}
                    max={new Date().toISOString().split('T')[0]}
                    error={errors.absherSubscriptionDate?.message}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">
                المعلومات المالية
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('organizations.sponsorAmount')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  {...register('sponsorAmount', { 
                    required: 'مبلغ الكفيل مطلوب',
                    min: { value: 0, message: 'المبلغ يجب أن يكون أكبر من أو يساوي 0' }
                  })}
                  placeholder="أدخل مبلغ الكفيل"
                  error={errors.sponsorAmount?.message}
                />
              </div>
            </div>

            {/* Required Fields Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ملاحظة:</span> الحقول المميزة بـ{' '}
                <span className="text-red-500">*</span> مطلوبة
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'جاري التحديث...' : 'تحديث المنظمة'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/organizations/${id}`)}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};
