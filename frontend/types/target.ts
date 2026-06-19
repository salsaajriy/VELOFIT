export type TargetType = 'daily' | 'weekly';

export interface TargetProgress {
  current: number;
  remaining: number;
  percent: number;
}

export interface Target {
  id: number;
  type: TargetType;
  distance: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ActiveTarget extends Target {
  progress: TargetProgress;
}

export interface DailyBreakdownEntry {
  date: string;
  distance: number;
}

export interface WeeklyBreakdownEntry {
  week_start: string;
  week_end: string;
  total: number;
  target: number | null;
}

export interface TargetStats {
  streak: number;
  best_day: DailyBreakdownEntry | null;
}