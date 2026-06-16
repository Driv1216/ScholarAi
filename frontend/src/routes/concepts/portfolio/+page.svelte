<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { BarChart } from 'layerchart';
	import { ArrowUpRight, BriefcaseBusiness, Calculator, Clock3, Gauge, RotateCcw } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { opportunityContext, scholarshipById, scholarships } from '$lib/concepts/data';

	let hours = $state<Record<string, number>>({ daad: 8, chevening: 4, vector: 8, erasmus: 2, 'women-techmakers': 2, commonwealth: 0 });
	let scenario = $state<'balanced' | 'upside' | 'confidence'>('balanced');
	let detailId = $state('vector');
	let detailOpen = $state(false);
	const totalHours = $derived(Object.values(hours).reduce((sum, value) => sum + value, 0));
	const chartData = $derived(scholarships.map((item) => ({ name:item.id, value: Math.round((opportunityContext[item.id].awardValue * opportunityContext[item.id].probability / 100) / 1000) })));
	const expectedValue = $derived(scholarships.reduce((sum, item) => sum + (hours[item.id] > 0 ? opportunityContext[item.id].awardValue * opportunityContext[item.id].probability / 100 : 0), 0));

	function applyScenario(next: typeof scenario) {
		scenario = next;
		hours = next === 'upside' ? { daad:6,chevening:8,vector:4,erasmus:4,'women-techmakers':0,commonwealth:2 } : next === 'confidence' ? { daad:8,chevening:2,vector:10,erasmus:0,'women-techmakers':4,commonwealth:0 } : { daad:8,chevening:4,vector:8,erasmus:2,'women-techmakers':2,commonwealth:0 };
	}
</script>

<svelte:head><title>Funding Portfolio · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen bg-[#eef2fb] pb-28 font-[Instrument_Sans_Variable] text-[#111c37]">
	<header class="border-b border-[#cbd5ea] bg-white px-5 py-4 md:px-8"><div class="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#4869ca]">Concept 09 · Allocate scarce effort</p><h1 class="mt-1 text-3xl font-semibold tracking-[-0.05em]">Funding Portfolio</h1></div><div class="flex gap-2">{#each ['balanced','upside','confidence'] as item}<button onclick={() => applyScenario(item as typeof scenario)} class:!bg-[#183b9b]={scenario===item} class:!text-white={scenario===item} class="rounded-full border border-[#c8d3ea] bg-white px-4 py-2 text-xs font-semibold capitalize">{item}</button>{/each}</div></div></header>

	<main class="mx-auto max-w-[1500px] px-4 py-5 md:px-8">
		<section class="grid gap-4 lg:grid-cols-4">
			<div class="rounded-[22px] bg-[#173991] p-5 text-white"><Clock3 size={17} class="text-[#9cb8ff]"/><p class="mt-4 text-3xl font-semibold">{totalHours}<span class="text-base text-white/50"> / 24h</span></p><p class="mt-1 text-xs text-white/50">Weekly capacity allocated</p></div>
			<div class="rounded-[22px] bg-white p-5"><Calculator size={17} class="text-[#4869ca]"/><p class="mt-4 text-3xl font-semibold">${Math.round(expectedValue/1000)}k</p><p class="mt-1 text-xs text-[#73809c]">Probability-adjusted funding</p></div>
			<div class="rounded-[22px] bg-white p-5"><Gauge size={17} class="text-[#4869ca]"/><p class="mt-4 text-3xl font-semibold">{scholarships.filter((item) => hours[item.id] > 0).length}</p><p class="mt-1 text-xs text-[#73809c]">Active bets</p></div>
			<div class="rounded-[22px] bg-[#dce5fa] p-5"><BriefcaseBusiness size={17} class="text-[#4869ca]"/><p class="mt-4 text-lg font-semibold">Vector + DAAD</p><p class="mt-1 text-xs text-[#73809c]">Recommended core portfolio</p></div>
		</section>

		<section class="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
			<div class="rounded-[26px] border border-[#cbd5ea] bg-white p-5">
				<div class="flex items-end justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.15em] text-[#7180a1]">Allocation board</p><h2 class="mt-2 text-2xl font-semibold">Where should this week go?</h2></div><button onclick={() => applyScenario('balanced')} class="flex items-center gap-2 text-xs font-semibold text-[#4869ca]"><RotateCcw size={14}/> Reset</button></div>
				<div class="mt-6 divide-y divide-[#e2e8f5]">{#each scholarships as item}<div class="grid gap-4 py-5 md:grid-cols-[1fr_260px_80px] md:items-center"><button onclick={() => {detailId=item.id;detailOpen=true}} class="text-left"><p class="font-semibold">{item.name}</p><p class="mt-1 text-xs text-[#76829b]">{opportunityContext[item.id].probability}% probability · ${Math.round(opportunityContext[item.id].awardValue/1000)}k value</p></button><input type="range" min="0" max="12" step="2" bind:value={hours[item.id]} aria-label={`Hours for ${item.name}`} class="w-full accent-[#315ac3]"/><p class="text-right text-xl font-semibold">{hours[item.id]}h</p></div>{/each}</div>
			</div>
			<aside class="space-y-5">
				<section class="rounded-[26px] bg-[#111c37] p-5 text-white"><p class="text-xs font-bold uppercase tracking-[0.15em] text-[#9cb8ff]">Expected value by opportunity</p><div class="mt-5 h-56"><BarChart data={chartData} x="name" y="value" axis={false} grid={false} rule={false} tooltip={false} series={[{key:'value',value:'value',color:'#87a7ff'}]} props={{bars:{radius:4}}}/></div><p class="mt-4 text-xs leading-relaxed text-white/45">Expected value is directional, not a promise. Use it to expose tradeoffs, then inspect the evidence.</p></section>
				<Scorecard concept="portfolio" compact/>
			</aside>
		</section>
	</main>
</div>

<DetailDrawer scholarship={scholarshipById(detailId)} bind:open={detailOpen}/>
<ConceptNav current="portfolio"/>
