import { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, Maximize, Minimize } from 'lucide-react';
import { useApprovalStore } from '../../store/useApprovalStore';
import { useUserStore } from '../../store/useUserStore';
import { formatUserRole } from '../../utils/format';

interface HeaderProps {
  onRefresh?: () => void;
  showRefresh?: boolean;
  showFullscreen?: boolean;
}

export function Header({ onRefresh, showRefresh = true, showFullscreen = false }: HeaderProps) {
  const { warnings, fetchWarnings } = useApprovalStore();
  const { currentUser } = useUserStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchWarnings();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchWarnings]);

  const unreadWarnings = warnings.filter(w => w.level !== 'info').length;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const warningLevelColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索合同编号、名称..."
            className="pl-10 pr-4 py-2 w-80 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        {showRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors group"
            title="刷新数据"
          >
            <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
          </button>
        )}
        {showFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors group"
            title="全屏显示"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
            ) : (
              <Maximize className="w-5 h-5 text-gray-500 group-hover:text-primary-600" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-4 hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              weekday: 'long',
            })}
          </p>
          <p className="text-xs text-gray-500 font-mono">
            {currentTime.toLocaleTimeString('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {unreadWarnings > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadWarnings}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">消息通知</h3>
                <span className="text-xs text-gray-500">共 {warnings.length} 条</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {warnings.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    暂无通知
                  </div>
                ) : (
                  warnings.slice(0, 10).map(warning => (
                    <div
                      key={warning.id}
                      className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${warningLevelColors[warning.level]}`}>
                          {warning.level === 'danger' ? '紧急' : warning.level === 'warning' ? '警告' : '通知'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{warning.title}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{warning.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <button className="w-full text-sm text-primary-600 hover:text-primary-700">
                  查看全部预警
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-gray-500">{formatUserRole(currentUser.role)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
