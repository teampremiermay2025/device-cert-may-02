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
      certification_requests: {
        Row: {
          id: string
          title: string
          description: string | null
          stage: 'FORECAST' | 'PLANNING' | 'SUBMITTED' | 'SUBMISSION_REVIEW' | 'DEVICE_ENTRY' | 'DEVICE_TESTING' | 'TAQ_REVIEW' | 'TA_COMPLETE' | 'CLOSED'
          status: string
          created_at: string
          updated_at: string
          created_by: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          stage?: 'FORECAST' | 'PLANNING' | 'SUBMITTED' | 'SUBMISSION_REVIEW' | 'DEVICE_ENTRY' | 'DEVICE_TESTING' | 'TAQ_REVIEW' | 'TA_COMPLETE' | 'CLOSED'
          status?: string
          created_at?: string
          updated_at?: string
          created_by: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          stage?: 'FORECAST' | 'PLANNING' | 'SUBMITTED' | 'SUBMISSION_REVIEW' | 'DEVICE_ENTRY' | 'DEVICE_TESTING' | 'TAQ_REVIEW' | 'TA_COMPLETE' | 'CLOSED'
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          metadata?: Json | null
        }
      }
      tasks: {
        Row: {
          id: string
          certification_id: string
          title: string
          description: string | null
          assignee: string | null
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
          due_date: string | null
          created_at: string
          updated_at: string
          labels: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          certification_id: string
          title: string
          description?: string | null
          assignee?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          labels?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          certification_id?: string
          title?: string
          description?: string | null
          assignee?: string | null
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
          due_date?: string | null
          created_at?: string
          updated_at?: string
          labels?: string[] | null
          metadata?: Json | null
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          uploaded_by: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          task_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          uploaded_by: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_path?: string
          uploaded_by?: string
          uploaded_at?: string
        }
      }
      task_time_logs: {
        Row: {
          id: string
          task_id: string
          user_id: string
          duration: string
          description: string | null
          logged_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          duration: string
          description?: string | null
          logged_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          duration?: string
          description?: string | null
          logged_at?: string
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
      certification_stage: 'FORECAST' | 'PLANNING' | 'SUBMITTED' | 'SUBMISSION_REVIEW' | 'DEVICE_ENTRY' | 'DEVICE_TESTING' | 'TAQ_REVIEW' | 'TA_COMPLETE' | 'CLOSED'
      task_priority: 'LOW' | 'MEDIUM' | 'HIGH'
      task_status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
    }
  }
}