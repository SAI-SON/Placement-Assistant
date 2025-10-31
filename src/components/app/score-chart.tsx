'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

const ScoreChart = ({ score }: ScoreChartProps) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--muted) / 0.3)'];

  return (
    <div className="w-48 h-48 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={80}
            startAngle={90}
            endAngle={450}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-5xl font-bold text-primary">{score}</span>
        <span className="text-sm text-muted-foreground tracking-widest uppercase">Score</span>
      </div>
    </div>
  );
};

export default ScoreChart;
