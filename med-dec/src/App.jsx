
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import Storefront from './pages/Storefront.jsx';
import Consultation from './pages/Consultation.jsx';
import Fulfillment from './pages/Fulfillment.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import DashboardPrescriptions from './pages/DashboardPrescriptions.jsx';
import DashboardRefills from './pages/DashboardRefills.jsx';
import DashboardConsultations from './pages/DashboardConsultations.jsx';
import DashboardRecords from './pages/DashboardRecords.jsx';
import DashboardSettings from './pages/DashboardSettings.jsx';
import OrderPlacement from './components/OrderPlacement.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import PharmacyDashboard from './pharmacy/PharmacyDashboard.jsx';
import LogisticsDashboard from './logistics/LogisticsDashboard.jsx';
import Signin from './Accounts/Signin.jsx';
import Signup from './Accounts/Signup.jsx';
import ForgotPassword from './Accounts/ForgotPassword.jsx';
import About from './pages/About.jsx';
import ResetPassword from './Accounts/ResetPassword.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleProtectedRoute from './RoleProtectedRoute.jsx';
import ToastNotification from './components/ToastNotification.jsx';
import ChatManager from './components/ChatManager.jsx';

function App() {
  return (
    <Router>
      <ToastNotification />
      <ChatManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="orders" element={<OrderPlacement />} />
          <Route path="prescriptions" element={<DashboardPrescriptions />} />
          <Route path="refills" element={<DashboardRefills />} />
          <Route path="consultations" element={<DashboardConsultations />} />
          <Route path="records" element={<DashboardRecords />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
        <Route path="/storefront" element={<Storefront />} />
        <Route path="/consultation" element={<Consultation />} />
        <Route path="/fulfillment" element={<Fulfillment />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <RoleProtectedRoute allowedRoles={["pharmacy"]}>
              <PharmacyDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/logistics"
          element={
            <RoleProtectedRoute allowedRoles={["logistics"]}>
              <LogisticsDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
