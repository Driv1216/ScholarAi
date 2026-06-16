<script lang="ts">
	import { ArrowLeft, ChevronLeft, ChevronRight, Grid2X2, Search } from '@lucide/svelte';
	import { Popover } from 'bits-ui';
	import { concepts, type ConceptKey } from './data';

	let { current }: { current?: ConceptKey } = $props();
	let query = $state('');
	const currentIndex = $derived(current ? concepts.findIndex((concept) => concept.key === current) : -1);
	const previous = $derived(currentIndex > 0 ? concepts[currentIndex - 1] : undefined);
	const next = $derived(currentIndex >= 0 && currentIndex < concepts.length - 1 ? concepts[currentIndex + 1] : undefined);
	const filtered = $derived(concepts.filter((concept) => `${concept.number} ${concept.name} ${concept.thesis}`.toLowerCase().includes(query.toLowerCase())));
</script>

<nav aria-label="Concept navigation" class="fixed bottom-3 left-1/2 z-[70] flex max-w-[calc(100vw-20px)] -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 shadow-lg shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-black/85">
	<a href="/concepts" class="rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Concept gallery">
		{#if current}<ArrowLeft size={15} />{:else}<Grid2X2 size={15} />{/if}
	</a>
	{#if previous}
		<a href={`/concepts/${previous.key}`} class="rounded-full p-2 text-black/45 hover:bg-black/5 hover:text-black dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white" aria-label={`Previous: ${previous.name}`}><ChevronLeft size={15} /></a>
	{:else}
		<span class="p-2 opacity-20"><ChevronLeft size={15} /></span>
	{/if}
	<Popover.Root>
		<Popover.Trigger class="min-w-24 rounded-full bg-black px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white dark:bg-white dark:text-black">
			{currentIndex >= 0 ? `${String(currentIndex + 1).padStart(2, '0')} / ${concepts.length}` : `Browse ${concepts.length}`}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Content sideOffset={10} class="z-[80] w-[min(390px,calc(100vw-20px))] rounded-2xl border border-black/10 bg-white p-3 text-black shadow-2xl shadow-black/20">
				<label class="flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2.5">
					<Search size={14} class="text-black/35" />
					<span class="sr-only">Search concepts</span>
					<input bind:value={query} placeholder="Search 15 concepts" class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/30" />
				</label>
				<div class="mt-2 max-h-[min(420px,65vh)] overflow-y-auto">
					{#each filtered as concept}
						<a href={`/concepts/${concept.key}`} class={`grid grid-cols-[32px_1fr] gap-2 rounded-xl px-2 py-2.5 transition hover:bg-black/[0.04] ${current === concept.key ? 'bg-black text-white hover:bg-black' : ''}`}>
							<span class="font-mono text-[10px] opacity-45">{concept.number}</span>
							<span><strong class="block text-xs">{concept.name}</strong><small class="mt-0.5 block text-[10px] opacity-45">{concept.thesis}</small></span>
						</a>
					{/each}
					{#if filtered.length === 0}<p class="p-5 text-center text-xs text-black/40">No concepts match that search.</p>{/if}
				</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
	{#if next}
		<a href={`/concepts/${next.key}`} class="rounded-full p-2 text-black/45 hover:bg-black/5 hover:text-black dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white" aria-label={`Next: ${next.name}`}><ChevronRight size={15} /></a>
	{:else}
		<span class="p-2 opacity-20"><ChevronRight size={15} /></span>
	{/if}
</nav>
