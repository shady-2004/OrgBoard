# Users Management Feature (إدارة المستخدمين)

## Overview
صفحة إدارة المستخدمين مخصصة **للمديرين فقط (Admin Only)**. تسمح بإضافة وحذف حسابات المستخدمين.

## Backend API Routes

### Base URL: `/users`

#### 1. Get All Users
- **Endpoint:** `GET /users`
- **Access:** Admin only
- **Description:** جلب جميع المستخدمين (فقط role = 'user')
- **Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "users": [
      {
        "_id": "...",
        "email": "user@example.com",
        "role": "user",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2. Add New User
- **Endpoint:** `POST /users`
- **Access:** Admin only
- **Body:**
```json
{
  "email": "newuser@example.com"
}
```
- **Description:** 
  - إنشاء مستخدم جديد بكلمة المرور الافتراضية: `12345678`
  - الـ role تلقائياً: `user`
- **Response:**
```json
{
  "status": "success",
  "message": "User added successfully. Please ask user to change password on first login.",
  "data": {
    "id": "...",
    "email": "newuser@example.com",
    "role": "user"
  }
}
```

#### 3. Delete User
- **Endpoint:** `DELETE /users/:id`
- **Access:** Admin only
- **Description:** 
  - حذف مستخدم
  - لا يمكن حذف نفسك (المدير المسجل دخول حالياً)
- **Response:**
```json
{
  "status": "success",
  "data": null
}
```

## Frontend Implementation

### Files Created/Modified

#### 1. `/frontend/src/pages/users/UsersPage.jsx`
**Features:**
- ✅ عرض جدول بجميع المستخدمين
- ✅ زر إضافة مستخدم جديد
- ✅ Modal لإضافة مستخدم (البريد الإلكتروني فقط)
- ✅ زر حذف لكل مستخدم
- ✅ Confirm dialog قبل الحذف
- ✅ Toast notifications للنجاح/الفشل
- ✅ عرض معلومات المستخدم: البريد، الدور، تاريخ الإنشاء
- ✅ ملاحظة حول كلمة المرور الافتراضية

#### 2. `/frontend/src/api/users.js`
**API Client:**
```javascript
export const usersAPI = {
  getAll: async () => {...},    // GET /users
  create: async (userData) => {...},  // POST /users
  delete: async (id) => {...},   // DELETE /users/:id
}
```

#### 3. `/frontend/src/components/layout/AdminRoute.jsx`
**Admin-Only Route Protection:**
- يتحقق من `user.role === 'admin'`
- إذا لم يكن admin، يتم إعادة التوجيه إلى `/dashboard`
- عرض loading أثناء التحقق من المستخدم

#### 4. `/frontend/src/components/layout/Sidebar.jsx`
**Updated:**
- ✅ إخفاء link "المستخدمون" للمستخدمين العاديين
- ✅ عرضه فقط للمديرين (admin)
- ✅ استخدام `adminOnly: true` flag في menu items

#### 5. `/frontend/src/routes/AppRouter.jsx`
**Updated:**
- ✅ إضافة route `/users` محمي بـ `<AdminRoute>`
```jsx
<Route path="/users" element={
  <AdminRoute>
    <UsersPage />
  </AdminRoute>
} />
```

#### 6. `/frontend/src/hooks/useAuth.js`
**Fixed:**
- ✅ تحديث `checkAuth` لاستخراج `user` من `response.data.user`
- ✅ الآن `user` object يحتوي على: `_id`, `email`, `role`, `createdAt`, `updatedAt`

## Access Control

### Admin Users
- ✅ يمكنهم رؤية link "المستخدمون" في الـ Sidebar
- ✅ يمكنهم الوصول إلى `/users` page
- ✅ يمكنهم إضافة مستخدمين جدد
- ✅ يمكنهم حذف مستخدمين
- ❌ لا يمكنهم حذف أنفسهم

### Regular Users
- ❌ لا يرون link "المستخدمون" في الـ Sidebar
- ❌ إذا حاولوا الوصول إلى `/users` → إعادة توجيه إلى `/dashboard`

## Default Password
- 🔑 كل مستخدم جديد يحصل على كلمة المرور: **12345678**
- 📝 يجب إخبار المستخدم بتغيير كلمة المرور عند أول تسجيل دخول
- ⚠️ الصفحة تعرض تنبيه بهذه المعلومة

## UI Components Used
- ✅ `Card` - للتصميم
- ✅ `Button` - الأزرار (variant: primary, secondary, danger)
- ✅ `ConfirmDialog` - تأكيد الحذف
- ✅ `Toast` - الإشعارات
- ✅ Table - عرض البيانات
- ✅ Modal - إضافة مستخدم

## React Query
- ✅ `useQuery` - جلب المستخدمين
- ✅ `useMutation` - إضافة/حذف مستخدمين
- ✅ `invalidateQueries` - تحديث القائمة بعد التغييرات

## Validation
### Backend (Zod):
```typescript
addUserSchema = z.object({
  email: z.string().email("Invalid email address")
});
```

### Frontend:
- التحقق من وجود البريد الإلكتروني
- HTML5 `type="email"` validation
- `required` attribute

## Security
- ✅ All routes protected with `restrict('admin')` middleware
- ✅ Frontend checks user role before displaying UI
- ✅ AdminRoute component prevents unauthorized access
- ✅ Can't delete own account (backend validation)
- ✅ Passwords hashed with bcrypt (12 rounds)

## Testing Checklist
- [ ] Admin can see "المستخدمون" in sidebar
- [ ] Regular user cannot see "المستخدمون" in sidebar
- [ ] Admin can access /users page
- [ ] Regular user redirected from /users to /dashboard
- [ ] Admin can add new user with email
- [ ] New user receives default password "12345678"
- [ ] Admin can delete users
- [ ] Admin cannot delete themselves
- [ ] Toast shows success/error messages
- [ ] Confirm dialog appears before deletion
- [ ] Table updates after add/delete operations

## Future Enhancements
- [ ] Reset password functionality
- [ ] Edit user email
- [ ] User activity logs
- [ ] Bulk operations (delete multiple users)
- [ ] User search/filter
- [ ] Pagination (if many users)
- [ ] Export users list
