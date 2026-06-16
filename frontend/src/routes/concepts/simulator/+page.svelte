<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { ArrowRight, Beaker, CircleAlert, GitBranch, LockKeyhole, Sparkles, TrendingUp } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { scholarshipById, scholarships } from '$lib/concepts/data';

	let ielts = $state(7);
	let experience = $state(1);
	let hours = $state(8);
	let flexible = $state(false);
	let documentsReady = $state(3);
	let selectedId = $state('daad');
	let detailOpen = $state(false);
	const selected = $derived(scholarshipById(selectedId));
	const currentScore = $derived(Math.round(54 + ielts * 2 + experience * 4 + documentsReady * 3 + (flexible ? 4 : 0)));
	const focusedScore = $derived(Math.min(96, currentScore + Math.round(hours / 2) + 5));
	const broadScore = $derived(Math.min(94, currentScore + (flexible ? 11 : 2) + documentsReady));
	const strengthened = $derived(scholarships.filter((scholarship) => scholarship.match <= focusedScore).slice(0, 3));
</script>

<svelte:head><title>Future Simulator · ScholarAI Concepts</title></svelte:head>
<div class="min-h-screen overflow-x-hidden bg-[#0b0a14] pb-28 font-[Instrument_Sans_Variable] text-[#f5f1ff]">
	<header class="border-b border-white/10 px-5 py-5 md:px-8"><div class="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b893ff]">Concept 14 · Branching strategy lab</p><h1 class="mt-2 text-3xl font-semibold tracking-[-0.05em]">Future Simulator</h1></div><div class="flex items-center gap-2 rounded-full border border-[#b893ff]/25 bg-[#b893ff]/10 px-4 py-2 text-xs text-[#d9c6ff]"><Beaker size={14}/> Directional hypotheses, never predictions</div></div></header>
	<main class="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[330px_minmax(0,1fr)] lg:px-8">
		<aside class="space-y-5"><section class="rounded-[26px] border border-white/10 bg-[#141222] p-5"><p class="text-xs font-bold uppercase tracking-[0.16em] text-[#b893ff]">Assumption controls</p><div class="mt-6 space-y-6"><label class="block"><span class="flex justify-between text-xs"><b>IELTS score</b><span>{ielts.toFixed(1)}</span></span><input type="range" min="6" max="9" step=".5" bind:value={ielts} class="mt-3 w-full accent-[#b893ff]"/></label><label class="block"><span class="flex justify-between text-xs"><b>Experience</b><span>{experience} years</span></span><input type="range" min="0" max="5" bind:value={experience} class="mt-3 w-full accent-[#b893ff]"/></label><label class="block"><span class="flex justify-between text-xs"><b>Weekly application time</b><span>{hours}h</span></span><input type="range" min="2" max="20" bind:value={hours} class="mt-3 w-full accent-[#b893ff]"/></label><label class="block"><span class="flex justify-between text-xs"><b>Documents ready</b><span>{documentsReady} / 5</span></span><input type="range" min="1" max="5" bind:value={documentsReady} class="mt-3 w-full accent-[#b893ff]"/></label><button onclick={() => flexible = !flexible} class={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs ${flexible ? 'border-[#b893ff]/50 bg-[#b893ff]/15' : 'border-white/10'}`}><span><b class="block">Destination flexibility</b><small class="mt-1 block text-white/40">Include multi-country programs</small></span><span class={`h-6 w-10 rounded-full p-1 ${flexible ? 'bg-[#b893ff]' : 'bg-white/10'}`}><span class={`block size-4 rounded-full bg-white transition ${flexible ? 'translate-x-4' : ''}`}></span></span></button></div></section><Scorecard concept="simulator" compact/></aside>
		<section class="space-y-5">
			<div class="rounded-[26px] border border-[#e7bd5a]/25 bg-[#e7bd5a]/10 p-4 text-xs leading-5 text-[#ead8a9]"><p class="flex items-center gap-2 font-bold uppercase tracking-[0.14em]"><CircleAlert size={14}/> Uncertainty stays visible</p><p class="mt-2 opacity-70">These branches use fixture assumptions to expose tradeoffs. They do not estimate admission or funding outcomes and should not be treated as guarantees.</p></div>
			<section class="overflow-hidden rounded-[30px] border border-white/10 bg-[#141222] p-5 md:p-8"><div class="flex items-end justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-[#b893ff]">Branching timeline</p><h2 class="mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-5xl">Rehearse the tradeoff before living it.</h2></div><GitBranch size={35} class="text-[#b893ff]"/></div><div class="relative mt-10 grid gap-4 md:grid-cols-3"><div class="absolute left-[16%] right-[16%] top-7 hidden h-px bg-[#b893ff]/35 md:block"></div>{#each [{label:'Current path',score:currentScore,note:'Maintain current preparation pace',color:'#827a96'}, {label:'Focused sprint',score:focusedScore,note:`Invest ${hours} hours each week`,color:'#b893ff'}, {label:'Wider horizon',score:broadScore,note:flexible?'Include mobile programs':'Keep destination constraints',color:'#62d5ba'}] as branch}<div class="relative rounded-2xl border border-white/10 bg-[#0d0c18] p-5"><div class="relative z-10 grid size-14 place-items-center rounded-full border-4 border-[#141222] text-lg font-bold" style={`background:${branch.color}`}>{branch.score}</div><h3 class="mt-5 text-lg font-semibold">{branch.label}</h3><p class="mt-2 text-xs leading-5 text-white/40">{branch.note}</p><p class="mt-5 text-[10px] font-bold uppercase tracking-wider" style={`color:${branch.color}`}>{Math.max(1, Math.round((branch.score - 68) / 5))} routes strengthened</p></div>{/each}</div></section>
			<section class="grid gap-4 md:grid-cols-2"><div class="rounded-[24px] border border-white/10 p-5"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#62d5ba]"><TrendingUp size={14}/> Strengthened under focused sprint</p><div class="mt-4 space-y-2">{#each strengthened as scholarship}<button onclick={() => {selectedId = scholarship.id; detailOpen = true}} class="flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left"><span class="text-sm">{scholarship.name}</span><ArrowRight size={14}/></button>{/each}</div></div><div class="rounded-[24px] border border-white/10 p-5"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e7bd5a]"><LockKeyhole size={14}/> Still constrained</p><div class="mt-4 space-y-3 text-xs leading-5 text-white/45"><p>Leadership evidence remains a concern for Chevening.</p><p>Program nomination remains outside your direct control for Vector.</p><p>More weekly hours improve readiness, not selection probability.</p></div></div></section>
		</section>
	</main>
</div>
<DetailDrawer scholarship={selected} bind:open={detailOpen} theme="dark"/>
<ConceptNav current="simulator"/>
