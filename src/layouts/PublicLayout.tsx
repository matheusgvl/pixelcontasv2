import React from 'react';
import { Outlet } from 'react-router-dom';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-pixel-neutral-50 flex flex-col w-full text-pixel-neutral-900 overflow-x-hidden font-sans">
      <Outlet />
    </div>
  );
};
export default PublicLayout;
