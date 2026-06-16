import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
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
	} = await event.locals.supabase.auth.getSession();

	const {
		data: { user }
	} = await event.locals.supabase.auth.getUser();

	event.locals.session = session;
	event.locals.user = user;

	if (event.url.pathname === '/login' && user) {
		redirect(303, '/dashboard');
	}

	if (event.route.id?.startsWith('/(app)') && !user) {
		redirect(303, '/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
