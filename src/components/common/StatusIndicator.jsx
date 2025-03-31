import React from 'react';

const StatusIndicator = ({ status, text, count, loading }) => {
  const statusColors = {
    success: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    loading: 'bg-yellow-400',
    idle: 'bg-gray-400',
  };

  const color = statusColors[status] || statusColors.idle;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 inline-flex items-center">
      <div className={`h-2 w-2 rounded-full mr-2 ${color}`}></div>
      {loading ? 'טוען נתונים...' : `${text}${count !== undefined ? ` ${count}` : ''}`}
    </div>
  );
};

export default StatusIndicator; 