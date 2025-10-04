import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../../api/users';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Toast } from '../../components/ui/Toast';
import { t } from '../../utils/translations';
import { formatDate } from '../../utils/formatDate';

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  
  // Confirm dialog state for delete
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    userId: null, 
    userEmail: '' 
  });
  
  // Confirm dialog state for reset password
  const [resetPasswordDialog, setResetPasswordDialog] = useState({ 
    isOpen: false, 
    userId: null, 
    userEmail: '' 
  });

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersAPI.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['users']);
      setShowAddModal(false);
      setEmail('');
      setToast({ 
        visible: true, 
        message: 'تم إضافة المستخدم بنجاح. كلمة المرور الافتراضية: 12345678', 
        type: 'success' 
      });
    },
    onError: (error) => {
      setToast({ 
        visible: true, 
        message: `فشل في إضافة المستخدم: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setConfirmDialog({ isOpen: false, userId: null, userEmail: '' });
      setToast({ visible: true, message: 'تم حذف المستخدم بنجاح', type: 'success' });
    },
    onError: (error) => {
      setConfirmDialog({ isOpen: false, userId: null, userEmail: '' });
      setToast({ 
        visible: true, 
        message: `فشل الحذف: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: usersAPI.resetPassword,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setResetPasswordDialog({ isOpen: false, userId: null, userEmail: '' });
      setToast({ 
        visible: true, 
        message: 'تم إعادة تعيين كلمة المرور إلى: 12345678', 
        type: 'success' 
      });
    },
    onError: (error) => {
      setResetPasswordDialog({ isOpen: false, userId: null, userEmail: '' });
      setToast({ 
        visible: true, 
        message: `فشل في إعادة تعيين كلمة المرور: ${error.response?.data?.message || error.message}`, 
        type: 'error' 
      });
    },
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setToast({ visible: true, message: 'الرجاء إدخال البريد الإلكتروني', type: 'error' });
      return;
    }
    createMutation.mutate({ email: email.trim() });
  };

  const handleDelete = (userId, userEmail) => {
    setConfirmDialog({ isOpen: true, userId, userEmail });
  };
  
  const confirmDelete = () => {
    if (confirmDialog.userId) {
      deleteMutation.mutate(confirmDialog.userId);
    }
  };

  const handleResetPassword = (userId, userEmail) => {
    setResetPasswordDialog({ isOpen: true, userId, userEmail });
  };

  const confirmResetPassword = () => {
    if (resetPasswordDialog.userId) {
      resetPasswordMutation.mutate(resetPasswordDialog.userId);
    }
  };

  const users = data?.data?.users || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">المستخدمون</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, userId: null, userEmail: '' })}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف المستخدم "${confirmDialog.userEmail}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">المستخدمون</h1>
          <p className="text-gray-600 mt-1">إدارة حسابات المستخدمين</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          + إضافة مستخدم جديد
        </Button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">إضافة مستخدم جديد</h2>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="user@example.com"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    ملاحظة: كلمة المرور الافتراضية: <strong>12345678</strong>
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddModal(false);
                      setEmail('');
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Reset Password Confirmation Dialog */}
      <ConfirmDialog
        isOpen={resetPasswordDialog.isOpen}
        onClose={() => setResetPasswordDialog({ isOpen: false, userId: null, userEmail: '' })}
        onConfirm={confirmResetPassword}
        title="تأكيد إعادة تعيين كلمة المرور"
        message={`هل أنت متأكد من إعادة تعيين كلمة المرور للمستخدم "${resetPasswordDialog.userEmail}"؟ سيتم تعيينها إلى: 12345678`}
        confirmText="إعادة تعيين"
        cancelText="إلغاء"
        confirmVariant="secondary"
        isLoading={resetPasswordMutation.isPending}
      />

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الدور
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    لا توجد مستخدمين
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleResetPassword(user._id, user.email)}
                        >
                          🔑 إعادة تعيين كلمة المرور
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(user._id, user.email)}
                          disabled={deleteMutation.isPending}
                        >
                          {t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Card */}
      <Card>
        <div className="p-4 bg-blue-50 border-r-4 border-blue-400">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> جميع المستخدمين الجدد يتم إنشاؤهم بكلمة المرور الافتراضية: <strong>12345678</strong>. 
            يرجى إخبار المستخدمين بتغيير كلمة المرور عند تسجيل الدخول الأول.
          </p>
        </div>
      </Card>
    </div>
  );
};
