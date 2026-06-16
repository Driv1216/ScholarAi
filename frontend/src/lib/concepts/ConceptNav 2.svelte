<script lang="ts">
	import { ArrowLeft, Grid2X2 } from '@lucide/svelte';
	import { concepts, type ConceptKey } from './data';
	let { current }: { current?: ConceptKey } = $props();
</script>

<div class="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 shadow-lg shadow-black/10 backdrop-blur dark:border-white/10 dark:bg-black/80">
	<a href="/concepts" class="rounded-full p-2 text-black/50 hover:bg-black/5 hover:text-black dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Concept gallery">
		{#if current}<ArrowLeft size={15} />{:else}<Grid2X2 size={15} />{/if}
	</a>
	{#each concepts as concept}
		<a href={`/concepts/${concept.key}`} class={`rounded-full px-2.5 py-1.5 font-mono text-[10px] transition ${current === concept.key ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white'}`}>
			{concept.number}
		</a>
	{/each}
</div>
