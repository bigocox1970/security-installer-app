import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Plus, Edit2, Trash2, Loader2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  author_id: string;
  date: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

interface UserPostsProps {
  onAuthRequired: () => void;
  isAuthenticated: boolean;
}

const PREVIEW_LENGTH = 200;

function UserPosts({ onAuthRequired, isAuthenticated }: UserPostsProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          users:author_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Get user's favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user?.id)
        .eq('item_type', 'post');

      const likedPosts = new Set(favorites?.map(f => f.item_id) || []);

      const formattedPosts = postsData.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        author: post.users?.full_name || post.users?.email.split('@')[0] || 'Unknown User',
        author_id: post.author_id,
        date: new Date(post.created_at).toLocaleDateString(),
        likes: post.likes || 0,
        comments: post.comments || 0,
        isLiked: likedPosts.has(post.id)
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            title: newPost.title,
            content: newPost.content,
            author_id: user.id
          }
        ])
        .select();

      if (error) throw error;

      await fetchPosts();
      setNewPost({ title: '', content: '' });
      setShowNewPostForm(false);
      setIsContentExpanded(false);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setNewPost({ title: post.title, content: post.content });
    setShowNewPostForm(true);
    setIsContentExpanded(true);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPost) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: newPost.title,
          content: newPost.content
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      await fetchPosts();
      setNewPost({ title: '', content: '' });
      setEditingPost(null);
      setShowNewPostForm(false);
      setIsContentExpanded(false);
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user || !confirm('Are you sure you want to delete this post?')) return;

    try {
      // First delete any favorites referencing this post
      await supabase
        .from('favorites')
        .delete()
        .eq('item_id', postId)
        .eq('item_type', 'post');

      // Then delete the post
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      await fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      onAuthRequired();
      return;
    }

    try {
      if (isLiked) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', postId)
          .eq('item_type', 'post');

        // Decrement likes count
        await supabase
          .from('posts')
          .update({ likes: posts.find(p => p.id === postId)?.likes - 1 || 0 })
          .eq('id', postId);
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              item_id: postId,
              item_type: 'post'
            }
          ]);

        // Increment likes count
        await supabase
          .from('posts')
          .update({ likes: posts.find(p => p.id === postId)?.likes + 1 || 1 })
          .eq('id', postId);
      }

      await fetchPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like status');
    }
  };

  const isPostExpanded = (postId: string) => expandedPosts.has(postId);

  const shouldShowReadMore = (content: string) => content.length > PREVIEW_LENGTH;

  const getPreviewContent = (content: string, postId: string) => {
    if (!shouldShowReadMore(content) || isPostExpanded(postId)) {
      return content;
    }
    return content.slice(0, PREVIEW_LENGTH) + '...';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Posts</h2>
        {isAuthenticated && !showNewPostForm && (
          <button
            onClick={() => {
              setShowNewPostForm(true);
              setEditingPost(null);
              setNewPost({ title: '', content: '' });
              setIsContentExpanded(false);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showNewPostForm && (
        <div className={`fixed inset-0 z-50 bg-white dark:bg-gray-800 overflow-auto ${isContentExpanded ? 'p-4' : 'p-6'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingPost ? 'Edit Post' : 'New Post'}
              </h3>
              <button
                onClick={() => {
                  setShowNewPostForm(false);
                  setEditingPost(null);
                  setNewPost({ title: '', content: '' });
                  setIsContentExpanded(false);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={editingPost ? handleUpdatePost : handleSubmitPost} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex-1 flex flex-col">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content
                </label>
                <textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  onFocus={() => setIsContentExpanded(true)}
                  className={`mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-200 ${
                    isContentExpanded ? 'flex-1 h-[calc(100vh-300px)]' : 'h-32'
                  }`}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPostForm(false);
                    setEditingPost(null);
                    setNewPost({ title: '', content: '' });
                    setIsContentExpanded(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingPost ? 'Update' : 'Post'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white dark:bg-gray-800 rounded-lg p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{post.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Posted by {post.author} on {post.date}
                </p>
              </div>
              {user && post.author_id === user.id && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(post)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {getPreviewContent(post.content, post.id)}
              </p>
              {shouldShowReadMore(post.content) && (
                <button
                  onClick={() => togglePostExpansion(post.id)}
                  className="mt-2 flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                >
                  {isPostExpanded(post.id) ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Read More
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => toggleLike(post.id, post.isLiked)}
                className={`flex items-center space-x-1 text-sm ${
                  post.isLiked
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes}</span>
              </button>
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
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPosts;