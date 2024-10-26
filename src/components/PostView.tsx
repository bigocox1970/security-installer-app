import React from 'react';
import { X, Edit2, Trash2, MessageSquare, Share2 } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '../contexts/AuthContext';

interface PostViewProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: string;
    author_id: string;
    date: string;
    likes: number;
    comments: number;
  };
  onClose: () => void;
  onEdit?: (post: any) => void;
  onDelete?: (postId: string) => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

function PostView({ post, onClose, onEdit, onDelete, isAuthenticated, onAuthRequired }: PostViewProps) {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{post.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Posted by {post.author} on {post.date}
              </p>
            </div>
            {user && post.author_id === user.id && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit?.(post)}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete?.(post.id)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="mt-6 flex items-center space-x-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <FavoriteButton
              itemId={post.id}
              itemType="post"
              likes={post.likes}
              onAuthRequired={onAuthRequired}
              isAuthenticated={isAuthenticated}
            />
            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostView;