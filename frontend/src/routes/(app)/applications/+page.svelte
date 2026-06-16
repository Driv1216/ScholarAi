<script lang="ts">
	import { ClipboardCheck, ClipboardList, ExternalLink, Trash2 } from '@lucide/svelte';
	import {
		applicationForScholarship,
		applicationStatusLabels,
		applicationStatuses,
		deleteApplication,
		mapApplicationsByScholarship,
		updateApplicationStatus,
		updateApplicationTask,
		type ApplicationStatus,
		type ApplicationTask,
		type ScholarshipApplication
	} from '$lib/api/applications';
	import NotebookDossierDrawer from '$lib/notebook/NotebookDossierDrawer.svelte';
	import NotebookFileCard from '$lib/notebook/NotebookFileCard.svelte';
	import { createNotebookFiles, firstIncompleteTask, type NotebookFile } from '$lib/notebook/model';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let applications = $state<ScholarshipApplication[]>([]);
	let savingIds = $state(new Set<string>());
	let notice = $state('');
	let selectedFile = $state<NotebookFile | null>(null);
	let dossierOpen = $state(false);

	const applicationsByScholarship = $derived(mapApplicationsByScholarship(applications));
	const trackedScholarships = $derived(
		applications.map(applicationForScholarship).filter((scholarship) => scholarship !== null)
	);
	const files = $derived(
		createNotebookFiles({
			scholarships: trackedScholarships,
			applicationsByScholarship
		})
	);
	const tasksRemaining = $derived(
		applications.reduce(
			(total, application) =>
				total + (application.application_tasks ?? []).filter((task) => !task.completed).length,
			0
		)
	);
	const submittedCount = $derived(applications.filter((application) => application.status === 'submitted' || application.status === 'accepted').length);
	const nextDeadline = $derived.by(() => {
		const dated = files
			.filter((file) => file.scholarship.deadline && file.deadlineStatus !== 'expired')
			.sort((a, b) => String(a.scholarship.deadline).localeCompare(String(b.scholarship.deadline)));
		return dated[0]?.deadlineText ?? 'No deadline listed';
	});

	$effect(() => {
		applications = data.applications;
	});

	function applicationsFor(status: ApplicationStatus) {
		return applications.filter((application) => application.status === status);
	}

	function fileFor(application: ScholarshipApplication) {
		return files.find((file) => file.id === application.scholarship_id) ?? null;
	}

	function setSaving(id: string, saving: boolean) {
		const next = new Set(savingIds);
		if (saving) next.add(id);
		else next.delete(id);
		savingIds = next;
	}

	function updateApplicationInState(application: ScholarshipApplication) {
		applications = applications.map((currentApplication) =>
			currentApplication.id === application.id ? application : currentApplication
		);
	}

	function updateTaskInState(applicationId: string, task: ApplicationTask) {
		applications = applications.map((application) => {
			if (application.id !== applicationId) return application;

			return {
				...application,
				application_tasks: (application.application_tasks ?? []).map((currentTask) =>
					currentTask.id === task.id ? task : currentTask
				)
			};
		});
	}

	function openFile(file: NotebookFile) {
		selectedFile = file;
		dossierOpen = true;
	}

	async function changeStatus(application: ScholarshipApplication, event: Event) {
		const nextStatus = (event.currentTarget as HTMLSelectElement).value as ApplicationStatus;
		const previousApplication = application;
		notice = '';
		updateApplicationInState({ ...application, status: nextStatus });
		setSaving(application.id, true);

		try {
			updateApplicationInState(await updateApplicationStatus(application.id, nextStatus));
			notice = `${applicationStatusLabels[nextStatus]} status saved.`;
		} catch (error) {
			console.error('Could not update application status', error);
			updateApplicationInState(previousApplication);
			notice = 'Could not update status. The ledger was restored.';
		} finally {
			setSaving(application.id, false);
		}
	}

	async function toggleTask(application: ScholarshipApplication, task: ApplicationTask) {
		const optimisticTask = { ...task, completed: !task.completed };
		notice = '';
		updateTaskInState(application.id, optimisticTask);

		try {
			updateTaskInState(
				application.id,
				await updateApplicationTask(application.id, task.id, optimisticTask.completed)
			);
		} catch (error) {
			console.error('Could not update application task', error);
			updateTaskInState(application.id, task);
			notice = 'Could not update task. The ledger was restored.';
		}
	}

	async function stopTracking(application: ScholarshipApplication) {
		const previousApplications = applications;
		notice = '';
		applications = applications.filter((currentApplication) => currentApplication.id !== application.id);

		try {
			await deleteApplication(application.id);
			notice = 'Application tracking stopped.';
			if (selectedFile?.id === application.scholarship_id) {
				dossierOpen = false;
			}
		} catch (error) {
			console.error('Could not stop tracking application', error);
			applications = previousApplications;
			notice = 'Could not stop tracking. The ledger was restored.';
		}
	}
