import React from 'react';

interface StatusButtonProps {
  status: 'active' | 'inactive';
  onClick: () => void;
  loading?: boolean;
}

const StatusButton: React.FC<StatusButtonProps> = ({ 
  status, 
  onClick, 
  loading = false 
}) => {
  const isActive = status === 'active';
  
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full
        transition-all duration-200 min-w-[80px] justify-center
        ${loading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-105 active:scale-95 cursor-pointer'
        }
        ${isActive 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-red-100 text-red-800 hover:bg-red-200'
        }
      `}
      title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
    >
      {loading ? (
        <>
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
          <span className="text-xs">...</span>
        </>
      ) : (
        <>
          <div className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {status}
        </>
      )}
    </button>
  );
};

export default StatusButton;