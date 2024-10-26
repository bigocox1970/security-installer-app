import React from 'react';
import { Book, MessageSquareText, BookMarked, Star, MessagesSquare, Store, ClipboardList, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomeProps {
  setActiveView: (view: string) => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

function Home({ 
  setActiveView, 
  isAdmin, 
  isAuthenticated, 
  onAuthRequired,
}: HomeProps) {
  const { user, isAdmin: authIsAdmin } = useAuth();

  const handleNavigation = (view: string) => {
    if (!isAuthenticated && ['chat', 'favorites', 'survey', 'assistant'].includes(view)) {
      onAuthRequired();
      return;
    }
    setActiveView(view);
  };

  const menuItems = [
    { id: 'manuals', icon: Book, label: 'Browse Manuals', color: 'border-blue-500 text-blue-500' },
    { id: 'standards', icon: BookMarked, label: 'Standards', color: 'border-green-500 text-green-500' },
    { id: 'assistant', icon: MessageSquareText, label: 'AI Assistant', color: 'border-purple-500 text-purple-500', requiresAuth: true },
    { id: 'favorites', icon: Star, label: 'My Favorites', color: 'border-amber-500 text-amber-500', requiresAuth: true },
    { id: 'suppliers', icon: Store, label: 'Find Suppliers', color: 'border-cyan-500 text-cyan-500' },
    { id: 'survey', icon: ClipboardList, label: 'Site Survey', color: 'border-purple-500 text-purple-500', requiresAuth: true },
    { id: 'chat', icon: MessagesSquare, label: 'Community Chat', color: 'border-pink-500 text-pink-500', requiresAuth: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            className="relative group"
          >
            <div className={`aspect-square rounded-2xl border-2 ${item.color.split(' ')[0]} bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 flex flex-col items-center justify-center space-y-2 transition-all transform hover:scale-105 hover:shadow-lg hover:bg-gray-200 dark:hover:bg-gray-700`}>
              <item.icon className={`w-8 h-8 sm:w-12 sm:h-12 ${item.color.split(' ')[1]}`} />
              <span className="text-gray-900 dark:text-white font-medium text-xs sm:text-sm text-center">
                {item.label}
              </span>
              {item.requiresAuth && !isAuthenticated && (
                <span className="absolute top-2 right-2">
                  <span className="block w-2 h-2 rounded-full bg-red-500"></span>
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;