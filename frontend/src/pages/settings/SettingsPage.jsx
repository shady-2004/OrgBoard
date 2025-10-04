import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { settingsAPI } from '../../api/settings';
import { useAuth } from '../../hooks/useAuth';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [errors, setErrors] = useState({});

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: settingsAPI.changePassword,
    onSuccess: () => {
      setToast({ 
        visible: true, 
        message: 'تم تغيير كلمة المرور بنجاح', 
        type: 'success' 
      });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setErrors({});
    },
    onError: (error) => {
      setToast({ 
        visible: true, 
        message: `فشل تغيير كلمة المرور: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
        <p className="text-gray-600 mt-1">إدارة إعدادات حسابك</p>
      </div>

      {/* User Info Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">معلومات الحساب</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">البريد الإلكتروني:</span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-600">الدور:</span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'admin' ? 'مدير' : 'مستخدم'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">تغيير كلمة المرور</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الحالية *
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل كلمة المرور الحالية"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أدخل كلمة المرور الجديدة (8 أحرف على الأقل)"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تأكيد كلمة المرور الجديدة *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="أعد إدخال كلمة المرور الجديدة"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
              </Button>
            </div>
          </form>

          {/* Password Requirements Info */}
          <div className="mt-6 p-4 bg-blue-50 border-r-4 border-blue-400 rounded">
            <p className="text-sm text-blue-800">
              <strong>متطلبات كلمة المرور:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
              <li>يجب أن تكون 8 أحرف على الأقل</li>
              <li>يجب أن تكون مختلفة عن كلمة المرور الحالية</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
