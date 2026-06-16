<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { Crown, ExternalLink, X } from '@lucide/svelte';
	import { format, parseISO } from 'date-fns';
	import { notebookDependencies, notebookResearchFiles, opportunityContext, scholarshipById } from '../data';

	let { open = $bindable(false), pinnedIds, leadId, coverageFor, onLead, onOpen }: { open?: boolean; pinnedIds: string[]; leadId: string; coverageFor: (id: string) => number; onLead: (id: string) => void; onOpen: (id: string) => void } = $props();
	const contenders = $derived(pinnedIds.map(scholarshipById));
	const rows = $derived([
		{label:'Decision signal',values:contenders.map((item)=>`${item.match}% fit · ${item.trust}% trust`)},
		{label:'Award',values:contenders.map((item)=>item.award)},
		{label:'Deadline',values:contenders.map((item)=>format(parseISO(item.deadline),'MMM d, yyyy'))},
		{label:'Effort',values:contenders.map((item)=>`${item.effort} · ${opportunityContext[item.id].hours} hours`)},
		{label:'Packet readiness',values:contenders.map((item)=>`${coverageFor(item.id)}% ready`)},
		{label:'Main concern',values:contenders.map((item)=>item.evidence.find((entry)=>entry.state==='concern')?.detail ?? 'No blocking concern')},
		{label:'Missing dependencies',values:contenders.map((item)=>notebookDependencies.filter((entry)=>entry.scholarshipId===item.id && entry.state==='missing').map((entry)=>entry.label).join(' · ') || 'None missing')},
		{label:'Next action',values:contenders.map((item)=>notebookResearchFiles.find((file)=>file.scholarshipId===item.id)?.recommendedNextAction ?? '')}
	]);
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[80] bg-[#06100c]/80 backdrop-blur-sm"/>
		<Dialog.Content class="fixed inset-0 z-[90] overflow-y-auto bg-[#101b16] p-4 text-[#eee5d2] sm:inset-5 sm:border sm:border-[#d0b36c]/25 sm:p-7 lg:inset-10">
			<div class="mx-auto max-w-[1450px]">
				<div class="flex items-start justify-between gap-4 border-b border-[#d0b36c]/20 pb-5"><div><p class="font-mono text-[9px] uppercase tracking-[.18em] text-[#b99d62]">Three files under equal scrutiny</p><Dialog.Title class="mt-2 font-[Newsreader] text-4xl">Comparison Desk</Dialog.Title><Dialog.Description class="mt-2 text-xs text-[#9ba79e]">Only decision-critical differences survive here.</Dialog.Description></div><Dialog.Close class="border border-white/10 p-2 text-white/50 hover:text-white" aria-label="Close comparison"><X size={18}/></Dialog.Close></div>
				<div class="mt-5 overflow-x-auto"><div class="grid min-w-[900px] grid-cols-[170px_repeat(3,minmax(220px,1fr))] gap-px bg-[#d0b36c]/20">
					<div class="bg-[#18271f] p-4 font-mono text-[9px] uppercase tracking-wider text-[#85968b]">Contenders</div>
					{#each contenders as contender}<div class="relative bg-[#eee4cd] p-4 text-[#292d25]">{#if leadId===contender.id}<span class="absolute right-3 top-3 flex gap-1 text-[8px] font-bold uppercase text-[#765b2c]"><Crown size={11}/> Lead</span>{/if}<p class="font-mono text-[8px] uppercase text-[#786744]">{contender.country}</p><h2 class="mt-3 pr-12 font-[Newsreader] text-2xl leading-none">{contender.name}</h2></div>{/each}
					{#each rows as row}<div class="bg-[#18271f] p-4 font-mono text-[8px] uppercase tracking-wider text-[#a99468]">{row.label}</div>{#each row.values as value}<div class="bg-[#eee4cd] p-4 text-xs leading-5 text-[#545649]">{value}</div>{/each}{/each}
					<div class="bg-[#18271f] p-4 font-mono text-[8px] uppercase tracking-wider text-[#a99468]">Verdict</div>
					{#each contenders as contender}<div class="bg-[#eee4cd] p-4 text-[#292d25]"><button onclick={() => onLead(contender.id)} class="w-full bg-[#26382f] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#eee4cd]">Mark lead contender</button><button onclick={() => {onOpen(contender.id);open=false}} class="mt-2 flex w-full items-center justify-center gap-1 px-3 py-2 text-[9px] font-bold uppercase text-[#725c34]">Open dossier <ExternalLink size={11}/></button></div>{/each}
				</div></div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
