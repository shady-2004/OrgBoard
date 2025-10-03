import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { OrganizationsPage } from '../pages/organizations/OrganizationsPage';
import { OrganizationDetailPage } from '../pages/organizations/OrganizationDetailPage';
import { AddOrganizationPage } from '../pages/organizations/AddOrganizationPage';

// Placeholder pages
const UsersPage = () => <div><h1>Users Page</h1><p>List of users will appear here</p></div>;
const AddUserPage = () => <div><h1>Add User</h1><p>Add user form will appear here</p></div>;

const EditOrganizationPage = () => <div><h1>Edit Organization</h1><p>Edit organization form will appear here</p></div>;

const DailyOperationsPage = () => <div><h1>Daily Operations Page</h1><p>List of daily operations will appear here</p></div>;
const AddDailyOperationPage = () => <div><h1>Add Daily Operation</h1><p>Add daily operation form will appear here</p></div>;

const OfficeOperationsPage = () => <div><h1>Office Operations Page</h1><p>List of office operations will appear here</p></div>;
const AddOfficeOperationPage = () => <div><h1>Add Office Operation</h1><p>Add office operation form will appear here</p></div>;

const SaudizationPage = () => <div><h1>Saudization Page</h1><p>Saudization data will appear here</p></div>;
const AddSaudizationPage = () => <div><h1>Add Saudization Entry</h1><p>Add saudization form will appear here</p></div>;

const SettingsPage = () => <div><h1>Settings Page</h1><p>Settings options will appear here</p></div>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Users */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/add" element={<AddUserPage />} />
          
          {/* Organizations */}
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/organizations/add" element={<AddOrganizationPage />} />
          <Route path="/organizations/edit/:id" element={<EditOrganizationPage />} />
          <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
          
          {/* Daily Operations */}
          <Route path="/daily-operations" element={<DailyOperationsPage />} />
          <Route path="/daily-operations/add" element={<AddDailyOperationPage />} />
          
          {/* Office Operations */}
          <Route path="/office-operations" element={<OfficeOperationsPage />} />
          <Route path="/office-operations/add" element={<AddOfficeOperationPage />} />
          
          {/* Saudization */}
          <Route path="/saudization" element={<SaudizationPage />} />
          <Route path="/saudization/add" element={<AddSaudizationPage />} />
          
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
