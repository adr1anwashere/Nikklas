export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ExamPeriod = 'quiz' | 'uts' | 'uas';
export type SessionStatus = 'open' | 'full' | 'closed';
export type AppLocale = 'id' | 'en';

export interface User {
  id: string;
}

export interface Profile {
  id: string;
  nickname: string;
  major: string;
  year: number;
  topic_tags: string[];
  locale: AppLocale;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  campus: string;
  created_at: string;
}

export interface Session {
  id: string;
  host_id: string;
  course_id: string;
  section: string;
  exam_period: ExamPeriod;
  topic_tags: string[];
  starts_at: string;
  max_size: number;
  status: SessionStatus;
  created_at: string;
  filled_at: string | null;
}

export interface SessionFeedItem extends Session {
  course_code: string;
  course_name: string;
  course_campus: string;
  current_size: number;
}

export interface SessionMember {
  session_id: string;
  user_id: string;
  joined_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface MeetingPlace {
  session_id: string;
  description: string;
  map_url: string | null;
  updated_by: string | null;
  updated_at: string;
}
