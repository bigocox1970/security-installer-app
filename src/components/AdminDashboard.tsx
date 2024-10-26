import React, { useState, useEffect } from 'react';
import { Users, Shield, Loader2, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './admin/UserManagement';
import SupplierSettings from './admin/SupplierSettings';
import type { User, SupplierSetting } from '../types/admin';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'suppliers'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchUsers();
    fetchSuppliers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profiles, error: profilesError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const formattedUsers = profiles.map(profile => ({
        ...profile,
        status: profile.status || 'active'
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('supplier_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSuppliers(data || []);
      setIsEditing(false);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to fetch suppliers');
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      const { error } = await supabase
        .from('users')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as 'admin' | 'user' } : user
      ));
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'suspended' | 'deleted') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status');
    }
  };

  const removeUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
    }
  };

  const reinstateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'active' } : user
      ));
    } catch (err) {
      console.error('Error reinstating user:', err);
      setError('Failed to reinstate user');
    }
  };

  const handleSupplierChange = (id: string, field: keyof SupplierSetting, value: any) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === id ? { ...supplier, [field]: value } : supplier
    ));
    setIsEditing(true);
  };

  const addNewSupplier = () => {
    const newSupplier: SupplierSetting = {
      id: crypto.randomUUID(),
      value: '',
      label: '',
      icon: 'Store',
      search_query: '',
      search_terms: [],
      search_radius: 5000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSuppliers([...suppliers, newSupplier]);
    setIsEditing(true);
  };

  const handleSaveSuppliers = async () => {
    try {
      const suppliersWithTimestamps = suppliers.map(supplier => ({
        ...supplier,
        created_at: supplier.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('supplier_settings')
        .upsert(suppliersWithTimestamps, {
          onConflict: 'id'
        });

      if (error) throw error;
      alert('Supplier settings saved successfully!');
      setIsEditing(false);
      await fetchSuppliers();
    } catch (error) {
      console.error('Error saving supplier settings:', error);
      alert('Failed to save supplier settings');
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Access Denied</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">You need administrator privileges to access this page.</p>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 inline-block mr-2" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'suppliers'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <Map className="w-5 h-5 inline-block mr-2" />
              Supplier Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {activeTab === 'users' ? (
            <UserManagement
              users={users}
              showDeleted={showDeleted}
              setShowDeleted={setShowDeleted}
              toggleUserRole={toggleUserRole}
              updateUserStatus={updateUserStatus}
              removeUser={removeUser}
              reinstateUser={reinstateUser}
            />
          ) : (
            <SupplierSettings
              suppliers={suppliers}
              isEditing={isEditing}
              handleSupplierChange={handleSupplierChange}
              handleSaveSuppliers={handleSaveSuppliers}
              addNewSupplier={addNewSupplier}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;