import React, { useEffect, useState } from 'react';
import { LoginForm } from "../components/login-form"
import { Shield } from 'lucide-react';

export default function Login() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Add a slight delay for the animation to look better
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 scale-105"
        src="/photos-videos/tankVideo.mp4"
        poster="/photos-videos/tank-poster.jpg"
      >
      </video>
      
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10"></div>
      
      

      {/* Login Form Container */}
      <div className={`relative z-20 flex h-screen w-full flex-col items-center justify-center p-4 sm:p-6 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-full mb-3 shadow-lg shadow-blue-500/20">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">MerkaTech</h1>
            <p className="text-lg text-gray-200 drop-shadow-md">מערכת בקרה וניהול טנק</p>
          </div>
          
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <h2 className="text-xl font-semibold text-white text-center drop-shadow-sm">התחברות למערכת</h2>
            </div>
            <div className="p-6 sm:p-8">
              <LoginForm className="space-y-5" />
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-300 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <p className="drop-shadow-md">© {new Date().getFullYear()} MerkaTech. כל הזכויות שמורות.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

