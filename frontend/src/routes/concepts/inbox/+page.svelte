<script lang="ts">
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource-variable/instrument-sans/index.css';
	import { Archive, ArrowUpRight, Check, Clock3, CornerUpRight, Inbox, Search, Sparkles } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { scholarshipById, signalEvents, type SignalCategory, type SignalEvent } from '$lib/concepts/data';

	let events = $state<SignalEvent[]>(signalEvents.map((event) => ({ ...event })));
	let category = $state<SignalCategory>('Priority');
	let selectedId = $state('sig-ref');
	let detailOpen = $state(false);
	let query = $state('');
	const categories: SignalCategory[] = ['Priority', 'Opportunities', 'Waiting', 'Done'];
	const visible = $derived(events.filter((event) => event.category === category && `${event.title} ${event.detail}`.toLowerCase().includes(query.toLowerCase())));
	const selected = $derived(events.find((event) => event.id === selectedId) ?? visible[0] ?? events[0]);
	const scholarship = $derived(scholarshipById(selected?.scholarshipId ?? 'daad'));

	function selectCategory(next: SignalCategory) {
		category = next;
		const first = events.find((event) => event.category === next);
		if (first) selectedId = first.id;
	}
	function moveSelected(amount: number) {
		const index = visible.findIndex((event) => event.id === selectedId);
		if (visible.length) selectedId = visible[Math.max(0, Math.min(visible.length - 1, index + amount))].id;
	}
	function moveEvent(next: SignalCategory) {
		events = events.map((event) => event.id === selected.id ? { ...event, category: next } : event);
		const first = events.find((event) => event.category === category);
		if (first) selectedId = first.id;
	}
	function handleKeys(event: KeyboardEvent) {
		if ((event.target as HTMLElement)?.tagName === 'INPUT') return;
		if (event.key === 'j') moveSelected(1);
		if (event.key === 'k') moveSelected(-1);
		if (event.key === 'e') moveEvent('Done');
		if (event.key === 's') moveEvent('Waiting');
	}
</script>

