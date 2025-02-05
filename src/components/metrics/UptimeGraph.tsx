import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UptimeGraphProps {
  serviceId: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
  data: {
    timestamp: string;
    uptime: number;
    responseTime: number;
  }[];
}

export function UptimeGraph({ serviceId, timeRange, data }: UptimeGraphProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Uptime %',
        data: data.map(d => d.uptime),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Response Time (ms)',
        data: data.map(d => d.responseTime),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false,
        yAxisID: 'responseTime',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        min: 0,
        max: 100,
        title: {
          display: true,
          text: 'Uptime %',
        },
      },
      responseTime: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Response Time (ms)',
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 bg-card rounded-lg">
      <Line data={chartData} options={options} />
    </div>
  );
}
