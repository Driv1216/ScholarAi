<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	interface AdminStats {
		total: number;
		verified: number;
		pending: number;
		expired: number;
	}

	let stats = $state<AdminStats>({
		total: 0,
		verified: 0,
		pending: 0,
		expired: 0
	});
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		try {
			const response = await fetch(new URL('/admin/stats', PUBLIC_BACKEND_URL));
			if (!response.ok) {
				throw new Error(`Could not load admin stats: ${response.status}`);
			}
			stats = (await response.json()) as AdminStats;
		} catch (statsError) {
			error = statsError instanceof Error ? statsError.message : 'Could not load admin stats';
		} finally {
			loading = false;
		}
	});
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-8">
		<div>
			<h1 class="text-xl font-semibold text-white">Admin dashboard</h1>
			<p class="mt-1 text-sm text-white/40">Manage scholarship records and review status.</p>
		</div>

		{#if error}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
		{/if}

		<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
				<p class="mb-2 text-[11px] uppercase tracking-wider text-white/40">Total scholarships</p>
				<p class="text-2xl font-semibold text-white">{loading ? '-' : stats.total}</p>
			</div>
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
				<p class="mb-2 text-[11px] uppercase tracking-wider text-white/40">Verified</p>
				<p class="text-2xl font-semibold text-emerald-400">{loading ? '-' : stats.verified}</p>
			</div>
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
				<p class="mb-2 text-[11px] uppercase tracking-wider text-white/40">Pending review</p>
				<p class="text-2xl font-semibold text-amber-400">{loading ? '-' : stats.pending}</p>
			</div>
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-4">
				<p class="mb-2 text-[11px] uppercase tracking-wider text-white/40">Expired</p>
				<p class="text-2xl font-semibold text-red-400">{loading ? '-' : stats.expired}</p>
			</div>
		</div>

		<div class="grid gap-5 md:grid-cols-2">
			<a class="group rounded-xl border border-white/[0.07] bg-[#1a1d27] p-5 transition-colors hover:border-indigo-500/30" href="/admin/scholarships/new">
				<div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
				</div>
				<h2 class="mb-1 text-sm font-semibold text-white">Add scholarship</h2>
				<p class="text-xs leading-relaxed text-white/40">Create a new scholarship record with criteria and verification status.</p>
			</a>
			<a class="group rounded-xl border border-white/[0.07] bg-[#1a1d27] p-5 transition-colors hover:border-indigo-500/30" href="/admin/scholarships">
				<div class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors group-hover:bg-indigo-500/20">
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
				</div>
				<h2 class="mb-1 text-sm font-semibold text-white">View all scholarships</h2>
				<p class="text-xs leading-relaxed text-white/40">Review, verify, edit, or delete existing scholarship records.</p>
			</a>
		</div>
	</section>
</main>
