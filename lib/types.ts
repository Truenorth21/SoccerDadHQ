import type { RegionKey } from "./regions";

export interface ClubReviewScores {
  coaching: number;
  development: number;
  organization: number;
  culture: number;
  value: number;
  facilities: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // overall, 1-5
  scores: ClubReviewScores | CoachReviewScores | SchoolReviewScores;
  title: string;
  body: string;
  created_at: string;
  relationship?: string; // "Parent", "Player", "Coach"
}

export interface Club {
  id: string;
  slug: string;
  name: string;
  region: RegionKey;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  founded?: number;
  description: string;
  logo_color: string; // hex for the generated crest
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  leagues: string[];
  age_groups: string[];
  genders: string[];
  gallery: string[]; // gradient seeds
  tryouts_open: boolean;
  tryout_note?: string;
  claimed: boolean;
  verified: boolean;
  featured: boolean; // paid "Featured" placement
  plan: "free" | "pro" | "featured";
  rating: number;
  review_count: number;
  scores: ClubReviewScores;
  reviews: Review[];
}

export interface SchoolReviewScores {
  coaching: number;
  development: number;
  culture: number;
  competitiveness: number;
  academics: number;
  facilities: number;
}

export interface School {
  id: string;
  slug: string;
  name: string;
  region: RegionKey;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  type: "Public" | "Private";
  fhsaa_class: string; // e.g. "Class 6A"
  district: string;
  mascot: string;
  colors: string[]; // two hex colors
  logo_color: string;
  programs: string[]; // ["Boys","Girls"]
  head_coach_boys?: string;
  head_coach_girls?: string;
  state_titles: number;
  last_title?: number;
  district_titles: number;
  enrollment: number;
  description: string;
  website?: string;
  featured: boolean;
  plan: "free" | "pro" | "featured";
  rating: number;
  review_count: number;
  scores: SchoolReviewScores;
  reviews: Review[];
}

export interface CoachReviewScores {
  communication: number;
  development: number;
  personality: number;
  fairness: number;
  game_management: number;
  overall_impact: number;
}

export interface Coach {
  id: string;
  slug: string;
  name: string;
  region: RegionKey;
  city: string;
  club_id?: string;
  club_name?: string;
  title: string; // "Director of Coaching", "U15 Girls Head Coach"
  bio: string;
  photo_color: string;
  certifications: string[];
  specialties: string[];
  age_groups: string[];
  genders: string[];
  private_training: boolean;
  private_training_note?: string;
  email?: string;
  phone?: string;
  featured: boolean;
  plan: "free" | "pro" | "featured";
  rating: number;
  review_count: number;
  scores: CoachReviewScores;
  reviews: Review[];
}

export interface Tryout {
  id: string;
  club_id: string;
  club_name: string;
  club_slug: string;
  region: RegionKey;
  city: string;
  age_groups: string;
  gender: string;
  date: string; // ISO
  note: string;
}

export interface RankingItem {
  id: string;
  rank: number;
  name: string;
  subtitle: string;
  region: RegionKey | "statewide";
  league?: string;
  votes: number;
  trend: "up" | "down" | "flat" | "new";
  href?: string;
  color?: string; // crest/avatar color for the podium + rows
  gender?: string; // "Boys" | "Girls" — for school team rankings
  level?: string; // "Varsity" | "JV" | "Middle School" — for school team rankings
  cls?: string; // FHSAA class/division (e.g. "Class 5A") — for school team rankings
}

export interface Commitment {
  id: string;
  player_name: string;
  grad_year: number;
  gender: string; // Boys | Girls
  position: string; // GK | Defender | Midfielder | Forward
  dest_type: "College" | "Pro" | "National Team";
  destination: string; // e.g. "University of Florida", "Inter Miami CF", "U-17 USYNT"
  division?: string; // NCAA D1/D2/D3, NAIA, JUCO (college only)
  region: RegionKey;
  // A commitment is showcased by a club and/or a school (the paid profile that announced it)
  club_id?: string;
  club_name?: string;
  club_slug?: string;
  school_id?: string;
  school_name?: string;
  school_slug?: string;
  date: string; // ISO announced date
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  region?: RegionKey; // detected Florida region, when a story is geo-specific
  excerpt: string;
  published: string; // ISO
  image?: string;
}
