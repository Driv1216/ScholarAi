<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Scholarship } from '$lib/api/scholarships';
	import { formatDeadline, getDeadlineStatus } from '$lib/utils/deadline';

	let {
		scholarship,
		secondaryActions
	}: {
		scholarship: Scholarship;
		secondaryActions: Snippet;
	} = $props();

	const deadlineStatus = $derived(getDeadlineStatus(scholarship.deadline));
	const deadlineText = $derived(formatDeadline(scholarship.deadline));
	const topReasons = $derived(scholarship.match_reasons.slice(0, 3));

	function formatDegree(value: string | null) {
		if (!value) return 'Any degree';
		if (value.toLowerCase() === 'phd') return 'PhD';
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

</script>

<article
	class="group relative flex flex-col rounded-xl border border-white/[0.07] bg-[#171a22] transition-colors hover:border-white/[0.13]"
>
	<div class="flex flex-1 flex-col gap-5 p-5">
		<div class="flex items-start justify-between gap-4">
			<div class="min-w-0">
				<p class="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">
					{scholarship.country ?? 'Global'} · {formatDegree(scholarship.degree_level)}
				</p>
				<h3 class="text-[15px] font-semibold leading-snug text-white/95">{scholarship.name}</h3>
				<p class="mt-1 text-xs font-normal text-white/40">{scholarship.provider}</p>
			</div>
			<div class="shrink-0 text-right">
				<p class="font-mono text-sm font-medium text-indigo-300">{scholarship.match_score}%</p>
				<p class="mt-0.5 text-[10px] uppercase tracking-wider text-white/25">match</p>
			</div>
		</div>

		<div class="grid grid-cols-2 border-y border-white/[0.06]">
			<div class="border-r border-white/[0.06] py-3 pr-3">
				<p class="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">Award</p>
				<p class="text-sm leading-snug text-white/75">{scholarship.award_amount ?? 'Not listed'}</p>
			</div>
			<div class="py-3 pl-3">
				<p class="mb-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">Deadline</p>
				<p class={`text-sm ${deadlineStatus === 'urgent' ? 'font-medium text-red-400' : deadlineStatus === 'expired' ? 'text-white/30 line-through' : 'text-white/75'}`}>
					{deadlineText}
				</p>
			</div>
		</div>

		{#if topReasons.length > 0}
			<div>
				<p class="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/30">Why it matches</p>
				<ul class="flex flex-col gap-1.5">
					{#each topReasons.slice(0, 2) as reason}
						<li class="flex items-start gap-2 text-xs leading-5 text-white/50">
							<span class="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-indigo-400"></span>
							{reason}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="mt-auto flex items-center gap-2 text-[11px] text-white/30">
			<span>Trust score {scholarship.trust_score}</span>
			{#if deadlineStatus === 'urgent'}<span class="text-red-400">Closing soon</span>{/if}
			{#if deadlineStatus === 'expired'}<span>Closed</span>{/if}
		</div>
	</div>

	<div class="flex items-center justify-between gap-3 border-t border-white/[0.06] px-3 py-3 pl-4">
		<div class="flex min-w-0 items-center gap-1">
			{@render secondaryActions()}
		</div>
		<a
			href={scholarship.application_url ?? scholarship.official_url}
			target="_blank"
			rel="noreferrer"
			class="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-[#111318] transition-colors hover:bg-white/85"
		>
			View & Apply
			<svg
				class="h-3.5 w-3.5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</a>
	</div>
</article>
