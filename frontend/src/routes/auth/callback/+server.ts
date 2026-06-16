import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const code = url.searchParams.get('code');

	if (!code) {
		redirect(303, '/login');
	}

	const { error } = await locals.supabase.auth.exchangeCodeForSession(code);

	if (error) {
		redirect(303, '/login');
	}

	redirect(303, '/dashboard');
};
