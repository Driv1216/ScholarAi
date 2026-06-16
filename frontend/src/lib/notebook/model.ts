import type {
	ApplicationByScholarship,
	ApplicationStatus,
	ApplicationTask,
	ScholarshipApplication
} from '$lib/api/applications';
import type { Scholarship } from '$lib/api/scholarships';
import { formatDeadline, getDeadlineStatus, type DeadlineStatus } from '$lib/utils/deadline';

export type NotebookBucket = 'needs-proof' | 'apply-track' | 'watchlist';

export interface NotebookBucketMeta {
	id: NotebookBucket;
	label: string;
	cue: string;
	description: string;
}

export interface NotebookProfileSnapshot {
	full_name?: string | null;
	nationality?: string | null;
	current_country?: string | null;
	degree_level?: string | null;
	field_of_study?: string | null;
	cgpa?: number | null;
	income_range?: string | null;
	target_countries?: string[] | null;
	target_degrees?: string[] | null;
	documents_available?: string[] | null;
}

export interface NotebookProfileCompleteness {
	percent: number;
	missingFields: string[];
}

export interface NotebookReadiness {
	percent: number;
	label: string;
	tone: 'strong' | 'steady' | 'fragile';
	signals: string[];
}

export interface NotebookBlocker {
	id: string;
	label: string;
	detail: string;
	severity: 'critical' | 'warning' | 'notice';
}

export interface NotebookNextAction {
	label: string;
	detail: string;
	tone: 'proof' | 'apply' | 'watch';
}

export interface NotebookFile {
	id: string;
	bucket: NotebookBucket;
	scholarship: Scholarship;
	application: ScholarshipApplication | null;
	isSaved: boolean;
	readiness: NotebookReadiness;
	blockers: NotebookBlocker[];
	nextAction: NotebookNextAction;
	deadlineStatus: DeadlineStatus;
	deadlineText: string;
	tasksTotal: number;
	tasksCompleted: number;
}

export const notebookBucketMetas: NotebookBucketMeta[] = [
	{
		id: 'needs-proof',
		label: 'Needs Proof',
		cue: 'Prove fit',
		description: 'Uncommitted matches that need evidence before they deserve application time.'
	},
	{
		id: 'apply-track',
		label: 'Apply Track',
		cue: 'Execute',
		description: 'Active applications and serious contenders with live work attached.'
	},
	{
		id: 'watchlist',
		label: 'Watchlist',
		cue: 'Monitor',
		description: 'Saved scholarships worth keeping in view while the packet improves.'
	}
];

const profileFields: Array<{ key: keyof NotebookProfileSnapshot; label: string; weight: number }> = [
	{ key: 'full_name', label: 'Full name', weight: 8 },
	{ key: 'nationality', label: 'Nationality', weight: 12 },
	{ key: 'current_country', label: 'Current country', weight: 8 },
	{ key: 'degree_level', label: 'Current degree level', weight: 10 },
	{ key: 'field_of_study', label: 'Field of study', weight: 14 },
	{ key: 'cgpa', label: 'CGPA', weight: 12 },
	{ key: 'income_range', label: 'Income range', weight: 6 },
	{ key: 'target_countries', label: 'Target countries', weight: 12 },
	{ key: 'target_degrees', label: 'Target degrees', weight: 10 },
	{ key: 'documents_available', label: 'Document packet', weight: 8 }
];

function hasValue(value: unknown) {
	if (Array.isArray(value)) return value.length > 0;
	if (typeof value === 'string') return value.trim().length > 0;
	return value !== null && value !== undefined;
}

