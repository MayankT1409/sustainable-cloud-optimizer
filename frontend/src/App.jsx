import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { EC2Optimization } from "./pages/EC2Optimization";

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ec2" element={<EC2Optimization />} />
          <Route path="*" element={<div className="p-4 text-slate-400">Page not found</div>} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;
