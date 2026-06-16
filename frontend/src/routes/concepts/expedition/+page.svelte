<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import { Award, Check, ChevronRight, Compass, Flame, LockKeyhole, MapPinned, Sparkles } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { applications, readinessMilestones, scholarshipById, scholarships } from '$lib/concepts/data';

	let completed = $state<string[]>(['identity']);
	let selectedId = $state('daad');
	let detailOpen = $state(false);
	const xp = $derived(readinessMilestones.filter((milestone) => completed.includes(milestone.id)).reduce((total, milestone) => total + milestone.xp, 240));
	const selected = $derived(scholarshipById(selectedId));
	const missions = $derived(applications.flatMap((application) => application.tasks).filter((task) => !task.done).slice(0, 3));

	function complete(id: string) {
		if (!completed.includes(id)) completed = [...completed, id];
	}
</script>

<svelte:head><title>Readiness Expedition · ScholarAI Concepts</title></svelte:head>
<div class="min-h-screen overflow-x-hidden bg-[#14231d] pb-28 font-[Instrument_Sans_Variable] text-[#f3ead5]">
	<header class="border-b border-[#e9d8ad]/15 px-5 py-6 md:px-8">
		<div class="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-5">
			<div><p class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#c2a970]">Concept 11 · Guided readiness</p><h1 class="mt-2 font-[Newsreader] text-4xl leading-none">Readiness Expedition</h1></div>
			<div class="flex gap-2 text-xs"><span class="flex items-center gap-2 rounded-full border border-[#e9d8ad]/20 px-4 py-2"><Flame size={14} class="text-[#e5a84b]"/> 8 day rhythm</span><span class="rounded-full bg-[#d9bf7d] px-4 py-2 font-bold text-[#17231e]">Level 4 · {xp} XP</span></div>
		</div>
	</header>

	<main class="mx-auto grid max-w-[1480px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
		<section class="relative overflow-hidden rounded-[32px] border border-[#e9d8ad]/15 bg-[#1b3027] p-5 md:p-8">
			<div class="absolute inset-0 opacity-20" style="background-image:radial-gradient(#e9d8ad 1px,transparent 1px);background-size:30px 30px"></div>
			<div class="relative flex flex-wrap items-end justify-between gap-4 border-b border-[#e9d8ad]/15 pb-6">
				<div><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d9bf7d]"><Compass size={15}/> Current expedition</p><h2 class="mt-3 max-w-xl font-[Newsreader] text-4xl leading-[1.02] md:text-5xl">Build a profile that opens better routes.</h2></div>
				<div class="max-w-xs text-xs leading-5 text-[#bcb39f]">The path stays sequential where order matters. Optional challenge routes reveal upside without blocking progress.</div>
			</div>
			<div class="relative mx-auto mt-8 max-w-3xl">
				<div class="absolute bottom-10 left-6 top-10 w-px bg-[#d9bf7d]/25 md:left-1/2"></div>
				{#each readinessMilestones as milestone, index}
					{@const done = completed.includes(milestone.id)}
					<div class={`relative mb-6 flex md:w-[calc(50%+24px)] ${index % 2 ? 'md:ml-[calc(50%-24px)] md:flex-row' : 'md:flex-row-reverse'} gap-4`}>
						<button onclick={() => milestone.status !== 'locked' && complete(milestone.id)} disabled={milestone.status === 'locked'} aria-label={`Complete ${milestone.title}`} class={`relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-4 border-[#1b3027] ${done ? 'bg-[#d9bf7d] text-[#17231e]' : milestone.status === 'locked' ? 'bg-[#263c32] text-[#756f61]' : 'bg-[#e7eee9] text-[#214133]'}`}>
							{#if done}<Check size={18}/>{:else if milestone.status === 'locked'}<LockKeyhole size={16}/>{:else if milestone.status === 'optional'}<Sparkles size={16}/>{:else}<MapPinned size={17}/>{/if}
						</button>
						<div class={`min-w-0 flex-1 rounded-2xl border p-4 ${done ? 'border-[#d9bf7d]/30 bg-[#d9bf7d]/10' : 'border-[#e9d8ad]/12 bg-[#13271f]/75'}`}>
							<div class="flex items-start justify-between gap-3"><div><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#b69e69]">{done ? 'Completed' : milestone.status} · +{milestone.xp} XP</p><h3 class="mt-2 font-[Newsreader] text-2xl leading-none">{milestone.title}</h3></div></div>
							<p class="mt-3 text-xs leading-5 text-[#ada797]">{milestone.detail}</p><p class="mt-3 text-[10px] uppercase tracking-wider text-[#d9bf7d]">Unlocks: {milestone.unlock}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<aside class="space-y-5">
			<section class="rounded-[26px] bg-[#f0e5c8] p-5 text-[#203129]">
				<p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#866d39]">Next recommended action</p>
				<h2 class="mt-3 font-[Newsreader] text-3xl leading-none">Brief Professor Mehta.</h2><p class="mt-3 text-sm leading-6 text-[#59645c]">One reusable reference brief strengthens three serious routes.</p>
				<button onclick={() => complete('references')} class="mt-5 flex w-full items-center justify-between rounded-xl bg-[#203129] px-4 py-3 text-sm font-bold text-white">Complete mission <ChevronRight size={16}/></button>
			</section>
			<section class="rounded-[24px] border border-[#e9d8ad]/15 p-5"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#d9bf7d]"><Award size={15}/> Daily missions</p><div class="mt-4 space-y-2">{#each missions as mission}<button onclick={() => complete(mission.id)} class="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left text-sm hover:bg-white/10"><span class="size-2 rounded-full bg-[#d9bf7d]"></span>{mission.title}</button>{/each}</div></section>
			<section class="rounded-[24px] border border-[#e9d8ad]/15 p-5"><p class="text-xs font-bold uppercase tracking-[0.15em] text-[#d9bf7d]">Newly reachable routes</p><div class="mt-4 space-y-2">{#each scholarships.slice(0,3) as scholarship}<button onclick={() => { selectedId = scholarship.id; detailOpen = true; }} class="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left"><span class="text-sm">{scholarship.name}</span><span class="text-xs text-[#d9bf7d]">{scholarship.match}%</span></button>{/each}</div></section>
			<Scorecard concept="expedition" compact />
		</aside>
	</main>
</div>
<DetailDrawer scholarship={selected} bind:open={detailOpen} theme="dark"/>
<ConceptNav current="expedition"/>
