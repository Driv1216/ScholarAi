import { PUBLIC_BACKEND_URL } from '$env/static/public';
import type { Scholarship } from '$lib/api/scholarships';

export type ApplicationStatus = 'planning' | 'in_progress' | 'submitted' | 'accepted' | 'rejected';

export const applicationStatuses: ApplicationStatus[] = [
	'planning',
	'in_progress',
	'submitted',
	'accepted',
	'rejected'
];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
	planning: 'Planning',
	in_progress: 'In progress',
	submitted: 'Submitted',
	accepted: 'Accepted',
	rejected: 'Rejected'
};

export interface ApplicationTask {
	id: string;
	application_id: string;
	task_name: string;
	task_type: 'document' | 'essay' | 'recommendation' | 'test' | 'form' | 'other' | null;
	completed: boolean;
	due_date: string | null;
}

export interface ScholarshipApplication {
	id: string;
	user_id: string;
	scholarship_id: string;
	status: ApplicationStatus;
	deadline_reminder: string | null;
	applied_at: string | null;
	updated_at: string;
	scholarships?: Scholarship;
	scholarship?: Scholarship;
	application_tasks?: ApplicationTask[];
}

export type ApplicationByScholarship = Record<string, ScholarshipApplication>;

export function applicationForScholarship(application: ScholarshipApplication): Scholarship | null {
	const scholarship = application.scholarships ?? application.scholarship ?? null;
	if (!scholarship) {
		return null;
	}

	return {
		...scholarship,
		match_score: scholarship.match_score ?? 0,
		match_reasons: scholarship.match_reasons ?? []
	};
}

export function mapApplicationsByScholarship(
	applications: ScholarshipApplication[]
): ApplicationByScholarship {
	return Object.fromEntries(
		applications.map((application) => [application.scholarship_id, application])
	);
}

export async function getApplications(userId: string): Promise<ScholarshipApplication[]> {
	const url = new URL('/applications', PUBLIC_BACKEND_URL);
	url.searchParams.set('user_id', userId);

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Could not load applications: ${response.status}`);
	}

	return response.json() as Promise<ScholarshipApplication[]>;
}

export async function createApplication(
	userId: string,
	scholarshipId: string
): Promise<ScholarshipApplication> {
	const response = await fetch(new URL('/applications', PUBLIC_BACKEND_URL), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			user_id: userId,
			scholarship_id: scholarshipId
		})
	});

	if (!response.ok) {
		throw new Error(`Could not track application: ${response.status}`);
	}

	return response.json() as Promise<ScholarshipApplication>;
}

export async function updateApplicationStatus(
	applicationId: string,
	status: ApplicationStatus
): Promise<ScholarshipApplication> {
	const response = await fetch(new URL(`/applications/${applicationId}`, PUBLIC_BACKEND_URL), {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status })
	});

	if (!response.ok) {
		throw new Error(`Could not update application: ${response.status}`);
	}

	return response.json() as Promise<ScholarshipApplication>;
}

export async function deleteApplication(applicationId: string): Promise<void> {
	const response = await fetch(new URL(`/applications/${applicationId}`, PUBLIC_BACKEND_URL), {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error(`Could not delete application: ${response.status}`);
	}
}

export async function updateApplicationTask(
	applicationId: string,
	taskId: string,
	completed: boolean
): Promise<ApplicationTask> {
	const response = await fetch(
		new URL(`/applications/${applicationId}/tasks/${taskId}`, PUBLIC_BACKEND_URL),
		{
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ completed })
		}
	);

	if (!response.ok) {
		throw new Error(`Could not update application task: ${response.status}`);
	}

	return response.json() as Promise<ApplicationTask>;
}
