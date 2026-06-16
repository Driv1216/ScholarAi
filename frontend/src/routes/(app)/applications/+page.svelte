<script lang="ts">
	import {
		applicationForScholarship,
		applicationStatusLabels,
		applicationStatuses,
		deleteApplication,
		updateApplicationStatus,
		updateApplicationTask,
		type ApplicationStatus,
		type ApplicationTask,
		type ScholarshipApplication
	} from '$lib/api/applications';
	import { formatDeadline } from '$lib/utils/deadline';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let applications = $state<ScholarshipApplication[]>([]);
	let savingIds = $state(new Set<string>());

	$effect(() => {
		applications = data.applications;
	});

	function applicationsFor(status: ApplicationStatus) {
		return applications.filter((application) => application.status === status);
	}

	function updateApplicationInState(application: ScholarshipApplication) {
		applications = applications.map((currentApplication) =>
			currentApplication.id === application.id ? application : currentApplication
		);
	}

	function updateTaskInState(applicationId: string, task: ApplicationTask) {
		applications = applications.map((application) => {
			if (application.id !== applicationId) {
				return application;
			}

			return {
				...application,
				application_tasks: (application.application_tasks ?? []).map((currentTask) =>
					currentTask.id === task.id ? task : currentTask
				)
			};
		});
	}

	async function changeStatus(application: ScholarshipApplication, event: Event) {
		const nextStatus = (event.currentTarget as HTMLSelectElement).value as ApplicationStatus;
		const previousApplication = application;
		updateApplicationInState({ ...application, status: nextStatus });
		savingIds = new Set([...savingIds, application.id]);

		try {
			updateApplicationInState(await updateApplicationStatus(application.id, nextStatus));
		} catch (error) {
			console.error('Could not update application status', error);
			updateApplicationInState(previousApplication);
		} finally {
			const nextSavingIds = new Set(savingIds);
			nextSavingIds.delete(application.id);
			savingIds = nextSavingIds;
		}
	}

	async function toggleTask(application: ScholarshipApplication, task: ApplicationTask) {
		const optimisticTask = { ...task, completed: !task.completed };
		updateTaskInState(application.id, optimisticTask);

		try {
			updateTaskInState(
				application.id,
				await updateApplicationTask(application.id, task.id, optimisticTask.completed)
			);
		} catch (error) {
			console.error('Could not update application task', error);
			updateTaskInState(application.id, task);
		}
	}

	async function stopTracking(application: ScholarshipApplication) {
		const previousApplications = applications;
		applications = applications.filter((currentApplication) => currentApplication.id !== application.id);

		try {
			await deleteApplication(application.id);
		} catch (error) {
			console.error('Could not stop tracking application', error);
			applications = previousApplications;
		}
	}
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8 text-white/80">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-8">
		<div>
			<h1 class="text-xl font-semibold text-white">Applications</h1>
			<p class="mt-1 text-sm text-white/40">
				Track scholarships from planning through final decisions.
			</p>
		</div>

		{#if applications.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
					<svg class="h-6 w-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
				</div>
				<p class="mb-1 text-sm font-medium text-white/60">No applications tracked yet</p>
				<p class="max-w-xs text-xs text-white/30">Start tracking a scholarship from your dashboard or saved list.</p>
			</div>
		{:else}
			<div class="grid gap-5 xl:grid-cols-5">
				{#each applicationStatuses as status}
					<section class="flex min-w-0 flex-col gap-3">
						<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
							<div class="flex items-center justify-between gap-2">
								<p class="font-bold">{applicationStatusLabels[status]}</p>
								<span class="rounded-full border border-white/[0.07] bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/50">{applicationsFor(status).length}</span>
							</div>
						</div>

						{#each applicationsFor(status) as application}
							{@const scholarship = applicationForScholarship(application)}
							{#if scholarship}
								<article class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
									<div class="flex items-start justify-between gap-3">
										<div>
											<p class="font-bold">{scholarship.name}</p>
											<p class="mt-1 text-sm text-white/40">{scholarship.provider}</p>
										</div>
										<span class="shrink-0 rounded-full border border-indigo-500/20 bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-400">{scholarship.match_score}%</span>
									</div>

									<div class="mt-4 text-sm">
										<p class="font-semibold">Deadline</p>
										<p class="text-white/40">{formatDeadline(scholarship.deadline)}</p>
									</div>

									<select
										class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none mt-4 w-full"
										value={application.status}
										disabled={savingIds.has(application.id)}
										aria-label="Application status"
										onchange={(event) => changeStatus(application, event)}
									>
										{#each applicationStatuses as nextStatus}
											<option value={nextStatus}>{applicationStatusLabels[nextStatus]}</option>
										{/each}
									</select>

									{#if (application.application_tasks ?? []).length > 0}
										<div class="mt-4 space-y-2">
											<p class="text-sm font-semibold">Tasks</p>
											{#each application.application_tasks ?? [] as task}
												<label class="label cursor-pointer justify-start gap-3 p-0">
													<input
														class="accent-indigo-500"
														type="checkbox"
														checked={task.completed}
														onchange={() => toggleTask(application, task)}
													/>
													<span
														class={`text-xs text-white/50 text-sm ${task.completed ? 'line-through opacity-60' : ''}`}
													>
														{task.task_name}
													</span>
												</label>
											{/each}
										</div>
									{/if}

									<div class="mt-5 grid grid-cols-1 gap-2">
										<a
											class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
											href={scholarship.application_url ?? scholarship.official_url}
											target="_blank"
											rel="noreferrer"
										>
											View & Apply
										</a>
										<button
											class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
											type="button"
											onclick={() => stopTracking(application)}
										>
											Stop tracking
										</button>
									</div>
								</article>
							{/if}
						{/each}
					</section>
				{/each}
			</div>
		{/if}
	</section>
</main>
