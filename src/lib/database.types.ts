export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          role: 'admin' | 'user'
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'user'
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'user'
        }
      }
      manuals: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          category: string
          file_url: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          category: string
          file_url: string
          uploaded_by: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          category?: string
          file_url?: string
          uploaded_by?: string
        }
      }
      standards: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          category: string
          file_url: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          category: string
          file_url: string
          uploaded_by: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          category?: string
          file_url?: string
          uploaded_by?: string
        }
      }
      posts: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          author_id: string
          likes: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          author_id: string
          likes?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          author_id?: string
          likes?: number
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          content: string
          post_id: string
          author_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          post_id: string
          author_id: string
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          post_id?: string
          author_id?: string
        }
      }
      favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          item_id: string
          item_type: 'manual' | 'standard' | 'post'
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          item_id: string
          item_type: 'manual' | 'standard' | 'post'
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          item_id?: string
          item_type?: 'manual' | 'standard' | 'post'
        }
      }
      feature_requests: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status: 'pending' | 'in_progress' | 'completed' | 'rejected'
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          user_id?: string
        }
      }
      surveys: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_address: string
          system_type: string
          control_equipment: string
          grade: string
          item_count: number
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_address: string
          system_type: string
          control_equipment: string
          grade: string
          item_count: number
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_address?: string
          system_type?: string
          control_equipment?: string
          grade?: string
          item_count?: number
          notes?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}