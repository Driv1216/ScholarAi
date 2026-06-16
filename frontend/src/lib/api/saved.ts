import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Scholarship } from '$lib/api/scholarships';

export async function saveScholarship(
	scholarshipId: string,
	matchScore: number,
	matchReason: string
): Promise<void> {
	const response = await fetch(`/api/saved/${scholarshipId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			match_score: matchScore,
			match_reason: matchReason
		})
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new Error(payload?.message ?? `Could not save scholarship: ${response.status}`);
	}
}

export async function unsaveScholarship(scholarshipId: string): Promise<void> {
	const response = await fetch(`/api/saved/${scholarshipId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new Error(payload?.message ?? `Could not unsave scholarship: ${response.status}`);
	}
}

export async function getSaved(userId: string): Promise<Scholarship[]> {
	const url = new URL('/saved', PUBLIC_BACKEND_URL);
	url.searchParams.set('user_id', userId);

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not load saved scholarships: ${response.status}`);
	}

	return response.json() as Promise<Scholarship[]>;
}
