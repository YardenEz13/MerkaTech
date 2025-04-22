import React from 'react';

const StatusIndicator = ({ status, text, loading }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300 inline-flex items-center mb-6">
      <div className={`h-2 w-2 rounded-full mr-2 ${loading ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
      {text}
    </div>
  );
};

export default StatusIndicator; 