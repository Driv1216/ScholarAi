<script lang="ts">
	import { unsaveScholarship } from '$lib/api/saved';
	import type { ApplicationByScholarship, ScholarshipApplication } from '$lib/api/applications';
	import ApplicationTrackerControl from '$lib/components/ApplicationTrackerControl.svelte';
	import ScholarshipCard from '$lib/components/ScholarshipCard.svelte';
	import type { Scholarship } from '$lib/api/scholarships';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let scholarships = $state<Scholarship[]>([]);
	let savingIds = $state(new Set<string>());
	let applicationsByScholarship = $state<ApplicationByScholarship>({});
	let saveError = $state('');

	$effect(() => {
		scholarships = data.scholarships;
		applicationsByScholarship = data.applicationsByScholarship;
	});

	async function unsave(scholarship: Scholarship) {
		saveError = '';
		const previousScholarships = scholarships;
		const nextSavingIds = new Set(savingIds);
		nextSavingIds.add(scholarship.id);
		savingIds = nextSavingIds;
		scholarships = scholarships.filter((savedScholarship) => savedScholarship.id !== scholarship.id);

		try {
			await unsaveScholarship(scholarship.id);
		} catch (error) {
			console.error('Could not unsave scholarship', error);
			saveError = error instanceof Error ? error.message : 'Could not unsave scholarship';
			scholarships = previousScholarships;
		} finally {
			const finishedSavingIds = new Set(savingIds);
			finishedSavingIds.delete(scholarship.id);
			savingIds = finishedSavingIds;
		}
	}

	function updateApplication(application: ScholarshipApplication) {
		applicationsByScholarship = {
			...applicationsByScholarship,
			[application.scholarship_id]: application
		};
	}
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8 text-white/80">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-8">
		<div>
			<h1 class="text-xl font-semibold text-white">Saved scholarships</h1>
			<p class="mt-1 text-sm text-white/40">{scholarships.length} saved scholarships</p>
		</div>

		{#if saveError}
			<p class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
				{saveError}
			</p>
		{/if}

		{#if scholarships.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
					<svg class="h-6 w-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
				</div>
				<p class="mb-1 text-sm font-medium text-white/60">No saved scholarships yet</p>
				<p class="max-w-xs text-xs text-white/30">Bookmark scholarships from your dashboard to find them here.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each scholarships as scholarship}
					<ScholarshipCard {scholarship}>
						{#snippet secondaryActions()}
							<button
								class="rounded-lg p-2 text-indigo-400 transition-colors hover:bg-white/[0.05] hover:text-indigo-300"
								type="button"
								aria-label="Unsave scholarship"
								title="Unsave scholarship"
								disabled={savingIds.has(scholarship.id)}
								onclick={() => unsave(scholarship)}
							>
								<svg
									class="h-5 w-5 fill-current"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
								</svg>
							</button>
							<ApplicationTrackerControl
								userId={data.user.id}
								scholarshipId={scholarship.id}
								application={applicationsByScholarship[scholarship.id] ?? null}
								onChange={updateApplication}
							/>
						{/snippet}
					</ScholarshipCard>
				{/each}
			</div>
		{/if}
	</section>
</main>
