import { getApplications, mapApplicationsByScholarship } from '$lib/api/applications';
import { getMatches } from '$lib/api/scholarships';
import { getSaved } from '$lib/api/saved';
import type { PageServerLoad } from './$types';

interface ProfileCompleteness {
	percent: number;
	missingFields: string[];
}

interface StudentProfileRow {
	full_name: string | null;
	nationality: string | null;
	current_country: string | null;
	degree_level: string | null;
	field_of_study: string | null;
	cgpa: number | null;
	income_range: string | null;
	target_countries: string[] | null;
	target_degrees: string[] | null;
	documents_available: string[] | null;
}

const profileCompletenessFields = [
	{ key: 'full_name', label: 'Full name', weight: 8 },
	{ key: 'nationality', label: 'Nationality', weight: 14 },
	{ key: 'current_country', label: 'Current country', weight: 8 },
	{ key: 'degree_level', label: 'Current degree level', weight: 10 },
	{ key: 'field_of_study', label: 'Field of study', weight: 14 },
	{ key: 'cgpa', label: 'CGPA', weight: 12 },
	{ key: 'income_range', label: 'Income range', weight: 6 },
	{ key: 'target_countries', label: 'Target countries', weight: 12 },
	{ key: 'target_degrees', label: 'Target degrees', weight: 10 },
	{ key: 'documents_available', label: 'Documents', weight: 8 }
] as const;

function hasProfileValue(value: unknown) {
	if (Array.isArray(value)) {
		return value.length > 0;
	}

	if (typeof value === 'string') {
		return value.trim().length > 0;
	}

	return value !== null && value !== undefined;
}

function calculateProfileCompleteness(profile: StudentProfileRow | null): ProfileCompleteness {
	if (!profile) {
		return {
			percent: 0,
			missingFields: profileCompletenessFields.map((field) => field.label)
		};
	}

	const totalWeight = profileCompletenessFields.reduce((total, field) => total + field.weight, 0);
	let completedWeight = 0;
	const missingFields: string[] = [];

	for (const field of profileCompletenessFields) {
		if (hasProfileValue(profile[field.key])) {
			completedWeight += field.weight;
		} else {
			missingFields.push(field.label);
		}
	}

	return {
		percent: Math.round((completedWeight / totalWeight) * 100),
		missingFields
	};
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	if (!userId) {
		return {
			scholarships: [],
			total: 0,
			fullName: null,
			profile: null,
			savedIds: [],
			applicationsByScholarship: {},
			profileCompleteness: calculateProfileCompleteness(null)
		};
	}

	const { data: profile } = await locals.supabase
		.from('student_profiles')
		.select(
			'full_name,nationality,current_country,degree_level,field_of_study,cgpa,income_range,target_countries,target_degrees,documents_available'
		)
		.eq('user_id', userId)
		.maybeSingle();
	const profileCompleteness = calculateProfileCompleteness(profile);

	try {
		const matches = await getMatches(userId);
		let savedIds: string[] = [];
		let applicationsByScholarship = {};

		try {
			const savedScholarships = await getSaved(userId);
			savedIds = savedScholarships.map((scholarship) => scholarship.id);
		} catch (error) {
			console.error('Could not load saved scholarship IDs', error);
		}

		try {
			applicationsByScholarship = mapApplicationsByScholarship(await getApplications(userId));
		} catch (error) {
			console.error('Could not load application statuses', error);
		}

		return {
			scholarships: matches.scholarships,
			total: matches.total,
			fullName: profile?.full_name ?? null,
			profile: profile ?? null,
			savedIds,
			applicationsByScholarship,
			profileCompleteness
		};
	} catch (error) {
		console.error('Could not load scholarship matches', error);

		return {
			scholarships: [],
			total: 0,
			fullName: profile?.full_name ?? null,
			profile: profile ?? null,
			savedIds: [],
			applicationsByScholarship: {},
			profileCompleteness
		};
	}
};
