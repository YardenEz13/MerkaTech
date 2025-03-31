import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      <Navbar />
      <main className={`pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout; 