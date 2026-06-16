import { PUBLIC_BACKEND_URL } from '$env/static/public';

export interface ScholarshipCriteria {
	scholarship_id: string;
	criterion_type: string;
	operator: string;
	value: string;
	required: boolean;
}

export interface Scholarship {
	id: string;
	name: string;
	provider: string;
	official_url: string;
	country: string | null;
	degree_level: string | null;
	fields: string[];
	award_amount: string | null;
	deadline: string | null;
	application_url: string | null;
	trust_score: number;
	status: string;
	scholarship_criteria?: ScholarshipCriteria[];
	match_score: number;
	match_reasons: string[];
}

export interface MatchResponse {
	scholarships: Scholarship[];
	total: number;
}

export async function getMatches(userId: string): Promise<MatchResponse> {
	const url = new URL('/scholarships/matches', PUBLIC_BACKEND_URL);
	url.searchParams.set('user_id', userId);

	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Could not load scholarship matches: ${response.status}`);
	}

	return response.json() as Promise<MatchResponse>;
}
