export interface ProfileRow {
  id: number;
  user_id: number;
  full_name: string | null;
  dob: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ethnicity: string | null;
  religion: string | null;
  pob: string | null;
  phone: string | null;
  cccd_number: string | null;
  permanent_address: string | null;
  high_school_info: string | null;
  priority_area: 'KV1' | 'KV2-NT' | 'KV2' | 'KV3' | null;
  priority_object: 'UT1' | 'UT2' | null;
  cccd_front_url: string | null;
  cccd_back_url: string | null;
  avatar_url: string | null;
  score_subject_1: number | null;
  score_subject_2: number | null;
  score_subject_3: number | null;
  total_score: number | null;
  priority_score: number | null;
  final_score: number | null;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
  email?: string;
}

export interface StatRow {
  label: string;
  count: number;
}
