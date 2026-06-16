<script lang="ts">
	import { goto } from '$app/navigation';
	import { BookMarked, Inbox, Layers } from '@lucide/svelte';
	import {
		createApplication,
		type ApplicationByScholarship,
		type ScholarshipApplication
	} from '$lib/api/applications';
	import type { Scholarship } from '$lib/api/scholarships';
	import { unsaveScholarship } from '$lib/api/saved';
	import NotebookDossierDrawer from '$lib/notebook/NotebookDossierDrawer.svelte';
	import NotebookFileCard from '$lib/notebook/NotebookFileCard.svelte';
	import { createNotebookFiles, type NotebookFile } from '$lib/notebook/model';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let scholarships = $state<Scholarship[]>([]);
	let applicationsByScholarship = $state<ApplicationByScholarship>({});
	let busyIds = $state(new Set<string>());
	let notice = $state('');
	let selectedFile = $state<NotebookFile | null>(null);
	let dossierOpen = $state(false);

	const savedIds = $derived(scholarships.map((scholarship) => scholarship.id));
	const files = $derived(
		createNotebookFiles({
			scholarships,
			savedIds,
			applicationsByScholarship,
			profile: data.profile
		})
	);
	const groups = $derived([
		{
			id: 'closing',
			title: 'Closing soon',
			cue: 'Time sensitive',
			files: files.filter((file) => file.deadlineStatus === 'urgent' || file.deadlineStatus === 'soon')
		},
		{
			id: 'strong',
			title: 'Strong packet',
			cue: 'High confidence',
			files: files.filter((file) => file.readiness.percent >= 82 && file.deadlineStatus !== 'urgent' && file.deadlineStatus !== 'soon')
		},
		{
			id: 'proof',
			title: 'Needs proof',
			cue: 'Verify',
			files: files.filter((file) => file.readiness.percent < 82 && file.blockers.length > 0 && file.deadlineStatus !== 'urgent' && file.deadlineStatus !== 'soon')
		},
		{
			id: 'later',
			title: 'Later',
			cue: 'Quiet shelf',
			files: files.filter((file) => file.readiness.percent < 82 && file.blockers.length === 0 && file.deadlineStatus !== 'urgent' && file.deadlineStatus !== 'soon')
		}
	]);

	$effect(() => {
		scholarships = data.scholarships;
		applicationsByScholarship = data.applicationsByScholarship;
	});

	function setBusy(id: string, busy: boolean) {
		const next = new Set(busyIds);
		if (busy) next.add(id);
		else next.delete(id);
		busyIds = next;
	}

	function replaceApplication(application: ScholarshipApplication) {
		applicationsByScholarship = {
			...applicationsByScholarship,
			[application.scholarship_id]: application
		};
	}

	function openFile(file: NotebookFile) {
		selectedFile = file;
		dossierOpen = true;
	}

	async function unsaveFile(file: NotebookFile) {
		notice = '';
		const previousScholarships = scholarships;
		scholarships = scholarships.filter((scholarship) => scholarship.id !== file.id);
		setBusy(file.id, true);

		try {
			await unsaveScholarship(file.id);
			notice = `${file.scholarship.name} removed from Watchlist.`;
			if (selectedFile?.id === file.id) {
				dossierOpen = false;
			}
		} catch (error) {
			console.error('Could not unsave scholarship', error);
			scholarships = previousScholarships;
			notice = 'Could not remove that file. The shelf was restored.';
		} finally {
			setBusy(file.id, false);
		}
	}

	async function trackFile(file: NotebookFile) {
		if (applicationsByScholarship[file.id]) return;
		notice = '';
		setBusy(file.id, true);

		try {
			const application = await createApplication(data.user.id, file.id);
			replaceApplication(application);
			notice = `${file.scholarship.name} added to Apply Track.`;
		} catch (error) {
			console.error('Could not start application tracking', error);
			notice = 'Could not start tracking that file.';
		} finally {
			setBusy(file.id, false);
		}
	}
</script>

<svelte:head>
	<title>Watchlist · ScholarAI</title>
</svelte:head>

