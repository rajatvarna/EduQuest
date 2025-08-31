import React from 'react';

interface ActivityData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);

  const dates: { [key: string]: number } = {};
  for (const item of data) {
    dates[item.date] = item.count;
  }

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-700/50';
    if (count <= 1) return 'bg-teal-200 dark:bg-teal-900';
    if (count <= 3) return 'bg-teal-400 dark:bg-teal-700';
    if (count <= 5) return 'bg-teal-600 dark:bg-teal-500';
    return 'bg-teal-800 dark:bg-teal-300';
  };

  const daySquares = [];
  let currentDate = new Date(yearAgo);
  currentDate.setDate(currentDate.getDate() + 1); // Start from the next day

  // Pad the beginning to align the first day with the correct day of the week
  const startDay = currentDate.getDay();
  for (let i = 0; i < startDay; i++) {
    daySquares.push(<div key={`pad-start-${i}`} className="w-4 h-4 rounded-sm" />);
  }
  
  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split('T')[0];
    const count = dates[dateString] || 0;
    
    daySquares.push(
      <div key={dateString} className="w-4 h-4 rounded-sm group relative">
        <div className={`w-full h-full ${getColorClass(count)}`}></div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {count} activities on {new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const monthLabels = [];
  let monthDate = new Date(yearAgo);
  monthDate.setDate(1); // Start from the 1st of the month
  for (let i=0; i<13; i++) {
    // Only add month if it's within the one year range
    if(monthDate > today) break;
    monthLabels.push(
        <div key={`month-${i}`} className="text-xs text-slate-500 dark:text-slate-400">
            {monthDate.toLocaleString('default', { month: 'short' })}
        </div>
    );
    monthDate.setMonth(monthDate.getMonth() + 1);
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
      <div className="grid grid-flow-col grid-rows-7 grid-cols-53 gap-1">
        {daySquares}
      </div>
       <div className="flex justify-between mt-2 px-1">
        {monthLabels}
      </div>
    </div>
  );
};

export default ActivityHeatmap;
