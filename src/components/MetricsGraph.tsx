import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

interface MetricsGraphProps {
  data: {
    timestamp: string;
    value: number;
  }[];
  title: string;
  type: 'latency' | 'uptime' | 'errors' | 'requests' | 'response_time' | 'availability';
}

export function MetricsGraph({ data, title, type }: MetricsGraphProps) {
  const [timeRange, setTimeRange] = useState('24h');

  const getColor = () => {
    switch (type) {
      case 'latency':
        return '#8884d8';
      case 'uptime':
        return '#82ca9d';
      case 'errors':
        return '#ff7c7c';
      case 'requests':
        return '#ffd700';
      case 'response_time':
        return '#00bcd4';
      case 'availability':
        return '#4caf50';
      default:
        return '#8884d8';
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'latency':
      case 'response_time':
        return 'ms';
      case 'uptime':
      case 'availability':
        return '%';
      case 'requests':
        return '/min';
      case 'errors':
        return '';
      default:
        return '';
    }
  };

  const formatValue = (value: number) => {
    switch (type) {
      case 'uptime':
      case 'availability':
        return value.toFixed(2) + '%';
      case 'latency':
      case 'response_time':
        return value.toFixed(1) + 'ms';
      case 'requests':
        return value.toFixed(0) + '/min';
      case 'errors':
        return value.toString();
      default:
        return value.toString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          {title}
        </CardTitle>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="timestamp"
                scale="time"
                type="number"
                domain={['auto', 'auto']}
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()}
                stroke="#888"
              />
              <YAxis
                unit={getUnit()}
                width={50}
                stroke="#888"
                tickFormatter={(value) => formatValue(value)}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [formatValue(value), title]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={getColor()}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}