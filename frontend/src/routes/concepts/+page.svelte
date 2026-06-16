<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import { ArrowUpRight, ChevronDown } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { concepts, type ConceptKey } from '$lib/concepts/data';

	const groups = [
		{ label: 'Original directions', note: 'Core product models', items: concepts.slice(0, 5) },
		{ label: 'Systems directions', note: 'Spatial, creative, and analytical models', items: concepts.slice(5, 10) },
		{ label: 'Research-informed directions', note: 'Motivation, signals, identity, futures, and peers', items: concepts.slice(10, 15) }
	];
	const colors = ['#b8352d','#93ff4e','#4267d5','#a97845','#7258d8','#16a6a1','#e25c36','#d29b29','#3d62dc','#dd3f82','#d07b31','#286bff','#176d5a','#8846e8','#df496d'];
</script>

<svelte:head><title>ScholarAI Concept Lab</title></svelte:head>
<main class="min-h-screen bg-[#f2f0ea] px-5 py-10 pb-24 text-[#171713] sm:px-8 lg:px-12">
	<header class="mx-auto max-w-7xl border-b border-black/15 pb-8">
		<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40">ScholarAI / Concept lab / 15 product models</p>
		<div class="mt-5 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
			<h1 class="max-w-3xl font-[Newsreader] text-5xl leading-[0.96] tracking-[-0.04em] sm:text-7xl">Fifteen different answers to the same product.</h1>
			<p class="text-sm leading-6 text-black/55">Every concept uses the same student, opportunities, evidence, and applications. Judge the product model, not the data. Open each workspace, interact with it, then score what deserves to survive.</p>
		</div>
	</header>

	{#each groups as group, groupIndex}
		<section class="mx-auto mt-8 max-w-7xl">
			<div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1"><p class="font-mono text-[10px] uppercase tracking-[0.18em] text-black/55">{group.label}</p><p class="text-[11px] text-black/35">{group.note}</p><div class="h-px min-w-12 flex-1 bg-black/15"></div></div>
			<div class="grid gap-px border border-black/15 bg-black/15 md:grid-cols-2 xl:grid-cols-5">
				{#each group.items as concept, index}
					<a href={`/concepts/${concept.key}`} class="group flex min-h-72 flex-col justify-between bg-[#f2f0ea] p-5 transition hover:bg-white">
						<div>
							<div class="flex items-center justify-between font-mono text-[10px] text-black/35"><span>{concept.number}</span><ArrowUpRight size={14} class="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
							<h2 class="mt-10 font-[Newsreader] text-3xl leading-none">{concept.name}</h2>
							<p class="mt-4 text-sm leading-6 text-black/50">{concept.thesis}</p>
						</div>
						<div><p class="font-mono text-[9px] uppercase tracking-widest text-black/30">{concept.tone}</p><div class="mt-3 h-1 w-full" style={`background:${colors[groupIndex * 5 + index]}`}></div></div>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<section class="mx-auto mt-14 max-w-7xl">
		<div class="mb-5 flex items-end justify-between"><div><p class="font-mono text-[10px] uppercase tracking-widest text-black/35">Evaluation sheets</p><h2 class="mt-2 font-[Newsreader] text-3xl">Score while the feeling is fresh.</h2></div><p class="hidden text-xs text-black/35 sm:block">Saved only in this browser</p></div>
		<div class="space-y-3">
			{#each groups as group, groupIndex}
				<details class="group border-t border-black/15" open={groupIndex === 2}>
					<summary class="flex cursor-pointer list-none items-center justify-between py-4"><span class="text-sm font-semibold">{group.label}</span><ChevronDown size={15} class="transition group-open:rotate-180" /></summary>
					<div class="space-y-6 pb-7">
						{#each group.items as concept}
							<div class="border-l border-black/15 pl-4"><p class="mb-3 text-sm font-semibold">{concept.number} · {concept.name}</p><Scorecard concept={concept.key as ConceptKey} /></div>
						{/each}
					</div>
				</details>
			{/each}
		</div>
	</section>
	<ConceptNav />
</main>
