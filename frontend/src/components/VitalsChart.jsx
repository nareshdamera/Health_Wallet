import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const VitalsChart = ({ data }) => {
  const filterData = (name) => data.filter(v => v.vital_name === name);

  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      height: '100%',
      minHeight: '400px' // Stable container height
    }}>
      <h3 style={{ marginBottom: '15px' }}>📈 Vitals Trend</h3>
      
      {/* Explicit height wrapper to prevent -1 warnings */}
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="recorded_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line data={filterData('Systolic')} type="monotone" dataKey="vital_value" name="Systolic" stroke="#ff4d4f" strokeWidth={3} connectNulls />
            <Line data={filterData('Diastolic')} type="monotone" dataKey="vital_value" name="Diastolic" stroke="#1890ff" strokeWidth={3} connectNulls />
            <Line data={filterData('Sugar')} type="monotone" dataKey="vital_value" name="Sugar" stroke="#52c41a" strokeWidth={3} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VitalsChart;