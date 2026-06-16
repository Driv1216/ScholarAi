<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { Check, ChevronDown, CircleAlert, CircleHelp, Crown, Plus, Scale, X } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { opportunityContext, scholarshipById, scholarships } from '$lib/concepts/data';

	let selectedIds = $state(['daad', 'vector', 'chevening']);
	let promoted = $state('vector');
	let detailId = $state('daad');
	let detailOpen = $state(false);
	const contenders = $derived(selectedIds.map(scholarshipById));

	function toggle(id: string) {
		if (selectedIds.includes(id)) selectedIds = selectedIds.filter((item) => item !== id);
		else if (selectedIds.length < 3) selectedIds = [...selectedIds, id];
	}
	function inspect(id: string) { detailId = id; detailOpen = true; }
</script>

<svelte:head><title>Comparison Room · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen bg-[#f2eee8] pb-28 font-[Instrument_Sans_Variable] text-[#241b17]">
	<header class="border-b border-[#cbbdb1] bg-[#e8ded5] px-5 py-5 md:px-8">
		<div class="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#aa4b31]">Concept 07 · Equal scrutiny</p><h1 class="mt-2 text-3xl font-semibold tracking-[-0.05em]">Comparison Room</h1></div><p class="max-w-md text-sm text-[#715f55]">Three chairs only. Every contender must justify the time it will consume.</p></div>
	</header>

	<main class="mx-auto max-w-[1500px] px-4 py-5 md:px-8">
		<div class="mb-2 flex items-center justify-between gap-4"><p class="text-xs font-bold uppercase tracking-[0.13em] text-[#8b776b]">Choose contenders</p><p class="text-xs text-[#8b776b]">{selectedIds.length} / 3 chairs occupied</p></div>
		<section class="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Choose scholarships to compare">
			{#each scholarships as item}
				<button disabled={selectedIds.length === 3 && !selectedIds.includes(item.id)} onclick={() => toggle(item.id)} aria-pressed={selectedIds.includes(item.id)} class:!bg-[#2d211c]={selectedIds.includes(item.id)} class:!text-white={selectedIds.includes(item.id)} class="shrink-0 rounded-full border border-[#c9b9ad] px-4 py-2 text-xs font-semibold"><Plus size={13} class="mr-1 inline"/>{item.name}</button>
			{/each}
		</section>

		<section class="overflow-x-auto rounded-[26px] border border-[#cbbdb1] bg-[#d6c8bc] p-px">
			<div class="grid min-w-[920px] grid-cols-[190px_repeat(3,minmax(230px,1fr))] gap-px">
				<div class="bg-[#f2eee8] p-5"><Scale size={22}/><p class="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7568]">Contenders</p></div>
				{#each contenders as item}
					<div class="relative bg-[#fffdfa] p-5">
						{#if promoted === item.id}<span class="absolute right-4 top-4 rounded-full bg-[#f3c95f] px-2 py-1 text-[10px] font-bold uppercase"><Crown size={11} class="mr-1 inline"/>Lead</span>{/if}
						<p class="text-xs font-bold uppercase tracking-[0.13em] text-[#a15139]">{item.country}</p><h2 class="mt-4 pr-12 text-2xl font-semibold leading-tight">{item.name}</h2><p class="mt-2 text-xs text-[#8b7a70]">{item.provider}</p>
					</div>
				{/each}

				{#each [
					{label:'Decision signal', render:(id:string) => `${scholarshipById(id).match}% match · ${scholarshipById(id).trust}% trust`},
					{label:'Return on effort', render:(id:string) => `${opportunityContext[id].coverage}% coverage · ${opportunityContext[id].hours} hours`},
					{label:'Probability', render:(id:string) => `${opportunityContext[id].probability}% estimated chance`},
					{label:'Main concern', render:(id:string) => scholarshipById(id).evidence.find((e) => e.state === 'concern')?.detail ?? 'No blocking concern'},
					{label:'Dependencies', render:(id:string) => opportunityContext[id].dependencies.join(' · ')}
				] as row}
					<div class="bg-[#eee6df] p-5 text-xs font-bold uppercase tracking-[0.12em] text-[#806e63]">{row.label}</div>
					{#each contenders as item}
						<div class="bg-[#fffdfa] p-5 text-sm leading-relaxed text-[#5f5048]">{row.render(item.id)}</div>
					{/each}
				{/each}

				<div class="bg-[#eee6df] p-5 text-xs font-bold uppercase tracking-[0.12em] text-[#806e63]">Verdict</div>
				{#each contenders as item}
					<div class="bg-[#fffdfa] p-5"><button onclick={() => promoted = item.id} class="w-full rounded-xl bg-[#2d211c] px-3 py-3 text-xs font-semibold text-white">Promote contender</button><button onclick={() => inspect(item.id)} class="mt-2 w-full py-2 text-xs font-semibold text-[#a15139]">Open execution file</button></div>
				{/each}
			</div>
		</section>
		<div class="mt-5"><Scorecard concept="compare"/></div>
	</main>
</div>

<DetailDrawer scholarship={scholarshipById(detailId)} bind:open={detailOpen} theme="paper"/>
<ConceptNav current="compare"/>
