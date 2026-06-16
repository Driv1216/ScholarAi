import { supabase } from '$lib/supabase';
import type { StudentProfile } from '$lib/types/profile';

export type StudentProfileInput = Omit<StudentProfile, 'user_id' | 'updated_at'>;

export async function getProfile(userId: string): Promise<StudentProfile | null> {
	const { data, error } = await supabase
		.from('student_profiles')
		.select('*')
		.eq('user_id', userId)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
}

export async function upsertProfile(
	userId: string,
	data: StudentProfileInput
): Promise<StudentProfile> {
	const payload = {
		...data,
		user_id: userId,
		updated_at: new Date().toISOString()
	};

	const { data: existingProfile, error: lookupError } = await supabase
		.from('student_profiles')
		.select('user_id')
		.eq('user_id', userId)
		.maybeSingle();

	if (lookupError) {
		throw lookupError;
	}

	const query = existingProfile
		? supabase.from('student_profiles').update(payload).eq('user_id', userId)
		: supabase.from('student_profiles').insert(payload);

	const { data: profile, error } = await query
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return profile;
}
