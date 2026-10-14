import React from 'react';

export const LoadingState = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin"></div>
        <img
          src="/PD_logo.png"
          alt="Prince Digital"
          className="w-6 h-6 object-contain rounded-sm"
        />
      </div>
      <p className="text-xs tracking-widest uppercase text-neutral-400 font-medium">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return content;
};
