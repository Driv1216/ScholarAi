<script lang="ts">
	import { navigating } from '$app/stores';
	import { dndzone } from 'svelte-dnd-action';
	import { Archive, BookOpenCheck, CheckCircle2, ClipboardList, FileWarning } from '@lucide/svelte';
	import {
		createApplication,
		mapApplicationsByScholarship,
		type ApplicationByScholarship,
		type ScholarshipApplication
	} from '$lib/api/applications';
	import { saveScholarship, unsaveScholarship } from '$lib/api/saved';
	import NotebookDossierDrawer from '$lib/notebook/NotebookDossierDrawer.svelte';
	import NotebookFileCard from '$lib/notebook/NotebookFileCard.svelte';
	import {
		averageReadiness,
		blockerCount,
		createNotebookFiles,
		filesForBucket,
		notebookBucketMetas,
		upcomingDeadlineCount,
		type NotebookBucket,
		type NotebookFile
	} from '$lib/notebook/model';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let savedIds = $state<string[]>([]);
	let applicationsByScholarship = $state<ApplicationByScholarship>({});
	let busyIds = $state(new Set<string>());
	let notice = $state('');
	let selectedFile = $state<NotebookFile | null>(null);
	let dossierOpen = $state(false);
	let laneFiles = $state<Record<NotebookBucket, NotebookFile[]>>({
		'needs-proof': [],
		'apply-track': [],
		watchlist: []
	});

	const firstName = $derived((data.fullName ?? data.user.email ?? 'there').split(' ')[0]);
	const files = $derived(
		createNotebookFiles({
			scholarships: data.scholarships,
			savedIds,
			applicationsByScholarship,
			profile: data.profile,
			profileCompleteness: data.profileCompleteness
		})
	);
	const activeFiles = $derived(filesForBucket(files, 'apply-track'));
	const totalBlockers = $derived(blockerCount(files));
	const urgentFiles = $derived(upcomingDeadlineCount(files));

	$effect(() => {
		savedIds = data.savedIds;
		applicationsByScholarship = data.applicationsByScholarship;
	});

	$effect(() => {
		laneFiles = {
			'needs-proof': filesForBucket(files, 'needs-proof'),
			'apply-track': filesForBucket(files, 'apply-track'),
			watchlist: filesForBucket(files, 'watchlist')
		};
	});

	function topReasons(file: NotebookFile) {
		return file.scholarship.match_reasons.slice(0, 3).join('; ');
	}

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

	async function saveFile(file: NotebookFile) {
		if (savedIds.includes(file.id)) return;
		notice = '';
		savedIds = [...savedIds, file.id];
		setBusy(file.id, true);

		try {
			await saveScholarship(file.id, file.scholarship.match_score, topReasons(file));
			notice = `${file.scholarship.name} moved to Watchlist.`;
		} catch (error) {
			console.error('Could not save scholarship', error);
			savedIds = savedIds.filter((id) => id !== file.id);
			notice = 'Could not save that file. The board was restored.';
		} finally {
			setBusy(file.id, false);
		}
	}

	async function unsaveFile(file: NotebookFile) {
		if (!savedIds.includes(file.id)) return;
		notice = '';
		const previousSavedIds = savedIds;
		savedIds = savedIds.filter((id) => id !== file.id);
		setBusy(file.id, true);

		try {
			await unsaveScholarship(file.id);
			notice = `${file.scholarship.name} removed from Watchlist.`;
		} catch (error) {
			console.error('Could not unsave scholarship', error);
			savedIds = previousSavedIds;
			notice = 'Could not unsave that file. The board was restored.';
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

	async function moveFile(file: NotebookFile, target: NotebookBucket) {
		if (target === file.bucket) return;

		if (target === 'watchlist') {
			await saveFile(file);
			return;
		}

		if (target === 'apply-track') {
			await trackFile(file);
			return;
		}

		if (target === 'needs-proof') {
			if (file.application) {
				notice = 'Tracked files stay in Apply Track. Stop tracking from the application ledger first.';
				laneFiles = {
					'needs-proof': filesForBucket(files, 'needs-proof'),
					'apply-track': filesForBucket(files, 'apply-track'),
					watchlist: filesForBucket(files, 'watchlist')
				};
				return;
			}

			if (file.isSaved) {
				await unsaveFile(file);
			}
		}
	}

	function handleConsider(bucket: NotebookBucket, event: CustomEvent<{ items: NotebookFile[] }>) {
		laneFiles = { ...laneFiles, [bucket]: event.detail.items };
	}

	function handleFinalize(bucket: NotebookBucket, event: CustomEvent<{ items: NotebookFile[] }>) {
		handleConsider(bucket, event);
		const moved = event.detail.items.find((file) => file.bucket !== bucket);
		if (moved) {
			void moveFile(moved, bucket);
		}
	}
</script>

<svelte:head>
	<title>Desk · ScholarAI</title>
</svelte:head>

<main class="min-h-screen overflow-x-hidden bg-[#07110d]">
	<section class="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
		<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
			<div class="border border-[#b99d62]/30 bg-[#111f18] p-5 shadow-[4px_6px_0_#4d432d] sm:p-7">
				<p class="flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">
					<Archive size={15} />
					Desk / Research board
				</p>
				<h1 class="mt-3 max-w-4xl font-[Newsreader_Variable] text-4xl font-medium leading-[0.95] tracking-[-0.04em] text-[#fff1cf] sm:text-6xl">
					Welcome back, {firstName}. Arrange the scholarship files by conviction.
				</h1>
				<p class="mt-4 max-w-2xl text-sm leading-6 text-[#9aa69d]">
					{data.total} production matches are sorted into proof, application, and watchlist lanes using your profile, saved files, application tasks, deadlines, match score, and trust score.
				</p>
			</div>

			<aside class="border border-[#b99d62]/25 bg-[#0c1812] p-5 shadow-[3px_4px_0_#4d432d]">
				<p class="font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">Ledger</p>
				<div class="mt-4 grid grid-cols-2 gap-2">
					<div class="desk-stat"><strong>{activeFiles.length}</strong><span>active</span></div>
					<div class="desk-stat"><strong>{averageReadiness(files)}%</strong><span>avg ready</span></div>
					<div class="desk-stat warn"><strong>{totalBlockers}</strong><span>blockers</span></div>
					<div class="desk-stat"><strong>{urgentFiles}</strong><span>deadlines</span></div>
				</div>
				{#if data.profileCompleteness.percent < 100}
					<a class="mt-4 block border-l-2 border-[#c1a567] bg-[#13231b] px-3 py-2 text-xs leading-5 text-[#cfc1a1]" href="/profile">
						Profile folio is {data.profileCompleteness.percent}% ready. Complete it to improve file readiness.
					</a>
				{/if}
			</aside>
		</div>

		{#if notice}
			<p class="mt-5 border-l-2 border-[#c1a567] bg-[#13231b] px-4 py-3 text-sm text-[#e5d7b8]">{notice}</p>
		{/if}

		{#if $navigating}
			<div class="mt-8 grid gap-4 lg:grid-cols-3">
				{#each Array(3) as _}
					<div class="h-72 animate-pulse border border-[#b99d62]/20 bg-[#111f18]"></div>
				{/each}
			</div>
		{:else if files.length === 0}
			<div class="mt-8 flex min-h-80 flex-col items-center justify-center border border-dashed border-[#b99d62]/30 bg-[#0c1812] p-8 text-center">
				<BookOpenCheck size={34} class="text-[#c1a567]" />
				<p class="mt-4 font-[Newsreader_Variable] text-3xl text-[#fff1cf]">No research files yet.</p>
				<p class="mt-2 max-w-sm text-sm leading-6 text-[#8d9a90]">Update the profile folio with destinations, degree goals, CGPA, field of study, and documents so matches can be assembled.</p>
				<a class="mt-5 border border-[#b99d62]/40 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#f3ead5]" href="/profile">Open Profile Folio</a>
			</div>
		{:else}
			<section class="mt-8 space-y-8">
				{#each notebookBucketMetas as bucket}
					{@const bucketFiles = laneFiles[bucket.id]}
					<div class={`research-lane lane-${bucket.id}`}>
						<div class="lane-header">
							<div>
								<p class="lane-cue">{bucket.cue}</p>
								<h2>{bucket.label}</h2>
								<p>{bucket.description}</p>
							</div>
							<div class="lane-stats" aria-label={`${bucket.label} summary`}>
								<span><strong>{bucketFiles.length.toString().padStart(2, '0')}</strong> files</span>
								<span><strong>{averageReadiness(bucketFiles)}%</strong> ready</span>
								<span><strong>{blockerCount(bucketFiles)}</strong> blockers</span>
								<span><strong>{upcomingDeadlineCount(bucketFiles)}</strong> deadlines</span>
							</div>
						</div>

						<div
							class="file-grid"
							use:dndzone={{ items: bucketFiles, type: 'production-notebook-file', flipDurationMs: 160 }}
							onconsider={(event) => handleConsider(bucket.id, event)}
							onfinalize={(event) => handleFinalize(bucket.id, event)}
						>
							{#if bucketFiles.length === 0}
								<div class="empty-lane">
									{#if bucket.id === 'needs-proof'}<FileWarning size={18} />{:else if bucket.id === 'apply-track'}<ClipboardList size={18} />{:else}<CheckCircle2 size={18} />{/if}
									<span>No files in this lane.</span>
								</div>
							{/if}
							{#each bucketFiles as file (file.id)}
								<NotebookFileCard
									{file}
									bucket={bucket.id}
									dragHandle
									busy={busyIds.has(file.id)}
									onOpen={openFile}
									onSave={saveFile}
									onUnsave={unsaveFile}
									onTrack={trackFile}
									onMove={moveFile}
								/>
							{/each}
						</div>
					</div>
				{/each}
			</section>
		{/if}
	</section>
</main>

<NotebookDossierDrawer
	bind:open={dossierOpen}
	file={selectedFile ? files.find((file) => file.id === selectedFile?.id) ?? selectedFile : null}
	busy={selectedFile ? busyIds.has(selectedFile.id) : false}
	onSave={saveFile}
	onUnsave={unsaveFile}
	onTrack={trackFile}
/>

<style>
	.desk-stat {
		border: 1px solid rgba(185, 157, 98, 0.22);
		background: rgba(7, 17, 13, 0.62);
		padding: 0.8rem;
	}

	.desk-stat strong,
	.desk-stat span {
		display: block;
	}

	.desk-stat strong {
		font: 700 1.4rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.desk-stat span {
		margin-top: 0.2rem;
		font-size: 0.58rem;
		font-weight: 850;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #87958d;
	}

	.desk-stat.warn strong {
		color: #d6a08d;
	}

	.research-lane {
		position: relative;
		overflow: hidden;
		border: 1px solid rgba(185, 157, 98, 0.28);
		background: linear-gradient(135deg, rgba(18, 37, 28, 0.96), rgba(6, 17, 13, 0.96));
		padding: 1rem;
		box-shadow: 0 22px 70px rgba(0, 0, 0, 0.24), 3px 4px 0 rgba(93, 80, 49, 0.55);
	}

	.research-lane::before {
		content: "";
		position: absolute;
		inset: 0 0 auto;
		height: 4px;
		background: #c1a567;
	}

	.lane-needs-proof::before {
		background: linear-gradient(90deg, #c7a85e, #9b6b48);
	}

	.lane-apply-track::before {
		background: linear-gradient(90deg, #d8bd73, #7d896a);
	}

	.lane-watchlist::before {
		background: linear-gradient(90deg, #8c9b7e, #5e725e);
	}

	.lane-header {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(185, 157, 98, 0.18);
		padding: 0.35rem 0.15rem 0.85rem;
	}

	@media (min-width: 900px) {
		.lane-header {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: end;
		}
	}

	.lane-cue {
		display: inline-flex;
		width: max-content;
		border: 1px solid rgba(193, 165, 103, 0.32);
		background: rgba(193, 165, 103, 0.08);
		padding: 0.32rem 0.5rem;
		font: 850 0.58rem/1 "Instrument Sans Variable", sans-serif;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: #d7bf7d;
	}

	.lane-header h2 {
		margin-top: 0.55rem;
		font: 650 clamp(2.1rem, 4vw, 4rem) / 0.86 "Newsreader Variable", serif;
		letter-spacing: -0.04em;
		color: #fff1cf;
	}

	.lane-header p:not(.lane-cue) {
		margin-top: 0.35rem;
		max-width: 44rem;
		font-size: 0.85rem;
		line-height: 1.45;
		color: #8d9a90;
	}

	.lane-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.45rem;
		min-width: min(100%, 430px);
	}

	@media (min-width: 560px) {
		.lane-stats {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	.lane-stats span {
		border: 1px solid rgba(185, 157, 98, 0.22);
		background: rgba(7, 17, 13, 0.62);
		padding: 0.65rem 0.7rem;
		color: #87958d;
		font-size: 0.56rem;
		font-weight: 850;
		text-transform: uppercase;
		letter-spacing: 0.11em;
	}

	.lane-stats strong {
		display: block;
		margin-bottom: 0.15rem;
		font: 700 1.05rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.file-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		min-height: 14rem;
		border: 1px solid rgba(185, 157, 98, 0.24);
		background:
			radial-gradient(circle at top left, rgba(193, 165, 103, 0.12), transparent 34%),
			linear-gradient(180deg, rgba(14, 26, 20, 0.88), rgba(7, 17, 13, 0.88));
		padding: 1rem;
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

	.empty-lane {
		display: flex;
		min-height: 8rem;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 1px dashed rgba(185, 157, 98, 0.3);
		color: #8d9a90;
		font-size: 0.8rem;
	}

	@media (max-width: 700px) {
		.research-lane,
		.file-grid {
			padding: 0.75rem;
		}
	}
</style>
