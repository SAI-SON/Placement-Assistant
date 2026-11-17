'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ScoreChartProps {
  score: number;
}

const ScoreChart = ({ score }: ScoreChartProps) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: Math.max(0, 100 - score) },
  ];

  // Neon Electric Violet and Cyan tints based on score
  const scoreColor = score >= 80 ? '#14B8A6' : score >= 60 ? '#8B5CF6' : '#F59E0B';
  const COLORS = [scoreColor, 'rgba(255, 255, 255, 0.08)'];

  return (
    <div className="w-48 h-48 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={64}
            outerRadius={80}
            startAngle={90}
            endAngle={450}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            cornerRadius={4}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
        <span className="text-4xl font-mono font-extrabold text-foreground tracking-tight" style={{ color: scoreColor }}>
          {score}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mt-0.5">
          ATS Score
        </span>
      </div>
    </div>
  );
};

export default ScoreChart;
