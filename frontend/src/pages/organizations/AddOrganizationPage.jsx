import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { organizationsAPI } from '../../api/organizations';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';

export const AddOrganizationPage = () => {
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
      ownerName: '',
      ownerPhoneNumber: '',
      brokerPhoneNumber: '',
      nationalId: '',
      absherCode: '',
      birthDate: '',
      qawiSubscriptionDate: '',
      absherSubscriptionDate: '',
      commercialRecordDate: '',
      commercialRecordNumber: '',
      sponsorAmount: '',
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => organizationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['organizations']);
      setToast({ visible: true, message: 'تم إضافة المنظمة بنجاح', type: 'success' });
      setTimeout(() => {
        navigate('/organizations', { replace: true });
      }, 1500);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ أثناء إضافة المنظمة';
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

    console.log('Submitting to backend:', formattedData);
    createMutation.mutate(formattedData);
  };

  // Validation helper
  const birthDate = watch('birthDate');
  const getMinDate = (type) => {
    if (!birthDate) return '';
    return birthDate;
  };

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
            <h1 className="text-3xl font-bold text-gray-800">إضافة منظمة جديدة</h1>
            <p className="text-gray-600 mt-1">أدخل معلومات المنظمة</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/organizations')}>
            إلغاء
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  المعلومات الأساسية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المالك <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('ownerName', {
                        required: 'اسم المالك مطلوب',
                        minLength: {
                          value: 2,
                          message: 'يجب أن يكون الاسم حرفين على الأقل',
                        },
                        maxLength: {
                          value: 100,
                          message: 'الاسم طويل جداً (الحد الأقصى 100 حرف)',
                        },
                        pattern: {
                          value: /^[\u0600-\u06FFa-zA-Z\s]+$/,
                          message: 'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية فقط',
                        },
                      })}
                      placeholder="مثال: محمد أحمد"
                      error={errors.ownerName?.message}
                    />
                  </div>

                  {/* Owner Phone Number */}
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

                  {/* Broker Phone Number */}
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

                  {/* National ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الهوية الوطنية <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('nationalId', {
                        required: 'الهوية الوطنية مطلوبة',
                        pattern: {
                          value: /^[12]\d{9}$/,
                          message: 'الهوية الوطنية يجب أن تكون 10 أرقام تبدأ بـ 1 أو 2',
                        },
                      })}
                      placeholder="1234567890"
                      maxLength={10}
                      error={errors.nationalId?.message}
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ الميلاد <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      {...register('birthDate', {
                        required: 'تاريخ الميلاد مطلوب',
                        validate: {
                          notFuture: (value) => {
                            const selectedDate = new Date(value);
                            const today = new Date();
                            return selectedDate <= today || 'تاريخ الميلاد لا يمكن أن يكون في المستقبل';
                          },
                          ageLimit: (value) => {
                            const birthDate = new Date(value);
                            const today = new Date();
                            let age = today.getFullYear() - birthDate.getFullYear();
                            const monthDiff = today.getMonth() - birthDate.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                              age--;
                            }
                            return age >= 18 || 'يجب أن يكون عمر المالك 18 سنة على الأقل';
                          },
                        },
                      })}
                      max={new Date().toISOString().split('T')[0]}
                      error={errors.birthDate?.message}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      اختر التاريخ من القائمة أو أدخل بصيغة: سنة-شهر-يوم
                    </p>
                  </div>

                  {/* Absher Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كود أبشر <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('absherCode', {
                        required: 'كود أبشر مطلوب',
                        pattern: {
                          value: /^[A-Za-z0-9]{6,20}$/,
                          message: 'كود أبشر يجب أن يكون من 6-20 حرف أو رقم',
                        },
                      })}
                      placeholder="M5O745"
                      maxLength={20}
                      style={{ textTransform: 'uppercase' }}
                      error={errors.absherCode?.message}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Subscription Dates */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-green-600">📅</span>
                  تواريخ الاشتراكات
                  <span className="text-sm text-gray-500 font-normal">(اختياري)</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Qawi Subscription Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organizations.qawiSubscriptionDate')}
                    </label>
                    <Input
                      type="date"
                      {...register('qawiSubscriptionDate', {
                        validate: {
                          afterBirth: (value) => {
                            if (!value || !birthDate) return true;
                            return new Date(value) >= new Date(birthDate) || 'التاريخ لا يمكن أن يكون قبل تاريخ الميلاد';
                          },
                          inFuture: (value) => {
                            if (!value) return true;
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(value);
                            selectedDate.setHours(0, 0, 0, 0);
                            return selectedDate >= today || 'تاريخ انتهاء اشتراك قوى يجب أن يكون في المستقبل';
                          },
                        },
                      })}
                      min={getMinDate('qawi')}
                      error={errors.qawiSubscriptionDate?.message}
                    />
                  </div>

                  {/* Absher Subscription Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organizations.absherSubscriptionDate')}
                    </label>
                    <Input
                      type="date"
                      {...register('absherSubscriptionDate', {
                        validate: {
                          afterBirth: (value) => {
                            if (!value || !birthDate) return true;
                            return new Date(value) >= new Date(birthDate) || 'التاريخ لا يمكن أن يكون قبل تاريخ الميلاد';
                          },
                          inFuture: (value) => {
                            if (!value) return true;
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const selectedDate = new Date(value);
                            selectedDate.setHours(0, 0, 0, 0);
                            return selectedDate >= today || 'تاريخ انتهاء اشتراك أبشر يجب أن يكون في المستقبل';
                          },
                        },
                      })}
                      min={getMinDate('absher')}
                      error={errors.absherSubscriptionDate?.message}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Commercial Record */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-purple-600">🏢</span>
                  السجل التجاري
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Commercial Record Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم السجل التجاري <span className="text-red-500">*</span>
                    </label>
                    <Input
                      {...register('commercialRecordNumber', {
                        required: 'رقم السجل التجاري مطلوب',
                        minLength: {
                          value: 1,
                          message: 'رقم السجل التجاري مطلوب',
                        },
                      })}
                      placeholder="CR-1s1133"
                      error={errors.commercialRecordNumber?.message}
                    />
                  </div>

                  {/* Commercial Record Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organizations.commercialRecordDate')}
                    </label>
                    <Input
                      type="date"
                      {...register('commercialRecordDate', {
                        validate: {
                          notFuture: (value) => {
                            if (!value) return true;
                            const selectedDate = new Date(value);
                            const today = new Date();
                            return selectedDate <= today || 'التاريخ لا يمكن أن يكون في المستقبل';
                          },
                          afterBirth: (value) => {
                            if (!value || !birthDate) return true;
                            return new Date(value) >= new Date(birthDate) || 'التاريخ لا يمكن أن يكون قبل تاريخ الميلاد';
                          },
                        },
                      })}
                      min={getMinDate('commercial')}
                      max={new Date().toISOString().split('T')[0]}
                      error={errors.commercialRecordDate?.message}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Information */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-orange-600">💰</span>
                  المعلومات المالية
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sponsor Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organizations.sponsorAmount')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      {...register('sponsorAmount', {
                        required: 'مبلغ الكفيل مطلوب',
                        min: {
                          value: 0,
                          message: 'المبلغ لا يمكن أن يكون سالباً',
                        },
                        max: {
                          value: 10000000,
                          message: 'المبلغ لا يمكن أن يتجاوز 10,000,000 ريال',
                        },
                        validate: {
                          isInteger: (value) => {
                            return Number.isInteger(Number(value)) || 'المبلغ يجب أن يكون رقماً صحيحاً';
                          },
                        },
                      })}
                      placeholder="1000000"
                      min="0"
                      max="10000000"
                      step="1"
                      error={errors.sponsorAmount?.message}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      الحد الأقصى: 10,000,000 ريال
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/organizations')}
                disabled={createMutation.isLoading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || isSubmitting}
              >
                {createMutation.isLoading ? 'جاري الحفظ...' : 'حفظ المنظمة'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
