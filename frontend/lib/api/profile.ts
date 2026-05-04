import axios from '@/lib/axios';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  weight: number | null;
  height: number | null;
  contact1: string | null;
  contact2: string | null;
  name1: string | null;
  name2: string | null;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data } = await axios.get<UserProfile>('/user/profile');
  return data;
}

export async function updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const { data } = await axios.post<{ data: UserProfile }>('/user/profile', payload);
  return data.data;
}