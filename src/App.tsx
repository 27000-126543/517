import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/dashboard";
import ContractListPage from "@/pages/contracts/List";
import ContractDetailPage from "@/pages/contracts/Detail";
import ContractCreatePage from "@/pages/contracts/Create";
import PendingApprovalsPage from "@/pages/approval/Pending";
import ApprovedApprovalsPage from "@/pages/approval/Approved";
import PerformanceTasksPage from "@/pages/performance/Tasks";
import PerformanceChangesPage from "@/pages/performance/Changes";
import WarningsPage from "@/pages/warnings/index";
import TemplateSettingsPage from "@/pages/settings/Templates";
import RulesSettingsPage from "@/pages/settings/Rules";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="/contracts" element={<ContractListPage />} />
        <Route path="/contracts/create" element={<ContractCreatePage />} />
        <Route path="/contracts/:id" element={<ContractDetailPage />} />
        <Route path="/contracts/:id/edit" element={<ContractCreatePage />} />
        
        <Route path="/approval/pending" element={<PendingApprovalsPage />} />
        <Route path="/approval/approved" element={<ApprovedApprovalsPage />} />
        
        <Route path="/performance/tasks" element={<PerformanceTasksPage />} />
        <Route path="/performance/changes" element={<PerformanceChangesPage />} />
        
        <Route path="/warnings" element={<WarningsPage />} />
        
        <Route path="/settings/users" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">用户管理 - 开发中</h2></div>} />
        <Route path="/settings/templates" element={<TemplateSettingsPage />} />
        <Route path="/settings/rules" element={<RulesSettingsPage />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
