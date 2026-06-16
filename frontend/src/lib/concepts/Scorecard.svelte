<script lang="ts">
	import { onMount } from 'svelte';
	import type { ConceptKey } from './data';
	let { concept, compact = false }: { concept: ConceptKey; compact?: boolean } = $props();
	const criteria = ['Clarity', 'Usefulness', 'Distinctiveness', 'Trust'];
	let scores = $state<Record<string, number>>({});
	onMount(() => {
		scores = JSON.parse(localStorage.getItem(`scholarai-score-${concept}`) ?? '{}');
	});
	function rate(criterion: string, score: number) {
		scores = { ...scores, [criterion]: score };
		localStorage.setItem(`scholarai-score-${concept}`, JSON.stringify(scores));
	}
</script>

<div class={`grid gap-3 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
	{#each criteria as criterion}
		<div class="rounded-xl border border-current/10 p-3">
			<p class="text-[10px] font-semibold uppercase tracking-wider opacity-40">{criterion}</p>
			<div class="mt-2 flex gap-1">
				{#each [1, 2, 3, 4, 5] as score}
					<button
						onclick={() => rate(criterion, score)}
						aria-label={`${criterion}: ${score} out of 5`}
						aria-pressed={scores[criterion] === score}
						class={`h-7 flex-1 rounded text-xs transition ${scores[criterion] === score ? 'bg-indigo-500 text-white' : 'bg-current/5 hover:bg-current/10'}`}
					>{score}</button>
				{/each}
			</div>
		</div>
	{/each}
</div>
