import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "@/pages/dashboard";
import ContractListPage from "@/pages/contracts/List";
import ContractDetailPage from "@/pages/contracts/Detail";
import ContractCreatePage from "@/pages/contracts/Create";

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
        
        <Route path="/approval/pending" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">待我审批 - 开发中</h2></div>} />
        <Route path="/approval/approved" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">我已审批 - 开发中</h2></div>} />
        
        <Route path="/performance/tasks" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">履约任务 - 开发中</h2></div>} />
        <Route path="/performance/changes" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">变更申请 - 开发中</h2></div>} />
        
        <Route path="/warnings" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">预警中心 - 开发中</h2></div>} />
        
        <Route path="/settings/users" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">用户管理 - 开发中</h2></div>} />
        <Route path="/settings/templates" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">模板管理 - 开发中</h2></div>} />
        <Route path="/settings/rules" element={<div className="text-center py-12"><h2 className="text-xl text-gray-600">审批规则 - 开发中</h2></div>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
