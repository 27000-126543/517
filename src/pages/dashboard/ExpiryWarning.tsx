import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { formatCurrency } from '../../utils/format';
import { useNavigate } from 'react-router-dom';

interface ExpiryWarningProps {
  data: Array<{
    contractId: string;
    title: string;
    daysLeft: number;
    amount: number;
  }>;
}

export function ExpiryWarning({ data }: ExpiryWarningProps) {
  const navigate = useNavigate();

  const getDaysColor = (days: number) => {
    if (days <= 7) return 'text-red-400';
    if (days <= 15) return 'text-amber-400';
    return 'text-blue-400';
  };

  const getDaysBg = (days: number) => {
    if (days <= 7) return 'bg-red-500/10 border-red-500/30';
    if (days <= 15) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-blue-500/10 border-blue-500/30';
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">到期预警</h3>
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
          {data.length} 条预警
        </span>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无到期预警
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.contractId}
              className={clsx(
                'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer',
                'hover:bg-slate-800/50 hover:border-slate-600/50',
                getDaysBg(item.daysLeft)
              )}
              onClick={() => navigate(`/contracts/${item.contractId}`)}
            >
              <div className={clsx(
                'p-2 rounded-lg',
                item.daysLeft <= 7 ? 'bg-red-500/20' : item.daysLeft <= 15 ? 'bg-amber-500/20' : 'bg-blue-500/20'
              )}>
                {item.daysLeft <= 7 ? (
                  <AlertTriangle className={clsx('w-5 h-5 animate-pulse', getDaysColor(item.daysLeft))} />
                ) : (
                  <Clock className={clsx('w-5 h-5', getDaysColor(item.daysLeft))} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {formatCurrency(item.amount)}
                </p>
              </div>

              <div className="text-right">
                <div className={clsx('text-xl font-bold font-mono', getDaysColor(item.daysLeft))}>
                  {item.daysLeft}
                </div>
                <div className="text-xs text-gray-400">天后到期</div>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-500" />
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.4);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.6);
        }
      `}</style>
    </div>
  );
}
