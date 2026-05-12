export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  case_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  case_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: { username: string; display_name: string; avatar_url: string };
}
