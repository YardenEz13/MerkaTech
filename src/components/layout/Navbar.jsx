import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Shield, History as HistoryIcon, Settings, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { name: 'בקרה', path: '/control', icon: <Shield size={18} /> },
    { name: 'היסטוריה', path: '/history', icon: <HistoryIcon size={18} /> },
    { name: 'מערכת', path: '/System', icon: <Settings size={18} /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-lg' : 'bg-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/control" className="flex items-center">
              <img 
                className="h-10 w-auto" 
                src="/photos-videos/merkaTechLogo.jpg" 
                alt="MerkaTech Logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40?text=MT';
                }}
              />
              <span className="mr-3 text-xl font-bold text-white">MerkaTech</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="ml-2">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center text-gray-300 hover:text-white focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="mr-2 text-sm">{auth.currentUser?.email?.split('@')[0] || 'משתמש'}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-right block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors duration-150"
                  >
                    <div className="flex items-center">
                      <LogOut size={16} className="ml-2" />
                      <span>התנתק</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">פתח תפריט</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="ml-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-slate-700 hover:text-white"
            >
              <LogOut size={18} className="ml-3" />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 