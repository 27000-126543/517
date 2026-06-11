import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface ApprovalRankingProps {
  data: Array<{ name: string; count: number; avgHours: number }>;
}

export function ApprovalRanking({ data }: ApprovalRankingProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 8);

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(51, 65, 85, 0.5)',
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const item = params[0];
          const dataItem = sortedData[item.dataIndex];
          return `
            <div class="font-medium">${item.name}</div>
            <div>审批数量: <span class="text-blue-400 font-mono">${dataItem.count}</span> 份</div>
            <div>平均耗时: <span class="text-amber-400 font-mono">${dataItem.avgHours}</span> 小时</div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#475569',
          },
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(71, 85, 105, 0.3)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.name).reverse(),
        axisLine: {
          lineStyle: {
            color: '#475569',
          },
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '审批数量',
          type: 'bar',
          data: sortedData.map(d => d.count).reverse(),
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
              { offset: 1, color: 'rgba(59, 130, 246, 1)' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(59, 130, 246, 0.6)' },
                { offset: 1, color: 'rgba(96, 165, 250, 1)' },
              ]),
            },
          },
          barWidth: 16,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">审批效率排行</h3>
      <div ref={chartRef} className="h-72" />
    </div>
  );
}
