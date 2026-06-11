import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { formatCurrency } from '../../utils/format';

interface DepartmentHeatmapProps {
  data: Array<{ department: string; amount: number; count: number }>;
}

export function DepartmentHeatmap({ data }: DepartmentHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const maxAmount = Math.max(...data.map(d => d.amount));

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
          const amount = params[0];
          const count = params[1];
          return `
            <div class="font-medium">${amount.name}</div>
            <div>签约金额: <span class="text-emerald-400 font-mono">${formatCurrency(amount.value)}</span></div>
            <div>合同数量: <span class="text-blue-400 font-mono">${count.value}</span> 份</div>
          `;
        },
      },
      legend: {
        data: ['签约金额', '合同数量'],
        top: 0,
        textStyle: {
          color: '#94a3b8',
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 12,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.department),
        axisLine: {
          lineStyle: {
            color: '#475569',
          },
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          rotate: 0,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '金额(万元)',
          nameTextStyle: {
            color: '#94a3b8',
            fontSize: 10,
          },
          axisLine: {
            lineStyle: {
              color: '#475569',
            },
          },
          axisLabel: {
            color: '#94a3b8',
            fontSize: 11,
            formatter: (value: number) => (value / 10000).toFixed(0),
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(71, 85, 105, 0.3)',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '数量(份)',
          nameTextStyle: {
            color: '#94a3b8',
            fontSize: 10,
          },
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
            show: false,
          },
        },
      ],
      series: [
        {
          name: '签约金额',
          type: 'bar',
          data: data.map(d => d.amount),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.9)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.3)' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(16, 185, 129, 1)' },
                { offset: 1, color: 'rgba(16, 185, 129, 0.5)' },
              ]),
            },
          },
          barWidth: 20,
        },
        {
          name: '合同数量',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.count),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 2,
            color: '#3b82f6',
          },
          itemStyle: {
            color: '#3b82f6',
            borderColor: 'rgba(15, 23, 42, 0.8)',
            borderWidth: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' },
            ]),
          },
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
      <h3 className="text-lg font-semibold text-white mb-4">部门签约热度</h3>
      <div ref={chartRef} className="h-72" />
    </div>
  );
}
