import React from 'react';
import Navbar from './Navbar';

const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default PageLayout; 