import { getApplications } from '$lib/api/applications';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return {
			applications: []
		};
	}

	try {
		return {
			applications: await getApplications(userId)
		};
	} catch (error) {
		console.error('Could not load applications', error);

		return {
			applications: []
		};
	}
};