<main class="min-h-screen overflow-x-hidden bg-[#07110d]">
	<section class="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
		<header class="border border-[#b99d62]/30 bg-[#111f18] p-5 shadow-[4px_6px_0_#4d432d] sm:p-7">
			<p class="flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">
				<BookMarked size={15} />
				Watchlist shelf
			</p>
			<div class="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
				<div>
					<h1 class="font-[Newsreader_Variable] text-4xl font-medium leading-[0.95] tracking-[-0.04em] text-[#fff1cf] sm:text-6xl">
						Saved files, sorted by what deserves attention next.
					</h1>
					<p class="mt-4 max-w-2xl text-sm leading-6 text-[#9aa69d]">
						The shelf uses real saved scholarships and application state. Remove files, start tracking, or open the dossier without leaving the watchlist.
					</p>
				</div>
				<div class="grid grid-cols-2 gap-2">
					<div class="shelf-stat"><strong>{files.length}</strong><span>saved</span></div>
					<div class="shelf-stat"><strong>{files.filter((file) => file.application).length}</strong><span>tracked</span></div>
				</div>
			</div>
		</header>

		{#if notice}
			<p class="mt-5 border-l-2 border-[#c1a567] bg-[#13231b] px-4 py-3 text-sm text-[#e5d7b8]">{notice}</p>
		{/if}

		{#if files.length === 0}
			<div class="mt-8 flex min-h-80 flex-col items-center justify-center border border-dashed border-[#b99d62]/30 bg-[#0c1812] p-8 text-center">
				<Inbox size={34} class="text-[#c1a567]" />
				<p class="mt-4 font-[Newsreader_Variable] text-3xl text-[#fff1cf]">The Watchlist shelf is empty.</p>
				<p class="mt-2 max-w-sm text-sm leading-6 text-[#8d9a90]">Save scholarships from the Desk to keep them under observation.</p>
				<button class="mt-5 border border-[#b99d62]/40 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#f3ead5]" type="button" onclick={() => goto('/dashboard')}>
					Return to Desk
				</button>
			</div>
		{:else}
			<div class="mt-8 space-y-8">
				{#each groups as group}
					{#if group.files.length > 0}
						<section class="watch-group">
							<div class="group-header">
								<div>
									<p>{group.cue}</p>
									<h2>{group.title}</h2>
								</div>
								<span><Layers size={14} /> {group.files.length} files</span>
							</div>
							<div class="file-grid">
								{#each group.files as file (file.id)}
									<NotebookFileCard
										{file}
										busy={busyIds.has(file.id)}
										onOpen={openFile}
										onUnsave={unsaveFile}
										onTrack={trackFile}
									/>
								{/each}
							</div>
						</section>
					{/if}
				{/each}
			</div>
		{/if}
	</section>
</main>

<NotebookDossierDrawer
	bind:open={dossierOpen}
	file={selectedFile ? files.find((file) => file.id === selectedFile?.id) ?? selectedFile : null}
	busy={selectedFile ? busyIds.has(selectedFile.id) : false}
	onUnsave={unsaveFile}
	onTrack={trackFile}
/>

<style>
	.shelf-stat {
		border: 1px solid rgba(185, 157, 98, 0.22);
		background: rgba(7, 17, 13, 0.62);
		padding: 0.85rem;
	}

	.shelf-stat strong,
	.shelf-stat span {
		display: block;
	}

	.shelf-stat strong {
		font: 700 1.45rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.shelf-stat span {
		margin-top: 0.2rem;
		font-size: 0.58rem;
		font-weight: 850;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #87958d;
	}

	.watch-group {
		border: 1px solid rgba(185, 157, 98, 0.28);
		background: linear-gradient(135deg, rgba(18, 37, 28, 0.96), rgba(6, 17, 13, 0.96));
		padding: 1rem;
		box-shadow: 0 22px 70px rgba(0, 0, 0, 0.24), 3px 4px 0 rgba(93, 80, 49, 0.55);
	}

	.group-header {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		border-bottom: 1px solid rgba(185, 157, 98, 0.18);
		padding-bottom: 0.85rem;
	}

	.group-header p {
		width: max-content;
		border: 1px solid rgba(193, 165, 103, 0.32);
		background: rgba(193, 165, 103, 0.08);
		padding: 0.32rem 0.5rem;
		font: 850 0.58rem/1 "Instrument Sans Variable", sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: #d7bf7d;
	}

	.group-header h2 {
		margin-top: 0.55rem;
		font: 650 clamp(2rem, 4vw, 3.5rem) / 0.9 "Newsreader Variable", serif;
		letter-spacing: -0.04em;
		color: #fff1cf;
	}

	.group-header span {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid rgba(185, 157, 98, 0.22);
		background: rgba(7, 17, 13, 0.62);
		padding: 0.65rem 0.7rem;
		color: #87958d;
		font-size: 0.62rem;
		font-weight: 850;
		text-transform: uppercase;
		letter-spacing: 0.11em;
	}

	.file-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 1rem;
	}

	@media (min-width: 760px) {
		.file-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1160px) {
		.file-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
