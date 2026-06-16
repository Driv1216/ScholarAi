<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { fly } from 'svelte/transition';
	import { format, parseISO } from 'date-fns';
	import { ArrowLeft, ArrowRight, CircleCheck, Clock3, Eye, Layers3, Minus, ShieldCheck, X } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { applications, scholarships, type ConceptScholarship } from '$lib/concepts/data';

	let index = $state(0);
	let decisions = $state<Record<string, 'shortlist' | 'later' | 'pass'>>({});
	let drawerOpen = $state(false);
	let selected = $state<ConceptScholarship>(scholarships[0]);
	const current = $derived(scholarships[index]);

	function move(amount: number) {
		index = Math.max(0, Math.min(scholarships.length - 1, index + amount));
	}

	function decide(decision: 'shortlist' | 'later' | 'pass') {
		decisions = { ...decisions, [current.id]: decision };
		if (index < scholarships.length - 1) move(1);
	}

	function inspect() {
		selected = current;
		drawerOpen = true;
	}
</script>

<svelte:head><title>Guided Triage · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen bg-[#f5f3f8] pb-28 font-[Instrument_Sans_Variable] text-[#211d2b]">
	<header class="px-5 py-5 md:px-8">
		<div class="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
			<div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#6c54a2]">Concept 05 · One decision at a time</p><h1 class="mt-1 text-xl font-semibold">Guided Triage</h1></div>
			<div class="flex items-center gap-3"><span class="text-sm text-[#756f80]">{index + 1} of {scholarships.length}</span><div class="h-1.5 w-28 overflow-hidden rounded-full bg-[#ded9e8]"><div class="h-full rounded-full bg-[#7656ba] transition-all" style={`width: ${((index + 1) / scholarships.length) * 100}%`}></div></div></div>
		</div>
	</header>

	<main class="mx-auto grid max-w-[1450px] gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
		<section class="flex min-h-[720px] flex-col rounded-[32px] border border-[#d9d3e4] bg-white p-5 shadow-[0_28px_90px_rgba(57,42,87,0.1)] md:p-9">
			<div class="flex items-center justify-between">
				<button onclick={() => move(-1)} disabled={index === 0} class="grid size-10 place-items-center rounded-full border border-[#ddd7e7] disabled:opacity-30"><ArrowLeft size={18} /></button>
				<p class="rounded-full bg-[#f0ecf7] px-4 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#71579e]">Make one clear call</p>
				<button onclick={() => move(1)} disabled={index === scholarships.length - 1} class="grid size-10 place-items-center rounded-full border border-[#ddd7e7] disabled:opacity-30"><ArrowRight size={18} /></button>
			</div>

			{#key current.id}
				<div in:fly={{ x: 24, duration: 180 }} class="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-10">
					<div class="flex flex-wrap gap-2">
						<span class="rounded-full bg-[#e9f6ee] px-3 py-1.5 text-xs font-bold text-[#31744d]">{current.match}% profile match</span>
						<span class="rounded-full bg-[#f4f0f8] px-3 py-1.5 text-xs font-bold text-[#725b96]">{current.trust}% evidence confidence</span>
						{#if decisions[current.id]}<span class="rounded-full bg-[#fff3cf] px-3 py-1.5 text-xs font-bold capitalize text-[#8b6820]">Marked {decisions[current.id]}</span>{/if}
					</div>
					<h2 class="mt-6 max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">{current.name}</h2>
					<p class="mt-5 max-w-3xl text-lg leading-relaxed text-[#6a6473]">{current.summary}</p>

					<div class="mt-9 grid gap-3 sm:grid-cols-3">
						<div class="rounded-2xl border border-[#e2dde9] p-4"><p class="text-xs font-bold uppercase tracking-[0.13em] text-[#8a8393]">Award</p><p class="mt-2 text-lg font-semibold">{current.award}</p></div>
						<div class="rounded-2xl border border-[#e2dde9] p-4"><p class="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.13em] text-[#8a8393]"><Clock3 size={13} /> Effort</p><p class="mt-2 text-lg font-semibold">{current.effort}</p></div>
						<div class="rounded-2xl border border-[#e2dde9] p-4"><p class="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.13em] text-[#8a8393]"><ShieldCheck size={13} /> Deadline</p><p class="mt-2 text-lg font-semibold">{format(parseISO(current.deadline), 'MMM d, yyyy')}</p></div>
					</div>

					<div class="mt-4 grid gap-3 md:grid-cols-2">
						<div class="rounded-2xl bg-[#edf8f1] p-4"><p class="text-xs font-bold uppercase tracking-[0.13em] text-[#3c7a55]">Why it deserves attention</p><p class="mt-2 text-sm leading-relaxed text-[#405e4b]">{current.evidence.find((item) => item.state === 'pass')?.detail}</p></div>
						<div class="rounded-2xl bg-[#fff5e8] p-4"><p class="text-xs font-bold uppercase tracking-[0.13em] text-[#98652f]">What could stop it</p><p class="mt-2 text-sm leading-relaxed text-[#73583d]">{current.evidence.find((item) => item.state === 'concern')?.detail ?? 'No blocking concern recorded yet.'}</p></div>
					</div>

					<div class="mt-8 grid gap-3 sm:grid-cols-3">
						<button onclick={() => decide('pass')} class="flex items-center justify-center gap-2 rounded-2xl border border-[#ded8e5] px-5 py-4 font-semibold transition hover:bg-[#f5f2f7]"><X size={17} /> Pass</button>
						<button onclick={() => decide('later')} class="flex items-center justify-center gap-2 rounded-2xl border border-[#ded8e5] px-5 py-4 font-semibold transition hover:bg-[#f5f2f7]"><Minus size={17} /> Decide later</button>
						<button onclick={() => decide('shortlist')} class="flex items-center justify-center gap-2 rounded-2xl bg-[#6b49ad] px-5 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(107,73,173,0.24)] transition hover:bg-[#593b93]"><CircleCheck size={17} /> Shortlist</button>
					</div>
					<button onclick={inspect} class="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-[#70569e]"><Eye size={16} /> Inspect all evidence</button>
				</div>
			{/key}
		</section>

		<aside class="space-y-5">
			<section class="rounded-[24px] bg-[#292237] p-5 text-white">
				<div class="flex items-center gap-2 text-[#c9b9e8]"><Layers3 size={16} /><h2 class="text-xs font-bold uppercase tracking-[0.15em]">Execution stays visible</h2></div>
				<div class="mt-4 space-y-3">
					{#each applications as app}
						<div class="rounded-xl bg-white/7 p-3">
							<div class="flex items-start justify-between gap-3"><p class="text-sm font-semibold">{scholarships.find((scholarship) => scholarship.id === app.scholarshipId)?.name}</p><span class="text-xs font-bold text-[#c7b0f4]">{Math.round((app.tasks.filter((task) => task.done).length / app.tasks.length) * 100)}%</span></div>
							<p class="mt-2 text-xs text-[#bdb5c8]">{app.status} · {app.tasks.filter((task) => !task.done).length} open tasks</p>
							<div class="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-[#b492f0]" style={`width: ${(app.tasks.filter((task) => task.done).length / app.tasks.length) * 100}%`}></div></div>
						</div>
					{/each}
				</div>
			</section>
			<Scorecard concept="triage" compact />
		</aside>
	</main>
</div>

<ConceptNav current="triage" />
<DetailDrawer scholarship={selected} bind:open={drawerOpen} />
