import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface SaveScholarshipBody {
	match_score?: unknown;
	match_reason?: unknown;
}

function requireUserId(userId: string | undefined) {
	if (!userId) {
		error(401, 'You must be signed in to save scholarships');
	}

	return userId;
}

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	const userId = requireUserId(locals.user?.id);
	const body = (await request.json().catch(() => ({}))) as SaveScholarshipBody;
	const matchScore = Number(body.match_score);

	if (!Number.isFinite(matchScore) || matchScore < 0 || matchScore > 100) {
		return json({ message: 'Invalid scholarship match score' }, { status: 400 });
	}

	const { error: saveError } = await locals.supabase.from('saved_scholarships').upsert(
		{
			user_id: userId,
			scholarship_id: params.scholarshipId,
			match_score: Math.round(matchScore),
			match_reason: typeof body.match_reason === 'string' ? body.match_reason : ''
		},
		{ onConflict: 'user_id,scholarship_id' }
	);

	if (saveError) {
		console.error('Could not save scholarship', saveError);
		return json({ message: 'Could not save scholarship' }, { status: 500 });
	}

	return json({ saved: true });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const userId = requireUserId(locals.user?.id);
	const { error: deleteError } = await locals.supabase
		.from('saved_scholarships')
		.delete()
		.eq('user_id', userId)
		.eq('scholarship_id', params.scholarshipId);

	if (deleteError) {
		console.error('Could not unsave scholarship', deleteError);
		return json({ message: 'Could not unsave scholarship' }, { status: 500 });
	}

	return json({ saved: false });
};
