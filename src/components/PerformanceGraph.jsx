import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceGraph = ({ performanceData }) => {
  // Filter out any data points with 0 WPM
  const filteredData = performanceData.filter(data => data.wpm > 0);

  // Calculate min and max WPM
  const minWPM = Math.min(...filteredData.map(data => data.wpm));
  const maxWPM = Math.max(...filteredData.map(data => data.wpm));

  function average(...nums) {
    let average = 0;
    for (const num of nums) {
      average += num / nums.length;
    }
    return Math.round(average);
  }

  const avgWPM = average(...filteredData.map(data => data.wpm));
  console.log(avgWPM)

  // Set Y-axis domain for WPM
  const wpmMin = Math.max(0, minWPM - 10); // Don't go below 0
  const wpmMax = maxWPM + 10;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={filteredData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="timeElapsed"
          label={{ value: 'Time (s) ||', position: 'insideBottomRight', offset: '-15'}}
        />
        <YAxis 
          yAxisId="left" 
          label={{ value: 'WPM', angle: -90, position: 'insideLeft'}}
          domain={[wpmMin, wpmMax]}
          allowDataOverflow={true}
          ticks={[wpmMin, minWPM, avgWPM, maxWPM, wpmMax]}
        />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="wpm" stroke="#8884d8" activeDot={{ r: 8 }}/>
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PerformanceGraph;