export function calculateNotebookProfileCompleteness(
	profile: NotebookProfileSnapshot | null | undefined
): NotebookProfileCompleteness {
	if (!profile) {
		return {
			percent: 0,
			missingFields: profileFields.map((field) => field.label)
		};
	}

	const totalWeight = profileFields.reduce((total, field) => total + field.weight, 0);
	let completedWeight = 0;
	const missingFields: string[] = [];

	for (const field of profileFields) {
		if (hasValue(profile[field.key])) {
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

function normalize(value: string | null | undefined) {
	return (value ?? '').trim().toLowerCase();
}

function countryFits(profile: NotebookProfileSnapshot | null | undefined, scholarship: Scholarship) {
	const targets = profile?.target_countries ?? [];
	const country = normalize(scholarship.country);
	if (!targets.length || !country || country === 'global' || country === 'europe') return true;
	return targets.some((target) => country.includes(normalize(target)) || normalize(target).includes(country));
}

function degreeFits(profile: NotebookProfileSnapshot | null | undefined, scholarship: Scholarship) {
	const targets = profile?.target_degrees ?? [];
	const degree = normalize(scholarship.degree_level);
	if (!targets.length || !degree) return true;
	return targets.some((target) => degree.includes(normalize(target)) || normalize(target).includes(degree));
}

function documentsScore(profile: NotebookProfileSnapshot | null | undefined) {
	const documents = profile?.documents_available ?? [];
	if (documents.length >= 4) return 100;
	if (documents.length >= 2) return 72;
	if (documents.length === 1) return 44;
	return 18;
}

function getIncompleteTasks(application: ScholarshipApplication | null) {
	return (application?.application_tasks ?? []).filter((task) => !task.completed);
}

function getTaskProgress(application: ScholarshipApplication | null) {
	const tasks = application?.application_tasks ?? [];
	const completed = tasks.filter((task) => task.completed).length;
	return {
		total: tasks.length,
		completed,
		percent: tasks.length ? Math.round((completed / tasks.length) * 100) : 100
	};
}

function buildBlockers(
	scholarship: Scholarship,
	application: ScholarshipApplication | null,
	profile: NotebookProfileSnapshot | null | undefined,
	completeness: NotebookProfileCompleteness
): NotebookBlocker[] {
	const blockers: NotebookBlocker[] = [];
	const deadlineStatus = getDeadlineStatus(scholarship.deadline);
	const incompleteTasks = getIncompleteTasks(application);

	if (deadlineStatus === 'expired') {
		blockers.push({
			id: `${scholarship.id}-deadline-expired`,
			label: 'Deadline closed',
			detail: 'The listed deadline has passed. Verify whether a new cycle is open before investing effort.',
			severity: 'critical'
		});
	} else if (deadlineStatus === 'unknown') {
		blockers.push({
			id: `${scholarship.id}-deadline-missing`,
			label: 'Deadline missing',
			detail: 'No deadline is listed, so urgency and workload cannot be trusted yet.',
			severity: 'warning'
		});
	}

	if (scholarship.trust_score < 75) {
		blockers.push({
			id: `${scholarship.id}-trust`,
			label: 'Low source trust',
			detail: `Trust score is ${scholarship.trust_score}. Confirm details from the official source.`,
			severity: 'warning'
		});
	}

	if (scholarship.match_score < 70) {
		blockers.push({
			id: `${scholarship.id}-match`,
			label: 'Weak match',
			detail: `Match score is ${scholarship.match_score}. Eligibility or fit needs a closer read.`,
			severity: 'warning'
		});
	}

	if (!countryFits(profile, scholarship)) {
		blockers.push({
			id: `${scholarship.id}-country`,
			label: 'Destination mismatch',
			detail: `${scholarship.country ?? 'This destination'} is outside the current target country packet.`,
			severity: 'notice'
		});
	}

	if (!degreeFits(profile, scholarship)) {
		blockers.push({
			id: `${scholarship.id}-degree`,
			label: 'Degree mismatch',
			detail: `${scholarship.degree_level ?? 'The degree level'} is outside the current degree goals.`,
			severity: 'notice'
		});
	}

	for (const missingField of completeness.missingFields.slice(0, 3)) {
		blockers.push({
			id: `${scholarship.id}-profile-${missingField.toLowerCase().replace(/\s+/g, '-')}`,
			label: `Missing ${missingField.toLowerCase()}`,
			detail: 'Complete the profile folio so this file can be judged against stronger evidence.',
			severity: 'notice'
		});
	}

	if (application && incompleteTasks.length > 0) {
		blockers.push({
			id: `${scholarship.id}-tasks`,
			label: `${incompleteTasks.length} task${incompleteTasks.length === 1 ? '' : 's'} open`,
			detail: incompleteTasks[0]?.task_name ?? 'Application tasks are still incomplete.',
			severity: 'warning'
		});
	}

	return blockers;
}

function buildReadiness(
	scholarship: Scholarship,
	application: ScholarshipApplication | null,
	profile: NotebookProfileSnapshot | null | undefined,
	completeness: NotebookProfileCompleteness,
	blockers: NotebookBlocker[]
): NotebookReadiness {
	const deadlineStatus = getDeadlineStatus(scholarship.deadline);
	const taskProgress = getTaskProgress(application);
	let score = 0;

	score += Math.min(100, Math.max(0, completeness.percent)) * 0.24;
	score += documentsScore(profile) * 0.16;
	score += Math.min(100, Math.max(0, scholarship.match_score)) * 0.22;
	score += Math.min(100, Math.max(0, scholarship.trust_score)) * 0.14;
	score += countryFits(profile, scholarship) ? 8 : 0;
	score += degreeFits(profile, scholarship) ? 8 : 0;
	score += deadlineStatus === 'expired' || deadlineStatus === 'unknown' ? 0 : 8;
	score += taskProgress.percent * 0.08;

	const percent = Math.max(0, Math.min(100, Math.round(score - blockers.filter((item) => item.severity === 'critical').length * 10)));
	const tone = percent >= 82 ? 'strong' : percent >= 62 ? 'steady' : 'fragile';
	const label = tone === 'strong' ? 'Strong packet' : tone === 'steady' ? 'Packet forming' : 'Needs proof';
	const signals = [
		`${scholarship.match_score}% match`,
		`${scholarship.trust_score}% trust`,
		`${completeness.percent}% folio`,
		application ? `${taskProgress.completed}/${taskProgress.total} tasks` : 'Not tracked'
	];

	return { percent, label, tone, signals };
}

function buildNextAction(
	scholarship: Scholarship,
	application: ScholarshipApplication | null,
	blockers: NotebookBlocker[]
): NotebookNextAction {
	const incompleteTask = getIncompleteTasks(application)[0];

	if (incompleteTask) {
		return {
			label: incompleteTask.task_name,
			detail: 'Clear the next open task in the application ledger.',
			tone: 'apply'
		};
	}

	if (application) {
		return {
			label: 'Review status and submit evidence',
			detail: 'The file is tracked. Keep status and packet work current.',
			tone: 'apply'
		};
	}

	if (blockers.length > 0) {
		return {
			label: blockers[0].label,
			detail: blockers[0].detail,
			tone: 'proof'
		};
	}

	return {
		label: 'Save for monitoring',
		detail: 'This file has enough signal to keep in the watchlist.',
		tone: 'watch'
	};
}

function deriveBucket(
	scholarshipId: string,
	application: ScholarshipApplication | null,
	isSaved: boolean,
	readiness: NotebookReadiness,
	blockers: NotebookBlocker[]
): NotebookBucket {
	if (application) return 'apply-track';
	if (isSaved) return 'watchlist';
	if (blockers.some((blocker) => blocker.severity !== 'notice') || readiness.percent < 70) return 'needs-proof';
	return 'needs-proof';
}

export function createNotebookFiles({
	scholarships,
	savedIds = [],
	applicationsByScholarship = {},
	profile,
	profileCompleteness
}: {
	scholarships: Scholarship[];
	savedIds?: string[];
	applicationsByScholarship?: ApplicationByScholarship;
	profile?: NotebookProfileSnapshot | null;
	profileCompleteness?: NotebookProfileCompleteness | null;
}): NotebookFile[] {
	const savedSet = new Set(savedIds);
	const completeness = profileCompleteness ?? calculateNotebookProfileCompleteness(profile);

	return scholarships.map((scholarship) => {
		const application = applicationsByScholarship[scholarship.id] ?? null;
		const blockers = buildBlockers(scholarship, application, profile, completeness);
		const readiness = buildReadiness(scholarship, application, profile, completeness, blockers);
		const isSaved = savedSet.has(scholarship.id);
		const bucket = deriveBucket(scholarship.id, application, isSaved, readiness, blockers);
		const taskProgress = getTaskProgress(application);

		return {
			id: scholarship.id,
			bucket,
			scholarship,
			application,
			isSaved,
			readiness,
			blockers,
			nextAction: buildNextAction(scholarship, application, blockers),
			deadlineStatus: getDeadlineStatus(scholarship.deadline),
			deadlineText: formatDeadline(scholarship.deadline),
			tasksTotal: taskProgress.total,
			tasksCompleted: taskProgress.completed
		};
	});
}

export function filesForBucket(files: NotebookFile[], bucket: NotebookBucket) {
	return files.filter((file) => file.bucket === bucket);
}

export function averageReadiness(files: NotebookFile[]) {
	if (!files.length) return 0;
	return Math.round(files.reduce((total, file) => total + file.readiness.percent, 0) / files.length);
}

export function blockerCount(files: NotebookFile[]) {
	return files.reduce((total, file) => total + file.blockers.length, 0);
}

export function upcomingDeadlineCount(files: NotebookFile[]) {
	return files.filter((file) => file.deadlineStatus === 'urgent' || file.deadlineStatus === 'soon').length;
}

export function firstIncompleteTask(application: ScholarshipApplication | null): ApplicationTask | null {
	return getIncompleteTasks(application)[0] ?? null;
}

export const applicationStatusClass: Record<ApplicationStatus, string> = {
	planning: 'Planning',
	in_progress: 'In progress',
	submitted: 'Submitted',
	accepted: 'Accepted',
	rejected: 'Rejected'
};
