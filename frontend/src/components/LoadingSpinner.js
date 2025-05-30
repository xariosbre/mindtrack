import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'indigo' }) => {
  // Define classes de tamanho e cor baseadas nas props
  const spinnerSize = {
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  const spinnerColor = {
    indigo: 'border-indigo-500',
    gray: 'border-gray-500',
    white: 'border-white',
    // Adicione mais cores conforme necessário
  }[color];

  return (
    <div className="flex justify-center items-center">
      <div
        className={`spinner ${spinnerSize} border-t-transparent rounded-full animate-spin`}
        style={{ borderColor: `rgba(0,0,0,0.1)`, borderTopColor: `var(--color-${color}-500, #6366f1)` }} // Fallback color
      ></div>
    </div>
  );
};

export default LoadingSpinner;