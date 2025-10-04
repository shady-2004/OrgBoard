# Password Management Feature (إدارة كلمات المرور)

## Overview
تم إضافة وظيفتين لإدارة كلمات المرور:
1. **Settings Page**: للمستخدمين لتغيير كلمة المرور الخاصة بهم
2. **Admin Reset Password**: للمديرين لإعادة تعيين كلمة مرور أي مستخدم بدون معرفة كلمة المرور الحالية

---

## 1. Change Password (User Self-Service)

### Backend API

#### Endpoint: `PATCH /auth/update-password`
- **Access:** Protected (any logged-in user)
- **Description:** المستخدم يغير كلمة مروره الخاصة
- **Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```
- **Validation:**
  - `currentPassword`: required, min 8 characters
  - `newPassword`: required, min 8 characters
  - Must verify current password is correct
- **Response:**
```json
{
  "status": "success",
  "token": "new-jwt-token",
  "data": {
    "user": {
      "id": "...",
      "role": "user"
    }
  }
}
```
- **Behavior:**
  - Hashes new password with bcrypt (12 rounds)
  - Issues new JWT token
  - User must re-login with new password

### Frontend Implementation

#### `/frontend/src/pages/settings/SettingsPage.jsx`
**Features:**
- ✅ Display user account info (email, role)
- ✅ Change password form with 3 fields:
  - Current Password
  - New Password (min 8 chars)
  - Confirm New Password
- ✅ Client-side validation:
  - All fields required
  - New password ≥ 8 characters
  - New password ≠ current password
  - New password = confirm password
- ✅ Auto-logout after successful password change
- ✅ Toast notifications
- ✅ Password requirements info card

**User Flow:**
1. User navigates to Settings page
2. Sees account info card
3. Fills change password form
4. Submits → API call
5. Success → Toast message → Auto logout after 2 seconds
6. Must login with new password

---

## 2. Reset User Password (Admin Only)

### Backend API

#### Endpoint: `PATCH /users/:id/reset-password`
- **Access:** Admin only
- **Description:** المدير يعيد تعيين كلمة مرور أي مستخدم إلى كلمة المرور الافتراضية **12345678**
- **Request Body:** لا يوجد
- **Validation:**
  - User ID must be valid MongoDB ObjectId
  - User must exist
- **Response:**
```json
{
  "status": "success",
  "message": "Password reset to default: 12345678"
}
```
- **Behavior:**
  - Directly sets password to default "12345678"
  - Password is hashed by pre-save hook
  - No manual password input required
  - User must login with "12345678" then change it

### Backend Files Modified

#### `/server/src/controllers/user.controller.ts`
**New Function:**
```typescript
const resetUserPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid user ID format", 400));
    }

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    // Reset to default password "12345678"
    const defaultPassword = "12345678";
    user.password = defaultPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password reset to default: 12345678",
    });
  }
);
```

#### `/server/src/routes/usersRouter.ts`
**New Route:**
```typescript
userRouter.patch("/:id/reset-password", restrict('admin'), userController.resetUserPassword);
```

### Frontend Implementation

#### `/frontend/src/pages/users/UsersPage.jsx`
**New Features:**
- ✅ "Reset Password" button for each user in table
- ✅ **ConfirmDialog** for password reset confirmation
  - Shows user email
  - Shows that password will be reset to "12345678"
  - No manual password input required
  - Confirm/Cancel buttons
- ✅ React Query mutation for reset
- ✅ Toast notifications with default password info

**Admin Flow:**
1. Admin views Users page
2. Clicks "🔑 إعادة تعيين كلمة المرور" button for a user
3. **Confirmation dialog** appears asking to confirm
4. Dialog shows: "will be reset to: 12345678"
5. Admin clicks "Confirm"
6. API call → Password reset to "12345678"
7. Success toast → "Password reset to: 12345678"
8. User can login with "12345678"

#### `/frontend/src/api/users.js`
**New Function:**
```javascript
resetPassword: async (id) => {
  const { data } = await api.patch(`/users/${id}/reset-password`);
  return data;
}
```

#### `/frontend/src/api/settings.js`
**New Function:**
```javascript
changePassword: async (passwordData) => {
  const { data } = await api.patch('/auth/update-password', passwordData);
  return data;
}
```

---

## Use Cases

### Use Case 1: User Changes Own Password
**Scenario:** مستخدم يريد تغيير كلمة مروره
1. Navigate to `/settings`
2. Fill form:
   - Current: `oldpass123`
   - New: `newpass456`
   - Confirm: `newpass456`
3. Submit
4. Success → Logout → Login with `newpass456`

### Use Case 2: User Forgets Password
**Scenario:** مستخدم نسي كلمة مروره
1. User contacts admin
2. Admin goes to `/users`
3. Admin clicks "Reset Password" for that user
4. **Confirmation dialog** appears
5. Admin confirms → Password reset to `12345678`
6. Admin tells user: "Your password has been reset to 12345678"
7. User logs in with `12345678`
8. User immediately goes to Settings to change to personal password

### Use Case 3: First Login
**Scenario:** مستخدم جديد تم إنشاؤه
1. Admin creates user → default password: `12345678`
2. Admin tells user their email and password
3. User logs in with `12345678`
4. User immediately goes to Settings
5. User changes password to personal one

---

## Security Considerations

### ✅ Implemented Security
1. **Password Hashing:** bcrypt with 12 rounds
2. **Minimum Length:** 8 characters enforced on backend and frontend
3. **Current Password Verification:** User must know current password to change it
4. **Admin Authorization:** Only admins can reset other users' passwords
5. **No Password in Response:** Password never returned in API responses
6. **JWT Refresh:** New token issued after password change
7. **Auto Logout:** User logged out after changing password

### ⚠️ Recommendations
1. **Password Strength:** Consider adding complexity requirements (uppercase, numbers, symbols)
2. **Password History:** Prevent reusing recent passwords
3. **Rate Limiting:** Limit password change attempts
4. **Email Notification:** Notify user when password is changed
5. **Audit Log:** Log all password changes (who, when, by whom)
6. **Two-Factor Authentication:** Add 2FA for extra security

---

## UI/UX Features

### Settings Page
- ✅ Clean card-based layout
- ✅ Account info display
- ✅ Form validation with error messages
- ✅ Password requirements info card
- ✅ Loading states
- ✅ Success/error toast notifications
- ✅ Auto-logout countdown

### Users Page (Admin)
- ✅ Reset password button with key icon 🔑
- ✅ **ConfirmDialog** instead of modal
- ✅ Shows default password "12345678" in confirmation
- ✅ No manual password input needed
- ✅ One-click reset process
- ✅ Loading states on confirmation
- ✅ Toast notifications with password info
- ✅ Easy cancel option

---

## Testing Checklist

### User Self-Service (Settings Page)
- [ ] User can view account info
- [ ] User can access settings page
- [ ] Current password validation works
- [ ] New password min length validation works
- [ ] Confirm password matching validation works
- [ ] Cannot use same password as current
- [ ] Success toast appears
- [ ] User is logged out after 2 seconds
- [ ] User can login with new password
- [ ] Error toast appears on wrong current password

### Admin Reset Password (Users Page)
- [ ] Admin sees reset button for each user
- [ ] Click button opens **confirmation dialog** (not modal)
- [ ] Dialog shows user email
- [ ] Dialog shows password will be "12345678"
- [ ] Admin confirms → Password reset
- [ ] Success toast shows "Password reset to: 12345678"
- [ ] User list refreshes
- [ ] User can login with "12345678"
- [ ] Error toast appears on failure
- [ ] Regular users cannot access this feature
- [ ] No manual password input required

---

## Files Created/Modified

### Backend
- ✅ **Modified:** `/server/src/controllers/user.controller.ts`
  - Added `resetUserPassword` function
- ✅ **Modified:** `/server/src/routes/usersRouter.ts`
  - Added `PATCH /:id/reset-password` route

### Frontend
- ✅ **Created:** `/frontend/src/pages/settings/SettingsPage.jsx`
  - Full settings page with change password
- ✅ **Modified:** `/frontend/src/pages/users/UsersPage.jsx`
  - Added reset password button and modal
  - Added mutation and handlers
- ✅ **Modified:** `/frontend/src/api/settings.js`
  - Added `changePassword` function
- ✅ **Modified:** `/frontend/src/api/users.js`
  - Added `resetPassword` function
- ✅ **Modified:** `/frontend/src/routes/AppRouter.jsx`
  - Imported and used real `SettingsPage` component

---

## API Summary

| Endpoint | Method | Access | Purpose |
|----------|--------|--------|---------|
| `/auth/update-password` | PATCH | Protected | User changes own password |
| `/users/:id/reset-password` | PATCH | Admin | Admin resets user password to "12345678" |

---

## Future Enhancements
- [ ] Email notification on password change
- [ ] Password strength meter
- [ ] Password history (prevent reuse)
- [ ] Forgot password flow (email reset link)
- [ ] Two-factor authentication
- [ ] Password expiration policy
- [ ] Audit log for all password changes
- [ ] Security questions
