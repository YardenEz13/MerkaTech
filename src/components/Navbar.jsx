import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import {Button} from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl border-b border-slate-700">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link 
            to="/control" 
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent hover:from-blue-500 hover:to-teal-500 transition-all duration-500 transform hover:scale-105 hover:rotate-1"
          >
            Tank System
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 ml-auto items-center">
            <Link
              to="/history"
              className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-all duration-300 text-gray-300 hover:text-white transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            >
              Camera History
            </Link>
            <Link
              to="/system"
              className="px-4 py-2 rounded-lg hover:bg-slate-800 transition-all duration-300 text-gray-300 hover:text-white transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            >
              System Explanation
            </Link>
            <Button
              id="logoutButton"
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 px-6 text-l transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 hover:-translate-y-0.5"
              onClick={() => signOut(auth).then(() => window.location.href = "/")}
            >
              Logout
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden">
            <button 
              onClick={handleToggle} 
              className="p-2 rounded-lg hover:bg-slate-800 transition-all duration-300 focus:outline-none transform hover:scale-110 active:scale-95"
            >
              <svg
                className="w-6 h-6 transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="flex flex-col space-y-3 pb-4">
            <li className="transform transition-transform duration-200 hover:translate-x-2">
              <Link
                to="/history"
                className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-all duration-300 text-gray-300 hover:text-white"
              >
                Camera History
              </Link>
            </li>
            <li className="transform transition-transform duration-200 hover:translate-x-2">
              <Link
                to="/system"
                className="block px-4 mx-auto py-2 rounded-lg hover:bg-slate-800 transition-all duration-300 text-gray-300 hover:text-white"
              >
                System Explanation
              </Link>
            </li>
            <li className="transform transition-transform duration-200 hover:translate-x-2">
              <Button
                id="logoutButton"
                onClick={() => {
                  setIsOpen(false);
                  signOut(auth).then(() => window.location.href = "/");
                }}
                className="w-full mx-0  bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Logout
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
