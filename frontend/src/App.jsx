import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { EC2Optimization } from "./pages/EC2Optimization";
import { CloudProvider } from "./context/CloudContext";
import { CloudSelection } from "./pages/CloudSelection";
import { AzureVM } from "./pages/AzureVM";
import { GCPCompute } from "./pages/GCPCompute";
import { Login } from "./pages/Login";
import { AWSCredentials } from "./pages/AWSCredentials";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected route: redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected: AWS credential setup */}
      <Route
        path="/aws-credentials"
        element={
          <ProtectedRoute>
            <AWSCredentials />
          </ProtectedRoute>
        }
      />

      {/* Protected: Cloud selection */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CloudSelection />
          </ProtectedRoute>
        }
      />

      {/* Protected: Dashboard and sub-pages */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ec2" element={<EC2Optimization />} />
                <Route path="/azure-vm" element={<AzureVM />} />
                <Route path="/gcp-compute" element={<GCPCompute />} />
                <Route path="*" element={<div className="p-4 text-slate-400">Page not found</div>} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CloudProvider>
        <Router>
          <AppRoutes />
        </Router>
      </CloudProvider>
    </AuthProvider>
  );
}

export default App;
