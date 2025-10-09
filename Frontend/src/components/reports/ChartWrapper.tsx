import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  data: any[];
  type: 'line' | 'bar';
}

export const ChartWrapper = ({ data, type }: ChartWrapperProps) => {
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="permis" stroke="#8884d8" strokeWidth={2} />
          <Line type="monotone" dataKey="valides" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="zone" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#8884d8" />
        <Bar dataKey="actifs" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};