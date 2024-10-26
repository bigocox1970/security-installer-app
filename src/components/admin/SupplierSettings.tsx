import React from 'react';
import { Save, Plus, X } from 'lucide-react';
import type { SupplierSetting } from '../../types/admin';

interface SupplierSettingsProps {
  suppliers: SupplierSetting[];
  isEditing: boolean;
  handleSupplierChange: (id: string, field: keyof SupplierSetting, value: any) => void;
  handleSaveSuppliers: () => Promise<void>;
  addNewSupplier: () => void;
}

export default function SupplierSettings({
  suppliers,
  isEditing,
  handleSupplierChange,
  handleSaveSuppliers,
  addNewSupplier
}: SupplierSettingsProps) {
  // Sort suppliers to show newest first (based on created_at)
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    // New suppliers without created_at should appear first
    if (!a.created_at) return -1;
    if (!b.created_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleCancel = () => {
    // Refresh the page to reset the state
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Supplier Search Settings</h3>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveSuppliers}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              onClick={addNewSupplier}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {sortedSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">{supplier.label || 'New Supplier'}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure search parameters</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Label
                </label>
                <input
                  type="text"
                  value={supplier.label}
                  onChange={(e) => handleSupplierChange(supplier.id, 'label', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Value
                </label>
                <input
                  type="text"
                  value={supplier.value}
                  onChange={(e) => handleSupplierChange(supplier.id, 'value', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Terms (comma-separated)
                </label>
                <input
                  type="text"
                  value={supplier.search_terms.join(', ')}
                  onChange={(e) => handleSupplierChange(
                    supplier.id,
                    'search_terms',
                    e.target.value.split(',').map(term => term.trim())
                  )}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Radius (meters)
                </label>
                <input
                  type="number"
                  value={supplier.search_radius}
                  onChange={(e) => handleSupplierChange(
                    supplier.id,
                    'search_radius',
                    parseInt(e.target.value)
                  )}
                  min="1000"
                  max="50000"
                  step="1000"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}