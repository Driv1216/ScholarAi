<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import { ArrowRight } from '@lucide/svelte';
	import { format, parseISO } from 'date-fns';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { applications, scholarships, scholarshipById } from '$lib/concepts/data';
	let selected = $state(scholarships[0]); let open = $state(false);
	function inspect(id: string) { selected = scholarshipById(id); open = true; }
</script>

<svelte:head><title>Editorial Briefing · ScholarAI Concepts</title></svelte:head>

<main class="min-h-screen bg-[#f7f5ef] text-[#181813]">
	<header class="border-b border-black/15 px-5 py-4 sm:px-8"><div class="mx-auto flex max-w-6xl items-center justify-between"><a href="/concepts" class="font-[Newsreader] text-xl font-semibold">ScholarAI Review</a><p class="font-mono text-[9px] uppercase tracking-widest text-black/35">Saturday · Briefing 24</p></div></header>
	<div class="mx-auto max-w-6xl px-5 py-9 sm:px-8">
		<section class="grid gap-8 border-b-2 border-black pb-9 lg:grid-cols-[1fr_300px]">
			<div><p class="font-mono text-[10px] uppercase tracking-[0.18em] text-[#b8352d]">Your scholarship briefing</p><h1 class="mt-4 max-w-3xl font-[Newsreader] text-5xl leading-[0.98] tracking-[-0.035em] sm:text-7xl">Three strong opportunities deserve attention this week.</h1></div>
			<div class="border-t border-black/15 pt-4 lg:border-l lg:border-t-0 lg:pl-6"><p class="text-xs font-semibold uppercase tracking-wider">Editor’s note</p><p class="mt-3 text-sm leading-6 text-black/55">Prioritize Vector’s nomination request. DAAD is the strongest overall fit, but its proposal creates the largest workload risk.</p></div>
		</section>
		<section class="grid gap-8 py-9 lg:grid-cols-[1fr_300px]">
			<div>
				<div class="mb-4 flex items-end justify-between border-b border-black/15 pb-3"><h2 class="font-[Newsreader] text-3xl">Recommended dossiers</h2><span class="font-mono text-[9px] text-black/35">RANKED BY EVIDENCE</span></div>
				{#each scholarships.slice(0,4) as item, index}
					<button onclick={() => inspect(item.id)} class="grid w-full gap-4 border-b border-black/15 py-5 text-left transition hover:bg-black/[0.025] sm:grid-cols-[40px_1fr_130px]">
						<span class="font-[Newsreader] text-2xl text-[#b8352d]">{index + 1}</span><span><strong class="font-[Newsreader] text-2xl font-medium">{item.name}</strong><span class="mt-1 block text-xs text-black/40">{item.provider} · {item.country}</span><span class="mt-3 block max-w-xl text-sm leading-6 text-black/55">{item.summary}</span></span><span class="text-right font-mono text-xs"><strong class="text-lg">{item.match}%</strong><span class="mt-2 block text-black/35">{format(parseISO(item.deadline), 'MMM d, yyyy')}</span></span>
					</button>
				{/each}
			</div>
			<aside><h2 class="border-b border-black pb-3 font-[Newsreader] text-2xl">Application desk</h2>{#each applications as app}<div class="border-b border-black/15 py-4"><p class="text-xs font-semibold">{scholarshipById(app.scholarshipId).name}</p><p class="mt-1 text-[11px] text-black/40">{app.status} · {app.tasks.filter(t=>!t.done).length} next steps</p></div>{/each}<button class="mt-5 flex items-center gap-2 text-xs font-semibold text-[#b8352d]">Open full desk <ArrowRight size={14}/></button></aside>
		</section>
		<div class="border-t border-black/15 pt-5"><Scorecard concept="editorial" /></div>
	</div>
	<DetailDrawer scholarship={selected} bind:open theme="paper" /><ConceptNav current="editorial" />
</main>
