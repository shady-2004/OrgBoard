import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { AdminRoute } from '../components/layout/AdminRoute';
import { LoginPage } from '../pages/auth/LoginPage';
// import { RegisterPage } from '../pages/auth/RegisterPage'; // Signup disabled
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OrganizationsPage } from '../pages/organizations/OrganizationsPage';
import { OrganizationDetailPage } from '../pages/organizations/OrganizationDetailPage';
import { OrganizationEmployeesPage } from '../pages/organizations/OrganizationEmployeesPage';
import { OrganizationDailyOperationsPage } from '../pages/organizations/OrganizationDailyOperationsPage';
import { AddOrganizationPage } from '../pages/organizations/AddOrganizationPage';
import { EditOrganizationPage } from '../pages/organizations/EditOrganizationPage';
import { AllEmployeesPage } from '../pages/employees/AllEmployeesPage';
import { AddEmployeePage } from '../pages/employees/AddEmployeePage';
import { EditEmployeePage } from '../pages/employees/EditEmployeePage';
import { DailyOperationsListPage } from '../pages/daily-operations/DailyOperationsListPage';
import { AddDailyOperationPage } from '../pages/daily-operations/AddDailyOperationPage';
import { EditDailyOperationPage } from '../pages/daily-operations/EditDailyOperationPage';
import { OrganizationDailyOperationsListPage } from '../pages/organization-daily-operations/OrganizationDailyOperationsListPage';
import { AddOrganizationDailyOperationPage } from '../pages/organization-daily-operations/AddOrganizationDailyOperationPage';
import { EditOrganizationDailyOperationPage } from '../pages/organization-daily-operations/EditOrganizationDailyOperationPage';
import { OfficeOperationsPage } from '../pages/office-operations/OfficeOperationsPage';
import { AddOfficeOperationPage } from '../pages/office-operations/AddOfficeOperationPage';
import { EditOfficeOperationPage } from '../pages/office-operations/EditOfficeOperationPage';
import { SaudizationPage } from '../pages/saudization/SaudizationPage';
import { AddSaudizationPage } from '../pages/saudization/AddSaudizationPage';
import { EditSaudizationPage } from '../pages/saudization/EditSaudizationPage';
import { UsersPage } from '../pages/users/UsersPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        {/* Register route disabled - admins create users via Users page */}
        {/* <Route path="/register" element={<RegisterPage />} /> */}

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Users - Admin Only */}
          <Route path="/users" element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          } />
          
          {/* Organizations */}
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/add" element={<AddOrganizationPage />} />
          <Route path="/organizations/edit/:id" element={<EditOrganizationPage />} />
          <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
          <Route path="/organizations/:id/employees" element={<OrganizationEmployeesPage />} />
          <Route path="/organizations/:id/daily-operations" element={<OrganizationDailyOperationsPage />} />
          <Route path="/organizations/:id/organization-daily-operations" element={<OrganizationDailyOperationsListPage />} />
          
          {/* Employees */}
          <Route path="/employees" element={<AllEmployeesPage />} />
          <Route path="/employees/add" element={<AddEmployeePage />} />
          <Route path="/employees/edit/:id" element={<EditEmployeePage />} />
          
          {/* Daily Operations (Employee-related) */}
          <Route path="/daily-operations" element={<DailyOperationsListPage />} />
          <Route path="/daily-operations/add" element={<AddDailyOperationPage />} />
          <Route path="/daily-operations/edit/:id" element={<EditDailyOperationPage />} />
          
          {/* Organization Daily Operations (Financial Transfers) */}
          <Route path="/organization-daily-operations/add" element={<AddOrganizationDailyOperationPage />} />
          <Route path="/organization-daily-operations/edit/:id" element={<EditOrganizationDailyOperationPage />} />
          
          {/* Office Operations */}
          <Route path="/office-operations" element={<OfficeOperationsPage />} />
          <Route path="/office-operations/add" element={<AddOfficeOperationPage />} />
          <Route path="/office-operations/edit/:id" element={<EditOfficeOperationPage />} />
          
          {/* Saudization */}
          <Route path="/saudization" element={<SaudizationPage />} />
          <Route path="/saudization/add" element={<AddSaudizationPage />} />
          <Route path="/saudization/edit/:id" element={<EditSaudizationPage />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
