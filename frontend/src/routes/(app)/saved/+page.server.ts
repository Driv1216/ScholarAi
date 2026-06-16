import { getApplications, mapApplicationsByScholarship } from '$lib/api/applications';
import { getSaved } from '$lib/api/saved';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return {
			scholarships: [],
			applicationsByScholarship: {},
			profile: null
		};
	}

	try {
		const { data: profile } = await locals.supabase
			.from('student_profiles')
			.select(
				'full_name,nationality,current_country,degree_level,field_of_study,cgpa,income_range,target_countries,target_degrees,documents_available'
			)
			.eq('user_id', userId)
			.maybeSingle();

		return {
			scholarships: await getSaved(userId),
			applicationsByScholarship: mapApplicationsByScholarship(await getApplications(userId)),
			profile: profile ?? null
		};
	} catch (error) {
		console.error('Could not load saved scholarships', error);

		return {
			scholarships: [],
			applicationsByScholarship: {},
			profile: null
		};
	}
};
