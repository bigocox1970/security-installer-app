import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Lock, Loader2, X, Upload, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ManualUpload from './ManualUpload';
import FavoriteButton from './FavoriteButton';

interface Manual {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_url: string;
  created_at: string;
  uploaded_by: string;
  likes: number;
}

interface ManualListProps {
  onAuthRequired: () => void;
  isAuthenticated: boolean;
}

function ManualList({ onAuthRequired, isAuthenticated }: ManualListProps) {
  const { user, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    fetchManuals();
  }, []);

  const fetchManuals = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('manuals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManuals(data || []);
    } catch (err) {
      console.error('Error fetching manuals:', err);
      setError('Failed to load manuals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualClick = async (manual: Manual) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    try {
      const { data } = supabase.storage
        .from('manuals')
        .getPublicUrl(manual.file_url);

      window.open(data.publicUrl, '_blank');
    } catch (err) {
      console.error('Error accessing manual:', err);
      setError('Failed to access the manual');
    }
  };

  const handleDelete = async (manual: Manual, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !confirm('Are you sure you want to delete this manual?')) return;

    try {
      setLoading(true);
      
      const { error: storageError } = await supabase.storage
        .from('manuals')
        .remove([manual.file_url]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('manuals')
        .delete()
        .eq('id', manual.id);

      if (dbError) throw dbError;

      setManuals(manuals.filter(m => m.id !== manual.id));
      alert('Manual deleted successfully!');
    } catch (err) {
      console.error('Error deleting manual:', err);
      setError('Failed to delete manual');
    } finally {
      setLoading(false);
    }
  };

  const handleLikesChange = (manualId: string, newCount: number) => {
    setManuals(manuals.map(manual => 
      manual.id === manualId ? { ...manual, likes: newCount } : manual
    ));
  };

  const filteredManuals = manuals.filter(manual => 
    manual.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manual.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (manual.description && manual.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && manuals.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search manuals..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isAuthenticated && isAdmin && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="ml-4 flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Manual</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredManuals.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No manuals found.
            </div>
          ) : (
            filteredManuals.map((manual) => (
              <div
                key={manual.id}
                onClick={() => handleManualClick(manual)}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {manual.title}
                      </h3>
                      {manual.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {manual.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {manual.category}
                        </span>
                        <span>{new Date(manual.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4" onClick={e => e.stopPropagation()}>
                    <FavoriteButton
                      itemId={manual.id}
                      itemType="manual"
                      likes={manual.likes || 0}
                      onAuthRequired={onAuthRequired}
                      isAuthenticated={isAuthenticated}
                      onLikesChange={(newCount) => handleLikesChange(manual.id, newCount)}
                    />
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(manual, e)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    {!isAuthenticated && (
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Manual</h2>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ManualUpload 
              onAuthRequired={onAuthRequired} 
              isAuthenticated={isAuthenticated} 
              onUploadComplete={() => {
                setShowUploadForm(false);
                fetchManuals();
              }}
              type="manual"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualList;