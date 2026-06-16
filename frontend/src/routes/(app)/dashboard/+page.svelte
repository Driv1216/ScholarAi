<script lang="ts">
	import { navigating } from '$app/stores';
	import { saveScholarship, unsaveScholarship } from '$lib/api/saved';
	import type { ApplicationByScholarship, ScholarshipApplication } from '$lib/api/applications';
	import ApplicationTrackerControl from '$lib/components/ApplicationTrackerControl.svelte';
	import ScholarshipCard from '$lib/components/ScholarshipCard.svelte';
	import type { Scholarship } from '$lib/api/scholarships';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let savedIds = $state(new Set<string>());
	let savingIds = $state(new Set<string>());
	let applicationsByScholarship = $state<ApplicationByScholarship>({});
	let saveError = $state('');
	const firstName = $derived((data.fullName ?? data.user.email ?? 'there').split(' ')[0]);

	$effect(() => {
		savedIds = new Set(data.savedIds);
		applicationsByScholarship = data.applicationsByScholarship;
	});

	function topReasons(scholarship: Scholarship) {
		return scholarship.match_reasons.slice(0, 3);
	}

	function isSaved(scholarshipId: string) {
		return savedIds.has(scholarshipId);
	}

	function isSaving(scholarshipId: string) {
		return savingIds.has(scholarshipId);
	}

	async function toggleSaved(scholarship: Scholarship) {
		saveError = '';
		const wasSaved = isSaved(scholarship.id);
		const nextSavedIds = new Set(savedIds);
		const nextSavingIds = new Set(savingIds);

		if (wasSaved) {
			nextSavedIds.delete(scholarship.id);
		} else {
			nextSavedIds.add(scholarship.id);
		}
		nextSavingIds.add(scholarship.id);
		savedIds = nextSavedIds;
		savingIds = nextSavingIds;

		try {
			if (wasSaved) {
				await unsaveScholarship(scholarship.id);
			} else {
				await saveScholarship(
					scholarship.id,
					scholarship.match_score,
					topReasons(scholarship).join('; ')
				);
			}
		} catch (error) {
			console.error('Could not update saved scholarship', error);
			saveError = error instanceof Error ? error.message : 'Could not update saved scholarship';
			const revertedSavedIds = new Set(savedIds);
			if (wasSaved) {
				revertedSavedIds.add(scholarship.id);
			} else {
				revertedSavedIds.delete(scholarship.id);
			}
			savedIds = revertedSavedIds;
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

<main class="min-h-screen bg-[#0d0f14]">
	<div class="mx-auto max-w-6xl px-5 pb-6 pt-8 sm:px-6 sm:pt-10">
		<div class="flex items-start justify-between">
			<div>
				<p class="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">Your matches</p>
				<h1 class="text-2xl font-medium tracking-[-0.025em] text-white">Welcome back, {firstName}</h1>
				<p class="mt-2 text-sm text-white/40">
					{data.total} scholarships matched to your profile
				</p>
			</div>
		</div>
	</div>

	{#if data.profileCompleteness.percent < 100}
		<div class="mx-auto mb-6 max-w-6xl px-5 sm:px-6">
			<div
				class="flex flex-col gap-4 border-y border-white/[0.07] py-4 sm:flex-row sm:items-center"
			>
				<div class="flex-1">
					<div class="mb-2 flex flex-wrap items-center gap-2">
						<span class="text-sm font-medium text-white">
							Profile {data.profileCompleteness.percent}% complete
						</span>
						<span class="text-xs text-white/40">— Better matches with a complete profile</span>
					</div>
					<div class="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
						<div
							class="h-full rounded-full bg-indigo-500 transition-all duration-500"
							style={`width: ${data.profileCompleteness.percent}%`}
						></div>
					</div>
				</div>
				<a
					href="/profile"
					class="shrink-0 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
				>
					Complete profile →
				</a>
			</div>
		</div>
	{/if}

	<div class="mx-auto max-w-6xl px-5 pb-12 sm:px-6">
		{#if saveError}
			<p class="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
				{saveError}
			</p>
		{/if}

		{#if $navigating}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(6) as _}
					<div class="animate-pulse rounded-xl border border-white/[0.07] bg-[#1a1d27] p-5">
						<div class="mb-4 flex items-start justify-between">
							<div class="flex-1 space-y-2">
								<div class="h-4 w-3/4 rounded bg-white/[0.06]"></div>
								<div class="h-3 w-1/2 rounded bg-white/[0.04]"></div>
							</div>
							<div class="h-6 w-16 rounded-full bg-white/[0.06]"></div>
						</div>
						<div class="mb-4 flex gap-2">
							<div class="h-6 w-20 rounded-full bg-white/[0.06]"></div>
							<div class="h-6 w-16 rounded-full bg-white/[0.06]"></div>
							<div class="h-6 w-20 rounded-full bg-white/[0.06]"></div>
						</div>
						<div class="mb-4 space-y-2">
							<div class="h-3 w-1/4 rounded bg-white/[0.04]"></div>
							<div class="h-3 w-full rounded bg-white/[0.06]"></div>
						</div>
						<div class="mb-4 h-px bg-white/[0.05]"></div>
						<div class="flex justify-between">
							<div class="h-8 w-16 rounded-lg bg-white/[0.04]"></div>
							<div class="h-8 w-28 rounded-lg bg-indigo-500/20"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if data.scholarships.length === 0}
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04]">
					<svg class="h-6 w-6 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
				</div>
				<p class="mb-1 text-sm font-medium text-white/60">No scholarships yet</p>
				<p class="max-w-xs text-xs text-white/30">Update your profile with target countries, degree goals, CGPA, and field of study.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each data.scholarships as scholarship}
					<ScholarshipCard {scholarship}>
						{#snippet secondaryActions()}
							<button
								class={`rounded-lg p-2 transition-colors hover:bg-white/[0.05] hover:text-white/80 ${
									isSaved(scholarship.id) ? 'text-indigo-400' : 'text-white/40'
								}`}
								type="button"
								aria-label={isSaved(scholarship.id) ? 'Unsave scholarship' : 'Save scholarship'}
								title={isSaved(scholarship.id) ? 'Remove bookmark' : 'Save scholarship'}
								disabled={isSaving(scholarship.id)}
								onclick={() => toggleSaved(scholarship)}
							>
								<svg
									class={`h-5 w-5 ${isSaved(scholarship.id) ? 'fill-current' : 'fill-none'}`}
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
	</div>
</main>
