export interface StudentProfile {
	user_id: string;
	full_name: string;
	nationality: string;
	current_country: string;
	degree_level: string;
	field_of_study: string;
	cgpa: number | null;
	income_range: string;
	target_countries: string[];
	target_degrees: string[];
	documents_available: string[];
	updated_at: string;
}
