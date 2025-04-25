import { FC } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface ChartWidgetProps {
  config?: {
    chartType?: 'line' | 'bar' | 'pie';
    dataSource?: string;
  };
}

export const ChartWidget: FC<ChartWidgetProps> = ({ config }) => {
  // Sample data - in a real app, this would come from your backend
  const data = [
    { name: 'Jan', value: 4 },
    { name: 'Feb', value: 3 },
    { name: 'Mar', value: 2 },
    { name: 'Apr', value: 7 },
    { name: 'May', value: 5 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  switch (config?.chartType) {
    case 'bar':
      return (
        <BarChart width={300} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      );
    case 'pie':
      return (
        <PieChart width={300} height={200}>
          <Pie
            data={data}
            cx={150}
            cy={100}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );
    default:
      return (
        <LineChart width={300} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      );
  }
};