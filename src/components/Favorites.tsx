import React, { useState, useEffect } from 'react';
import { BookOpen, BookMarked, FileText, Star, Users, Trash2, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FavoriteItem {
  id: string;
  title: string;
  type: 'manual' | 'standard' | 'post' | 'user';
  author?: string;
  date: string;
}

interface FavoritesProps {
  onAuthRequired: () => void;
  isAuthenticated: boolean;
}

function Favorites({ onAuthRequired, isAuthenticated }: FavoritesProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'manuals' | 'standards' | 'posts' | 'users'>('all');
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavorites();
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          item_id,
          item_type,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      const items = await Promise.all(
        favoritesData.map(async (fav) => {
          try {
            switch (fav.item_type) {
              case 'manual': {
                const { data } = await supabase
                  .from('manuals')
                  .select('*')
                  .eq('id', fav.item_id)
                  .single();
                return data ? {
                  id: data.id,
                  title: data.title,
                  type: 'manual' as const,
                  date: new Date(data.created_at).toLocaleDateString()
                } : null;
              }
              case 'standard': {
                const { data } = await supabase
                  .from('standards')
                  .select('*')
                  .eq('id', fav.item_id)
                  .single();
                return data ? {
                  id: data.id,
                  title: data.title,
                  type: 'standard' as const,
                  date: new Date(data.created_at).toLocaleDateString()
                } : null;
              }
              case 'post': {
                const { data } = await supabase
                  .from('posts')
                  .select('*, users:author_id(email, full_name)')
                  .eq('id', fav.item_id)
                  .single();
                return data ? {
                  id: data.id,
                  title: data.title,
                  type: 'post' as const,
                  author: data.users?.full_name || data.users?.email?.split('@')[0] || 'Unknown User',
                  date: new Date(data.created_at).toLocaleDateString()
                } : null;
              }
              default:
                return null;
            }
          } catch (err) {
            console.error('Error fetching item:', err);
            return null;
          }
        })
      );

      setFavorites(items.filter((item): item is FavoriteItem => item !== null));
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item: FavoriteItem) => {
    try {
      switch (item.type) {
        case 'manual': {
          const { data, error } = await supabase
            .from('manuals')
            .select('file_url')
            .eq('id', item.id)
            .single();
          
          if (error) throw error;
          if (!data?.file_url) throw new Error('File URL not found');
          
          const { data: urlData } = supabase.storage
            .from('manuals')
            .getPublicUrl(data.file_url);
            
          window.open(urlData.publicUrl, '_blank');
          break;
        }
        case 'standard': {
          const { data, error } = await supabase
            .from('standards')
            .select('file_url')
            .eq('id', item.id)
            .single();
            
          if (error) throw error;
          if (!data?.file_url) throw new Error('File URL not found');
          
          const { data: urlData } = supabase.storage
            .from('standards')
            .getPublicUrl(data.file_url);
            
          window.open(urlData.publicUrl, '_blank');
          break;
        }
        // Handle other types as needed
      }
    } catch (err) {
      console.error('Error accessing item:', err);
      setError('Failed to access item');
    }
  };

  const removeFavorite = async (item: FavoriteItem, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', item.id)
        .eq('item_type', item.type);

      if (error) throw error;

      setFavorites(favorites.filter(fav => fav.id !== item.id));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove favorite');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please sign in to view your favorites.</p>
          <button
            onClick={onAuthRequired}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredFavorites = activeTab === 'all' 
    ? favorites 
    : favorites.filter(item => item.type === activeTab.slice(0, -1));

  const getIcon = (type: string) => {
    switch (type) {
      case 'manual':
        return BookOpen;
      case 'standard':
        return BookMarked;
      case 'post':
        return FileText;
      case 'user':
        return Users;
      default:
        return Star;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Favorites</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {['all', 'manuals', 'standards', 'posts'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 text-xs text-gray-400">
                  ({favorites.filter(item => tab === 'all' ? true : item.type === tab.slice(0, -1)).length})
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredFavorites.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No favorites found in this category.
            </div>
          ) : (
            filteredFavorites.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item)}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          {item.author && <span>By {item.author}</span>}
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => removeFavorite(item, e)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Favorites;