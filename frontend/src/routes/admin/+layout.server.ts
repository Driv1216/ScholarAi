import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: options.path ?? '/' });
				});
			}
		}
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session) {
		redirect(303, '/login');
	}

	const { data } = await supabase
		.from('users')
		.select('role')
		.eq('id', session.user.id)
		.single();

	if (data?.role !== 'admin') {
		redirect(303, '/dashboard?error=admin_required');
	}

	return {
		user: session.user
	};
};
