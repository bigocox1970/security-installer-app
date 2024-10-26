export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface SupplierSetting {
  id: string;
  value: string;
  label: string;
  icon: string;
  search_query: string;
  search_terms: string[];
  search_radius: number;
  created_at: string;
  updated_at: string;
}