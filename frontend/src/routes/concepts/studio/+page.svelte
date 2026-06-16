<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { dndzone } from 'svelte-dnd-action';
	import { BookOpen, Check, Circle, FileText, GripVertical, PenLine, Sparkles } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { opportunityContext, reusableEvidence, scholarships, type ReusableEvidence } from '$lib/concepts/data';

	type OutlineItem = ReusableEvidence & { id: string };
	let selected = $state(scholarships[1]);
	let tray = $state<OutlineItem[]>(reusableEvidence);
	let outline = $state<OutlineItem[]>([reusableEvidence[1]]);
	let completed = $state<string[]>(['Understand the prompt']);
	let detailOpen = $state(false);
	let draft = $state('I learned that leadership is less about having the loudest answer and more about creating the conditions for other people to contribute.');
	const context = $derived(opportunityContext[selected.id]);
	const wordCount = $derived(draft.trim().split(/\s+/).filter(Boolean).length);

	function updateTray(event: CustomEvent<{ items: OutlineItem[] }>) { tray = event.detail.items; }
	function updateOutline(event: CustomEvent<{ items: OutlineItem[] }>) { outline = event.detail.items; }
	function toggleStep(step: string) { completed = completed.includes(step) ? completed.filter((item) => item !== step) : [...completed, step]; }
</script>

<svelte:head><title>Application Studio · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen bg-[#191614] pb-28 font-[Instrument_Sans_Variable] text-[#f7efe3]">
	<header class="border-b border-white/10 px-5 py-4 md:px-8">
		<div class="mx-auto flex max-w-[1550px] flex-wrap items-center justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#e7ad45]">Concept 08 · Evidence into narrative</p><h1 class="mt-1 text-2xl font-semibold">Application Studio</h1></div><button onclick={() => detailOpen = true} class="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold">Scholarship brief</button></div>
	</header>

	<main class="mx-auto grid max-w-[1550px] gap-4 px-4 py-5 xl:grid-cols-[280px_minmax(0,1fr)_310px] xl:px-8">
		<aside class="space-y-4">
			<section class="rounded-[22px] bg-[#27211d] p-4">
				<p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e7ad45]"><BookOpen size={15}/> Working on</p>
				<select bind:value={selected} class="mt-4 w-full rounded-xl border border-white/10 bg-[#191614] p-3 text-sm">
					{#each scholarships as item}<option value={item}>{item.name}</option>{/each}
				</select>
				<p class="mt-4 text-sm leading-relaxed text-white/50">{selected.summary}</p>
			</section>
			<section class="rounded-[22px] bg-[#27211d] p-4">
				<p class="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Draft path</p>
				<div class="mt-3 space-y-2">{#each ['Understand the prompt', 'Choose evidence', 'Build argument', 'Refine voice'] as step}<button onclick={() => toggleStep(step)} class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-white/5">{#if completed.includes(step)}<Check size={15} class="text-[#e7ad45]"/>{:else}<Circle size={15} class="text-white/20"/>{/if}{step}</button>{/each}</div>
			</section>
			<Scorecard concept="studio" compact/>
		</aside>

		<section class="rounded-[28px] bg-[#fbf5ea] p-5 text-[#29211c] shadow-[0_25px_80px_rgba(0,0,0,.3)] md:p-8">
			<div class="flex flex-wrap items-start justify-between gap-4 border-b border-[#d9ccbb] pb-5"><div><p class="text-xs font-bold uppercase tracking-[0.16em] text-[#a97320]">Prompt 01 · {selected.name}</p><h2 class="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em]">{context.prompts[0]}</h2></div><span class="rounded-full bg-[#efe1c9] px-3 py-2 text-xs font-semibold">{wordCount} words</span></div>
			<div class="mt-6 rounded-2xl border border-dashed border-[#cfb98f] bg-[#f4ead8] p-4">
				<p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#9a6c21]"><Sparkles size={14}/> Argument outline · drop evidence here</p>
				<div class="mt-3 min-h-24 space-y-2" use:dndzone={{items:outline,type:'studio-evidence',flipDurationMs:180}} onconsider={updateOutline} onfinalize={updateOutline}>
					{#each outline as item (item.id)}<div class="flex items-center gap-3 rounded-xl bg-white p-3 text-sm shadow-sm"><GripVertical size={14} class="text-[#a7957c]"/><div><p class="font-semibold">{item.title}</p><p class="mt-1 text-xs text-[#806f5f]">{item.detail}</p></div></div>{/each}
				</div>
			</div>
			<label class="mt-6 block"><span class="text-xs font-bold uppercase tracking-[0.13em] text-[#9a8067]">Draft canvas</span><textarea bind:value={draft} class="mt-3 min-h-[370px] w-full resize-none bg-transparent text-xl leading-[1.8] outline-none" aria-label="Application draft"></textarea></label>
			<div class="mt-4 flex justify-between border-t border-[#d9ccbb] pt-4 text-xs text-[#8b7866]"><span>Autosaved locally for this concept session</span><span>{context.hours}h estimated total effort</span></div>
		</section>

		<aside class="space-y-4">
			<section class="rounded-[22px] bg-[#27211d] p-4"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e7ad45]"><FileText size={15}/> Evidence tray</p><p class="mt-2 text-xs text-white/40">Drag useful proof into the outline.</p>
				<div class="mt-4 min-h-64 space-y-3" use:dndzone={{items:tray,type:'studio-evidence',flipDurationMs:180}} onconsider={updateTray} onfinalize={updateTray}>
					{#each tray as item (item.id)}<article class="rounded-xl border border-white/10 bg-white/5 p-3"><div class="flex justify-between gap-2"><p class="text-sm font-semibold">{item.title}</p><GripVertical size={14} class="text-white/30"/></div><p class="mt-2 text-xs leading-relaxed text-white/45">{item.detail}</p></article>{/each}
				</div>
			</section>
			<section class="rounded-[22px] border border-[#e7ad45]/30 p-4"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#e7ad45]"><PenLine size={14}/> Requirement check</p><div class="mt-3 space-y-2">{#each context.dependencies as item}<p class="rounded-lg bg-white/5 p-2 text-xs text-white/55">{item}</p>{/each}</div></section>
		</aside>
	</main>
</div>

<DetailDrawer scholarship={selected} bind:open={detailOpen} theme="paper"/>
<ConceptNav current="studio"/>
