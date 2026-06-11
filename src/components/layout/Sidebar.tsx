import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  AlertTriangle,
  Settings,
  ChevronDown,
  Users,
  FileCode,
  Sliders,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useUserStore } from '../../store/useUserStore';
import { getRoutePermission } from '../../utils/permission';
import { formatUserRole } from '../../utils/format';

interface MenuItem {
  path: string;
  label: string;
  icon: any;
  children?: MenuItem[];
}

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useUserStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['contracts', 'approval', 'performance', 'settings']);

  const menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: '首页大屏',
      icon: LayoutDashboard,
    },
    {
      path: '/contracts',
      label: '合同管理',
      icon: FileText,
      children: [
        { path: '/contracts', label: '合同列表', icon: FileText },
        { path: '/contracts/create', label: '合同起草', icon: FileText },
      ],
    },
    {
      path: '/approval',
      label: '审批中心',
      icon: CheckSquare,
      children: [
        { path: '/approval/pending', label: '待我审批', icon: CheckSquare },
        { path: '/approval/approved', label: '我已审批', icon: CheckSquare },
      ],
    },
    {
      path: '/performance',
      label: '履约管理',
      icon: Clock,
      children: [
        { path: '/performance/tasks', label: '履约任务', icon: Clock },
        { path: '/performance/changes', label: '变更申请', icon: FileText },
      ],
    },
    {
      path: '/warnings',
      label: '预警中心',
      icon: AlertTriangle,
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: Settings,
      children: [
        { path: '/settings/users', label: '用户管理', icon: Users },
        { path: '/settings/templates', label: '模板管理', icon: FileCode },
        { path: '/settings/rules', label: '审批规则', icon: Sliders },
      ],
    },
  ];

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const isPathActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.path));
    }
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.path);
    const isActive = isPathActive(item);
    const hasPermission = getRoutePermission(item.path, currentUser.role);

    if (!hasPermission && !hasChildren) return null;

    const visibleChildren = item.children?.filter(child =>
      getRoutePermission(child.path, currentUser.role)
    );

    if (hasChildren && visibleChildren?.length === 0) return null;

    return (
      <div key={item.path}>
        <div
          className={clsx(
            'flex items-center px-4 py-3 cursor-pointer transition-colors',
            level > 0 && 'pl-12',
            isActive && !hasChildren
              ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
          onClick={() => hasChildren ? toggleMenu(item.path) : null}
        >
          {!hasChildren ? (
            <NavLink to={item.path} className="flex items-center w-full">
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
            </NavLink>
          ) : (
            <>
              <item.icon className="w-5 h-5 mr-3" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronDown
                className={clsx(
                  'w-4 h-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {visibleChildren?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">合同管理</h1>
            <p className="text-xs text-gray-500">全生命周期平台</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-primary-700 font-semibold">
              {currentUser.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{formatUserRole(currentUser.role)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  );
}