</script>

<svelte:head>
	<title>Apply Track · ScholarAI</title>
</svelte:head>

<main class="min-h-screen overflow-x-hidden bg-[#07110d]">
	<section class="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
		<header class="border border-[#b99d62]/30 bg-[#111f18] p-5 shadow-[4px_6px_0_#4d432d] sm:p-7">
			<p class="flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">
				<ClipboardList size={15} />
				Apply Track / Command board
			</p>
			<div class="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
				<div>
					<h1 class="font-[Newsreader_Variable] text-4xl font-medium leading-[0.95] tracking-[-0.04em] text-[#fff1cf] sm:text-6xl">
						Active applications, deadlines, and unfinished packet work.
					</h1>
					<p class="mt-4 max-w-2xl text-sm leading-6 text-[#9aa69d]">
						Move each file through the existing production statuses. Task checkboxes, status changes, stop tracking, and apply links use the current APIs.
					</p>
				</div>
				<div class="ledger-grid">
					<div><strong>{applications.length}</strong><span>active files</span></div>
					<div><strong>{tasksRemaining}</strong><span>tasks open</span></div>
					<div><strong>{submittedCount}</strong><span>submitted</span></div>
					<div><strong>{nextDeadline}</strong><span>next deadline</span></div>
				</div>
			</div>
		</header>

		{#if notice}
			<p class="mt-5 border-l-2 border-[#c1a567] bg-[#13231b] px-4 py-3 text-sm text-[#e5d7b8]">{notice}</p>
		{/if}

		{#if applications.length === 0}
			<div class="mt-8 flex min-h-80 flex-col items-center justify-center border border-dashed border-[#b99d62]/30 bg-[#0c1812] p-8 text-center">
				<ClipboardCheck size={34} class="text-[#c1a567]" />
				<p class="mt-4 font-[Newsreader_Variable] text-3xl text-[#fff1cf]">No applications tracked yet.</p>
				<p class="mt-2 max-w-sm text-sm leading-6 text-[#8d9a90]">Start tracking a scholarship from Desk or Watchlist to build the execution ledger.</p>
			</div>
		{:else}
			<div class="mt-8 grid gap-5 xl:grid-cols-5">
				{#each applicationStatuses as status}
					<section class="status-lane">
						<div class="status-header">
							<p>{applicationStatusLabels[status]}</p>
							<span>{applicationsFor(status).length}</span>
						</div>

						<div class="mt-3 space-y-3">
							{#each applicationsFor(status) as application}
								{@const file = fileFor(application)}
								{@const scholarship = applicationForScholarship(application)}
								{#if file && scholarship}
									<div class="application-file">
										<NotebookFileCard {file} busy={savingIds.has(application.id)} onOpen={openFile} />

										<div class="command-panel">
											<label>
												<span>Status</span>
												<select
													value={application.status}
													disabled={savingIds.has(application.id)}
													aria-label="Application status"
													onchange={(event) => changeStatus(application, event)}
												>
													{#each applicationStatuses as nextStatus}
														<option value={nextStatus}>{applicationStatusLabels[nextStatus]}</option>
													{/each}
												</select>
											</label>

											{#if (application.application_tasks ?? []).length > 0}
												<div class="tasks">
													<p>Next: {firstIncompleteTask(application)?.task_name ?? 'All tasks complete'}</p>
													{#each application.application_tasks ?? [] as task}
														<label class:done={task.completed}>
															<input
																type="checkbox"
																checked={task.completed}
																onchange={() => toggleTask(application, task)}
															/>
															<span>{task.task_name}</span>
														</label>
													{/each}
												</div>
											{/if}

											<div class="command-actions">
												<a href={scholarship.application_url ?? scholarship.official_url} target="_blank" rel="noreferrer">
													<ExternalLink size={13} />
													View/apply
												</a>
												<button type="button" onclick={() => stopTracking(application)}>
													<Trash2 size={13} />
													Stop
												</button>
											</div>
										</div>
									</div>
								{/if}
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{/if}
	</section>
</main>

<NotebookDossierDrawer
	bind:open={dossierOpen}
	file={selectedFile ? files.find((file) => file.id === selectedFile?.id) ?? selectedFile : null}
/>

<style>
	.ledger-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.ledger-grid div {
		border: 1px solid rgba(185, 157, 98, 0.22);
		background: rgba(7, 17, 13, 0.62);
		padding: 0.8rem;
	}

	.ledger-grid strong,
	.ledger-grid span {
		display: block;
	}

	.ledger-grid strong {
		font: 700 1.25rem/1.1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.ledger-grid span {
		margin-top: 0.25rem;
		font-size: 0.56rem;
		font-weight: 850;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #87958d;
	}

	.status-lane {
		min-width: 0;
		border: 1px solid rgba(185, 157, 98, 0.28);
		background: linear-gradient(180deg, rgba(18, 37, 28, 0.96), rgba(6, 17, 13, 0.96));
		padding: 0.85rem;
		box-shadow: 3px 4px 0 rgba(93, 80, 49, 0.55);
	}

	.status-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		border-bottom: 1px solid rgba(185, 157, 98, 0.18);
		padding-bottom: 0.75rem;
	}

	.status-header p {
		font: 850 0.68rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #d7bf7d;
	}

	.status-header span {
		border: 1px solid rgba(185, 157, 98, 0.25);
		padding: 0.2rem 0.45rem;
		font: 700 0.8rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.application-file {
		display: grid;
		gap: 0.75rem;
	}

	.command-panel {
		border: 1px solid rgba(185, 157, 98, 0.28);
		background: #0c1812;
		padding: 0.75rem;
	}

	.command-panel label span,
	.tasks p {
		display: block;
		margin-bottom: 0.45rem;
		font: 850 0.58rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #c1a567;
	}

	.command-panel select {
		width: 100%;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: #07110d;
		padding: 0.65rem;
		font-size: 0.82rem;
		color: #f3ead5;
	}

	.tasks {
		margin-top: 0.8rem;
		display: grid;
		gap: 0.45rem;
	}

	.tasks label {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		font-size: 0.78rem;
		line-height: 1.35;
		color: #cfc1a1;
	}

	.tasks label.done {
		opacity: 0.62;
		text-decoration: line-through;
	}

	.tasks input {
		margin-top: 0.1rem;
		accent-color: #c1a567;
	}

	.command-actions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
		margin-top: 0.85rem;
	}

	.command-actions a,
	.command-actions button {
		display: inline-flex;
		min-height: 2.25rem;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: transparent;
		padding-inline: 0.5rem;
		font: 850 0.58rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #e5d7b8;
		text-decoration: none;
	}
</style>
