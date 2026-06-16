import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.session || !locals.user) {
		redirect(303, '/login');
	}

	const { data: profile } = await locals.supabase
		.from('student_profiles')
		.select('user_id')
		.eq('user_id', locals.user.id)
		.maybeSingle();

	const hasProfile = Boolean(profile);

	if (!hasProfile && url.pathname !== '/profile/setup') {
		redirect(303, '/profile/setup');
	}

	return {
		user: locals.user,
		hasProfile
	};
};
