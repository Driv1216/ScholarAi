export type DeadlineStatus = 'expired' | 'urgent' | 'soon' | 'normal' | 'unknown';

function parseDeadline(deadline: string | null): Date | null {
	if (!deadline) {
		return null;
	}

	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
	if (!match) {
		return null;
	}

	const [, yearValue, monthValue, dayValue] = match;
	const year = Number(yearValue);
	const month = Number(monthValue);
	const day = Number(dayValue);
	const date = new Date(year, month - 1, day);

	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}

	return date;
}

export function getDeadlineStatus(deadline: string | null): DeadlineStatus {
	const date = parseDeadline(deadline);
	if (!date) {
		return 'unknown';
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const deadlineDate = new Date(date);
	deadlineDate.setHours(0, 0, 0, 0);

	const daysUntilDeadline = Math.ceil(
		(deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
	);

	if (daysUntilDeadline < 0) {
		return 'expired';
	}

	if (daysUntilDeadline <= 30) {
		return 'urgent';
	}

	if (daysUntilDeadline <= 60) {
		return 'soon';
	}

	return 'normal';
}

export function formatDeadline(deadline: string | null): string {
	const date = parseDeadline(deadline);
	if (!date) {
		return 'No deadline listed';
	}

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	}).format(date);
}
