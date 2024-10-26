import React from 'react';
import { Book, MessageSquareText, BookMarked, Moon, Sun, LogOut, Star, MessagesSquare, Home as HomeIcon, ClipboardList, Store, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
  closeSidebar: () => void;
}

function Sidebar({ 
  activeView, 
  setActiveView, 
  darkMode, 
  toggleDarkMode,
  isAdmin,
  isAuthenticated,
  onAuthRequired,
  closeSidebar
}: SidebarProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setActiveView('home');
      closeSidebar();
    } catch (error) {
      setActiveView('home');
      closeSidebar();
    }
  };

  const handleNavigation = (view: string) => {
    if (view === activeView) {
      closeSidebar();
      return;
    }
    
    if (view.requiresAuth && !isAuthenticated) {
      onAuthRequired();
      closeSidebar();
      return;
    }
    
    setActiveView(view);
    closeSidebar();
  };

  const menuItems = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'manuals', icon: Book, label: 'Browse Manuals' },
    { id: 'standards', icon: BookMarked, label: 'Standards' },
    { id: 'suppliers', icon: Store, label: 'Find Suppliers' },
    { id: 'chat', icon: MessagesSquare, label: 'Community Chat', requiresAuth: true },
    { id: 'favorites', icon: Star, label: 'My Favorites', requiresAuth: true },
    { id: 'survey', icon: ClipboardList, label: 'Site Survey', requiresAuth: true },
    { id: 'assistant', icon: MessageSquareText, label: 'AI Assistant', requiresAuth: true },
    ...(isAdmin ? [{ id: 'admin', icon: Shield, label: 'Admin Dashboard', requiresAuth: true }] : []),
  ];

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeView === item.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{item.label}</span>
              {item.requiresAuth && !isAuthenticated && (
                <span className="ml-auto block w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {isAuthenticated ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onAuthRequired}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;