<svelte:window onkeydown={handleKeys}/>
<svelte:head><title>Signal Inbox · ScholarAI Concepts</title></svelte:head>
<div class="min-h-screen overflow-x-hidden bg-[#e9e9e5] pb-28 font-[Instrument_Sans_Variable] text-[#141414]">
	<header class="border-b border-black/15 bg-[#f7f7f3] px-4 py-4">
		<div class="mx-auto flex max-w-[1520px] flex-wrap items-center justify-between gap-4"><div class="flex items-center gap-3"><div class="grid size-9 place-items-center bg-[#286bff] text-white"><Inbox size={17}/></div><div><p class="font-mono text-[9px] uppercase tracking-[0.18em] text-black/40">Concept 12 · Process the signal</p><h1 class="text-lg font-semibold">Signal Inbox</h1></div></div><div class="hidden font-mono text-[10px] text-black/40 sm:block"><kbd>J</kbd>/<kbd>K</kbd> move · <kbd>E</kbd> complete · <kbd>S</kbd> snooze</div></div>
	</header>
	<main class="mx-auto grid max-w-[1520px] border-x border-black/15 bg-[#f7f7f3] lg:grid-cols-[190px_390px_minmax(0,1fr)]">
		<aside class="border-b border-black/15 p-3 lg:min-h-[780px] lg:border-b-0 lg:border-r">
			<label class="flex items-center gap-2 border border-black/10 bg-white px-3 py-2"><Search size={13}/><input bind:value={query} placeholder="Search signals" class="min-w-0 flex-1 bg-transparent text-xs outline-none"/></label>
			<nav class="mt-4 grid grid-cols-2 gap-1 lg:grid-cols-1">{#each categories as item}<button onclick={() => selectCategory(item)} class={`flex items-center justify-between px-3 py-2.5 text-left text-xs font-semibold ${category === item ? 'bg-[#141414] text-white' : 'hover:bg-black/5'}`}><span>{item}</span><span class="font-mono text-[10px] opacity-45">{events.filter((event) => event.category === item).length}</span></button>{/each}</nav>
			<div class="mt-8 hidden border-t border-black/10 pt-4 lg:block"><Scorecard concept="inbox" compact /></div>
		</aside>
		<section class="border-b border-black/15 lg:border-b-0 lg:border-r">
			<div class="flex h-12 items-center justify-between border-b border-black/15 px-4"><p class="text-xs font-bold uppercase tracking-[0.14em]">{category}</p><span class="font-mono text-[10px] text-black/35">{visible.length} signals</span></div>
			<div class="max-h-[430px] overflow-y-auto lg:max-h-[728px]">{#each visible as event}<button onclick={() => selectedId = event.id} class={`w-full border-b border-black/10 p-4 text-left transition ${selected.id === event.id ? 'bg-[#eaf0ff]' : 'hover:bg-black/[0.025]'}`}><div class="flex items-center justify-between gap-3"><span class="font-mono text-[9px] uppercase tracking-wider text-[#286bff]">{event.source}</span><span class="font-mono text-[9px] text-black/30">{event.time}</span></div><h2 class="mt-3 text-sm font-semibold">{event.title}</h2><p class="mt-1 line-clamp-2 text-xs leading-5 text-black/45">{event.detail}</p></button>{/each}{#if visible.length === 0}<p class="p-8 text-center text-xs text-black/35">Inbox clear.</p>{/if}</div>
		</section>
		<section class="min-w-0 p-5 md:p-8">
			<div class="mx-auto max-w-3xl">
				<div class="flex flex-wrap items-center justify-between gap-3 border-b border-black/15 pb-5"><div><p class="font-mono text-[9px] uppercase tracking-[0.16em] text-[#286bff]">{selected.source} · {selected.time}</p><h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">{selected.title}</h2></div><button onclick={() => detailOpen = true} class="flex items-center gap-2 border border-black/15 px-3 py-2 text-xs font-semibold">Open evidence <ArrowUpRight size={14}/></button></div>
				<p class="mt-7 max-w-2xl text-lg leading-8 text-black/60">{selected.detail}</p>
				<div class="mt-8 border-l-2 border-[#286bff] bg-[#edf2ff] p-5"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#286bff]"><Sparkles size={14}/> Recommended response</p><p class="mt-3 text-sm leading-6">{selected.action}. ScholarAI will keep the related evidence and deadline context attached.</p></div>
				<div class="mt-8 grid gap-2 sm:grid-cols-3"><button onclick={() => moveEvent('Done')} class="flex items-center justify-center gap-2 bg-[#141414] px-4 py-3 text-xs font-bold text-white"><Check size={14}/> Complete <kbd class="opacity-40">E</kbd></button><button onclick={() => moveEvent('Waiting')} class="flex items-center justify-center gap-2 border border-black/15 px-4 py-3 text-xs font-bold"><Clock3 size={14}/> Snooze <kbd class="opacity-40">S</kbd></button><button onclick={() => moveEvent('Done')} class="flex items-center justify-center gap-2 border border-black/15 px-4 py-3 text-xs font-bold"><Archive size={14}/> Archive</button></div>
				<div class="mt-12 border-t border-black/15 pt-5"><p class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-black/35"><CornerUpRight size={13}/> Attached context</p><div class="mt-4 flex items-start justify-between gap-4 bg-white p-4"><div><p class="text-sm font-semibold">{scholarship.name}</p><p class="mt-1 text-xs text-black/40">{scholarship.award} · {scholarship.match}% match</p></div><span class="font-mono text-[10px] text-[#286bff]">{scholarship.trust}% confidence</span></div></div>
			</div>
		</section>
		<div class="p-4 lg:hidden"><Scorecard concept="inbox" compact /></div>
	</main>
</div>
<DetailDrawer scholarship={scholarship} bind:open={detailOpen}/>
<ConceptNav current="inbox"/>
