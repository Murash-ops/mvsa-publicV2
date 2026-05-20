export type Venue = {
  id: number;
  name: string;
  type: 'turf' | 'meeting_room';
  hourly_rates: Record<string, unknown>;
};

export type TimeSlot = {
  id: number;
  venue_id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'held';
  price_tier: 'peak' | 'off_peak' | 'weekend';
};
