<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { format, parseISO } from 'date-fns';
	import { ArrowRight, CircleAlert, Map, MapPin, Plane, Route, SlidersHorizontal } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { applications, opportunityContext, scholarshipById, scholarships } from '$lib/concepts/data';

	let selectedId = $state('daad');
	let fundingFilter = $state<'all' | 'full'>('all');
	let detailOpen = $state(false);
	const visible = $derived(scholarships.filter((item) => fundingFilter === 'all' || opportunityContext[item.id].coverage === 100));
	const selected = $derived(scholarshipById(selectedId));
	const context = $derived(opportunityContext[selectedId]);
	const application = $derived(applications.find((item) => item.scholarshipId === selectedId));
</script>

<svelte:head><title>Opportunity Atlas · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen overflow-x-hidden bg-[#07191c] pb-28 font-[Instrument_Sans_Variable] text-[#dff8f4]">
	<header class="border-b border-[#8ef1df]/15 px-5 py-5 md:px-8">
		<div class="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4">
			<div><p class="text-xs font-bold uppercase tracking-[0.22em] text-[#51cab8]">Concept 06 · Destination intelligence</p><h1 class="mt-2 text-3xl font-semibold tracking-[-0.05em]">Opportunity Atlas</h1></div>
			<div class="flex rounded-full border border-white/10 p-1 text-xs">
				<button onclick={() => fundingFilter = 'all'} class:!bg-[#52d6c0]={fundingFilter === 'all'} class:!text-[#061719]={fundingFilter === 'all'} class="rounded-full px-4 py-2">All routes</button>
				<button onclick={() => fundingFilter = 'full'} class:!bg-[#52d6c0]={fundingFilter === 'full'} class:!text-[#061719]={fundingFilter === 'full'} class="rounded-full px-4 py-2">Full coverage</button>
			</div>
		</div>
	</header>

	<main class="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
		<section class="relative min-h-[650px] overflow-hidden rounded-[30px] border border-[#8ef1df]/15 bg-[#0b2427]">
			<div class="absolute inset-0 opacity-20" style="background-image:radial-gradient(#86e6d6 1px,transparent 1px);background-size:24px 24px"></div>
			<div class="relative flex items-center justify-between p-5"><div class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#7edbcd]"><Map size={16}/> Live route field</div><SlidersHorizontal size={17} class="text-white/40"/></div>
			<svg viewBox="0 0 100 58" class="relative mt-4 h-[430px] w-full" role="img" aria-labelledby="atlas-title atlas-desc">
				<title id="atlas-title">Scholarship destination map</title>
				<desc id="atlas-desc">Interactive destination points for six scholarship opportunities. The structured list below offers the same controls.</desc>
				<path d="M5 21 Q18 8 34 15 T58 14 T91 20 L94 39 Q76 47 62 41 T30 45 T6 35 Z" fill="#123c3f" stroke="#5dc9bb" stroke-opacity=".25"/>
				<path d="M78 52 C70 42 57 36 52 34" fill="none" stroke="#52d6c0" stroke-dasharray="1 1.5" stroke-width=".45"/>
				{#each visible as item}
					{@const point = opportunityContext[item.id].coordinates}
					<g role="button" tabindex="0" aria-label={`${item.name}, ${item.country}, ${item.match}% match`} onkeydown={(event) => event.key === 'Enter' && (selectedId = item.id)} onclick={() => selectedId = item.id} class="cursor-pointer">
						{#if selectedId === item.id}<circle cx={point.x} cy={point.y} r="4" fill="none" stroke="#fff" stroke-opacity=".3"/>{/if}
						<circle cx={point.x} cy={point.y} r={selectedId === item.id ? 2.4 : 1.7} fill={selectedId === item.id ? '#ffffff' : '#52d6c0'} />
						<text x={point.x + 3} y={point.y + .8} fill="#dff8f4" font-size="2.2">{item.country}</text>
					</g>
				{/each}
			</svg>
			<div class="relative grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-3">
				{#each visible.slice(0,3) as item}
					<button onclick={() => selectedId = item.id} class="bg-[#0b2427] p-4 text-left hover:bg-[#103034]"><p class="text-xs font-semibold">{item.name}</p><p class="mt-2 text-[11px] text-[#81a8a3]">{opportunityContext[item.id].route.join(' → ')}</p></button>
				{/each}
			</div>
		</section>

		<aside class="space-y-5">
			<section class="rounded-[26px] bg-[#e3fff9] p-5 text-[#092326]">
				<div class="flex items-start justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#328b7f]">Selected route</p><h2 class="mt-3 text-2xl font-semibold leading-tight">{selected.name}</h2></div><div class="grid size-11 place-items-center rounded-full bg-[#bcefe6]"><MapPin size={19}/></div></div>
				<div class="mt-5 flex items-center gap-3 rounded-2xl bg-white/65 p-4"><Plane size={18}/><p class="text-sm font-semibold">{context.route.join(' → ')}</p></div>
				<div class="mt-4 grid grid-cols-3 gap-2 text-center"><div class="rounded-xl bg-[#c9f3eb] p-3"><p class="text-lg font-bold">{selected.match}%</p><p class="text-[10px] uppercase opacity-55">Match</p></div><div class="rounded-xl bg-[#c9f3eb] p-3"><p class="text-lg font-bold">{context.coverage}%</p><p class="text-[10px] uppercase opacity-55">Coverage</p></div><div class="rounded-xl bg-[#c9f3eb] p-3"><p class="text-lg font-bold">{context.hours}h</p><p class="text-[10px] uppercase opacity-55">Effort</p></div></div>
				<button onclick={() => detailOpen = true} class="mt-5 flex w-full items-center justify-between rounded-xl bg-[#092326] px-4 py-3 text-sm font-semibold text-white">Inspect route evidence <ArrowRight size={16}/></button>
			</section>
			<section class="rounded-[24px] border border-white/10 p-5">
				<p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#62cdbc]"><Route size={15}/> Route plan</p>
				<p class="mt-4 text-sm text-white/45">{format(parseISO(selected.deadline), 'MMM d, yyyy')} deadline · {context.risk} route risk</p>
				<div class="mt-4 space-y-2">{#each context.dependencies as dependency}<div class="flex items-start gap-2 rounded-xl bg-white/5 p-3 text-sm"><CircleAlert size={14} class="mt-0.5 shrink-0 text-[#f1bb70]"/><span>{dependency}</span></div>{/each}</div>
				{#if application}<p class="mt-4 text-xs text-white/45">{application.tasks.filter((task) => !task.done).length} application tasks already open.</p>{/if}
			</section>
			<Scorecard concept="atlas" compact />
		</aside>
	</main>
</div>

<DetailDrawer scholarship={selected} bind:open={detailOpen} theme="dark"/>
<ConceptNav current="atlas"/>
