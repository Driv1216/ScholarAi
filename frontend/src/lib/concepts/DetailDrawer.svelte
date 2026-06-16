<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Check, CircleAlert, CircleHelp, ExternalLink, X } from '@lucide/svelte';
	import type { ConceptScholarship } from './data';

	let { scholarship, open = $bindable(false), theme = 'dark' }: { scholarship: ConceptScholarship; open?: boolean; theme?: 'light' | 'dark' | 'paper' } = $props();
	const isLight = $derived(theme !== 'dark');
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[80] bg-black/50 backdrop-blur-[2px]" />
		<Dialog.Content class={`fixed bottom-0 right-0 top-0 z-[90] w-full max-w-xl overflow-y-auto border-l p-6 shadow-2xl sm:p-8 ${isLight ? 'border-black/10 bg-[#f6f3ec] text-[#171713]' : 'border-white/10 bg-[#11141b] text-white'}`}>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="font-mono text-[10px] uppercase tracking-[0.16em] opacity-40">{scholarship.country} · {scholarship.degree}</p>
					<Dialog.Title class="mt-3 text-2xl font-semibold leading-tight">{scholarship.name}</Dialog.Title>
					<Dialog.Description class="mt-2 text-sm opacity-50">{scholarship.provider}</Dialog.Description>
				</div>
				<Dialog.Close class="rounded-full border border-current/10 p-2 opacity-50 hover:opacity-100" aria-label="Close detail"><X size={16} /></Dialog.Close>
			</div>

			<div class="mt-8 grid grid-cols-3 border-y border-current/10 py-4 text-sm">
				<div><p class="text-[10px] uppercase tracking-wider opacity-35">Match</p><p class="mt-1 font-mono">{scholarship.match}%</p></div>
				<div><p class="text-[10px] uppercase tracking-wider opacity-35">Award</p><p class="mt-1">{scholarship.award}</p></div>
				<div><p class="text-[10px] uppercase tracking-wider opacity-35">Effort</p><p class="mt-1">{scholarship.effort}</p></div>
			</div>

			<p class="mt-8 text-base leading-7 opacity-70">{scholarship.summary}</p>
			<h3 class="mt-9 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-40">Eligibility evidence</h3>
			<div class="mt-3 divide-y divide-current/10 border-y border-current/10">
				{#each scholarship.evidence as item}
					<div class="grid grid-cols-[20px_1fr] gap-3 py-4">
						{#if item.state === 'pass'}<Check size={16} class="text-emerald-500" />{:else if item.state === 'concern'}<CircleAlert size={16} class="text-amber-500" />{:else}<CircleHelp size={16} class="opacity-35" />{/if}
						<div><p class="text-sm font-medium">{item.label}</p><p class="mt-1 text-xs leading-5 opacity-45">{item.detail}</p></div>
					</div>
				{/each}
			</div>
			<a href="/concepts" class={`mt-8 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${isLight ? 'bg-[#171713] text-white' : 'bg-white text-black'}`}>Return to concept gallery <ExternalLink size={14} /></a>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
