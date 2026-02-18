import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { EC2Optimization } from "./pages/EC2Optimization";

import { CloudProvider } from "./context/CloudContext";
import { CloudSelection } from "./pages/CloudSelection";
import { AzureVM } from "./pages/AzureVM";
import { GCPCompute } from "./pages/GCPCompute";

function App() {
  return (
    <CloudProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CloudSelection />} />
          <Route
            path="/*"
            element={
              <DashboardLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ec2" element={<EC2Optimization />} />
                  <Route path="/azure-vm" element={<AzureVM />} />
                  <Route path="/gcp-compute" element={<GCPCompute />} />
                  <Route path="*" element={<div className="p-4 text-slate-400">Page not found</div>} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </CloudProvider>
  );
}

export default App;
