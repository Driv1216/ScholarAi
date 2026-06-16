import { getApplications, mapApplicationsByScholarship } from '$lib/api/applications';
import { getSaved } from '$lib/api/saved';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return {
			scholarships: [],
			applicationsByScholarship: {}
		};
	}

	try {
		return {
			scholarships: await getSaved(userId),
			applicationsByScholarship: mapApplicationsByScholarship(await getApplications(userId))
		};
	} catch (error) {
		console.error('Could not load saved scholarships', error);

		return {
			scholarships: [],
			applicationsByScholarship: {}
		};
	}
};
