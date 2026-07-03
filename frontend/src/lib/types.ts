export interface PetImage {
  id: number;
  image: string;
  is_primary: boolean;
}

export interface PetCenter {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status?: string;
}

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed?: string;
  age_months?: number;
  gender?: string;
  size?: string;
  color?: string;
  weight_kg?: number;
  status: string;
  description?: string;
  images?: PetImage[];
  center?: PetCenter;
  center_name?: string;
  is_vaccinated?: boolean;
  is_neutered?: boolean;
  is_microchipped?: boolean;
  special_needs?: string;
  intake_reason?: string;
  created_at?: string;
}

export interface Center {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  cover_image?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  max_capacity?: number;
  current_capacity?: number;
  is_full?: boolean;
  pets_count?: number;
  created_at?: string;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'center_admin' | 'volunteer' | 'adopter';
  is_active: boolean;
  center?: Center;
  phone?: string;
  avatar?: string;
}

export interface AdoptionTimelineEntry {
  id: number;
  old_status: string;
  new_status: string;
  changed_by?: string;
  notes: string;
  created_at: string;
}

export interface Adoption {
  id: number;
  pet: Pet;
  applicant: User;
  center: Center;
  status: string;
  motivation: string;
  experience?: string;
  home_type?: string;
  has_yard?: boolean;
  has_other_pets?: boolean;
  other_pets_details?: string;
  family_members?: number;
  notes?: string;
  review_notes?: string;
  reviewed_by?: User;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
  timeline?: AdoptionTimelineEntry[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PetStats {
  pets_count: number;
  available_pets: number;
  in_process_pets: number;
  adopted_pets: number;
}

export interface AdoptionFormData {
  motivation: string;
  has_other_pets: boolean;
  other_pets_details?: string;
  has_experience: boolean;
  experience_details?: string;
  home_type?: string;
}

export interface FormErrors {
  [key: string]: string;
}
