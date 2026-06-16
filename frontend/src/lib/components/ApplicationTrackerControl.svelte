<script lang="ts">
	import {
		applicationStatusLabels,
		applicationStatuses,
		createApplication,
		updateApplicationStatus,
		type ApplicationStatus,
		type ScholarshipApplication
	} from '$lib/api/applications';

	let {
		userId,
		scholarshipId,
		application = null,
		onChange
	}: {
		userId: string;
		scholarshipId: string;
		application?: ScholarshipApplication | null;
		onChange?: (application: ScholarshipApplication) => void;
	} = $props();

	let currentApplication = $state<ScholarshipApplication | null>(null);
	let loading = $state(false);

	$effect(() => {
		currentApplication = application;
	});

	async function startTracking() {
		loading = true;
		try {
			const trackedApplication = await createApplication(userId, scholarshipId);
			currentApplication = trackedApplication;
			onChange?.(trackedApplication);
		} catch (error) {
			console.error('Could not start tracking application', error);
		} finally {
			loading = false;
		}
	}

	async function changeStatus(event: Event) {
		if (!currentApplication) {
			return;
		}

		const nextStatus = (event.currentTarget as HTMLSelectElement).value as ApplicationStatus;
		const previousApplication = currentApplication;
		currentApplication = { ...currentApplication, status: nextStatus };
		onChange?.(currentApplication);
		loading = true;

		try {
			const updatedApplication = await updateApplicationStatus(previousApplication.id, nextStatus);
			currentApplication = updatedApplication;
			onChange?.(updatedApplication);
		} catch (error) {
			console.error('Could not update application status', error);
			currentApplication = previousApplication;
			onChange?.(previousApplication);
		} finally {
			loading = false;
		}
	}
</script>

{#if currentApplication}
	<div class="flex min-w-0 items-center gap-1.5">
		<select
			class="min-w-0 max-w-28 rounded-lg border border-white/[0.07] bg-[#12151e] px-2 py-1.5 text-xs text-white/60 focus:border-indigo-500/60 focus:outline-none"
			value={currentApplication.status}
			disabled={loading}
			aria-label="Application status"
			onchange={changeStatus}
		>
			{#each applicationStatuses as status}
				<option value={status}>{applicationStatusLabels[status]}</option>
			{/each}
		</select>
	</div>
{:else}
	<button
		class="rounded-lg px-2 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
		type="button"
		disabled={loading}
		onclick={startTracking}
	>
		{loading ? 'Tracking...' : 'Track'}
	</button>
{/if}
