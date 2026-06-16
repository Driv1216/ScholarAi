<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import { Dialog } from 'bits-ui';
	import { dndzone } from 'svelte-dnd-action';
	import { ArrowUpRight, BadgeCheck, CircleAlert, CircleHelp, Crown, FileCheck2, GripVertical, Highlighter, NotebookPen, Pin, Quote, StickyNote, X } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { notebookDependencies, notebookEvidence, notebookResearchFiles, opportunityContext, scholarshipById, scholarships, type ConceptScholarship, type NotebookResearchGroup } from '$lib/concepts/data';

	type NotebookItem = ConceptScholarship & { id: string };
	type NotebookGroup = { id: NotebookResearchGroup; title: string; prompt: string; cue: string; items: NotebookItem[] };

	const groupCopy = {
		investigate: { title: 'Investigate', prompt: 'Evidence still incomplete', cue: 'Prove or reject' },
		shortlist: { title: 'Shortlist', prompt: 'Worth serious application effort', cue: 'Commit time' },
		'keep-in-view': { title: 'Keep in view', prompt: 'Interesting, not urgent', cue: 'Monitor quietly' }
	} satisfies Record<NotebookResearchGroup, { title: string; prompt: string; cue: string }>;

	let groups = $state<NotebookGroup[]>(
		(['investigate', 'shortlist', 'keep-in-view'] as NotebookResearchGroup[]).map((id) => ({
			id,
			...groupCopy[id],
			items: notebookResearchFiles.filter((file) => file.initialGroup === id).map((file) => scholarshipById(file.scholarshipId))
		}))
	);
	let selected = $state<ConceptScholarship>(scholarshipById('daad'));
	let detailOpen = $state(false);
	let compareOpen = $state(false);
	let pinnedIds = $state(['daad', 'vector', 'chevening']);
	let leadId = $state('vector');
	let pinWarning = $state('');
	let lens = $state<'all' | 'pinned' | 'blockers' | 'ready'>('all');
	let annotations = $state<Record<string, string>>(Object.fromEntries(notebookResearchFiles.map((file) => [file.scholarshipId, file.initialAnnotation])));
	let includedEvidence = $state<Record<string, string[]>>(Object.fromEntries(notebookResearchFiles.map((file) => [
		file.scholarshipId,
		file.reusableEvidenceIds.filter((id) => notebookEvidence.find((item) => item.id === id)?.state !== 'missing')
	])));

	const selectedFile = $derived(notebookResearchFiles.find((file) => file.scholarshipId === selected.id) ?? notebookResearchFiles[0]);
	const selectedDependencies = $derived(notebookDependencies.filter((item) => item.scholarshipId === selected.id));
	const pinned = $derived(pinnedIds.map(scholarshipById));
	const strongestPacketId = $derived.by(() => scholarships.reduce((best, item) => (coverageFor(item.id) > coverageFor(best.id) ? item : best), scholarships[0]).id);
	const mostBlockedId = $derived.by(() => scholarships.reduce((worst, item) => (blockersFor(item.id).length > blockersFor(worst.id).length ? item : worst), scholarships[0]).id);

	function updateGroup(groupId: NotebookResearchGroup, event: CustomEvent<{ items: NotebookItem[] }>) {
		groups = groups.map((group) => (group.id === groupId ? { ...group, items: event.detail.items } : group));
	}

	function moveFile(id: string, target: NotebookResearchGroup) {
		const scholarship = scholarshipById(id);
		groups = groups.map((group) => ({
			...group,
			items: group.id === target
				? [...group.items.filter((item) => item.id !== id), scholarship]
				: group.items.filter((item) => item.id !== id)
		}));
	}

	function openFile(id: string) {
		selected = scholarshipById(id);
		detailOpen = true;
	}

	function coverageFor(id: string) {
		const file = notebookResearchFiles.find((item) => item.scholarshipId === id) ?? notebookResearchFiles[0];
		const evidence = file.reusableEvidenceIds.map((evidenceId) => notebookEvidence.find((item) => item.id === evidenceId)).filter(Boolean);
		const total = evidence.filter((item) => item?.state !== 'not-relevant').length;
		const included = (includedEvidence[id] ?? []).filter((evidenceId) => evidence.some((item) => item?.id === evidenceId && item.state !== 'missing')).length;
		return Math.round((included / Math.max(1, total)) * 100);
	}

	function blockersFor(id: string) {
		return notebookDependencies.filter((item) => item.scholarshipId === id && (item.type === 'blocker' || item.state === 'missing'));
	}

	function averageCoverageFor(items: NotebookItem[]) {
		if (!items.length) return 0;
		return Math.round(items.reduce((total, item) => total + coverageFor(item.id), 0) / items.length);
	}

	function blockerTotalFor(items: NotebookItem[]) {
		return items.reduce((total, item) => total + blockersFor(item.id).length, 0);
	}

	function readyCountFor(items: NotebookItem[]) {
		return items.filter((item) => coverageFor(item.id) >= 85).length;
	}

	function lensMatch(id: string) {
		if (lens === 'pinned') return pinnedIds.includes(id);
		if (lens === 'blockers') return blockersFor(id).length > 0;
		if (lens === 'ready') return coverageFor(id) >= 85;
		return true;
	}

	function togglePin(id: string) {
		pinWarning = '';
		if (pinnedIds.includes(id)) pinnedIds = pinnedIds.filter((item) => item !== id);
		else if (pinnedIds.length < 3) pinnedIds = [...pinnedIds, id];
		else pinWarning = 'Three files are already pinned. Remove one before adding another.';
	}

	function toggleEvidence(id: string) {
		const current = includedEvidence[selected.id] ?? [];
		includedEvidence = { ...includedEvidence, [selected.id]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] };
	}
</script>

<svelte:head><title>Research Notebook · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen overflow-x-hidden bg-[#07110d] pb-28 font-[Newsreader_Variable] text-[#f2ead8]">
	<header class="border-b border-[#b99d62]/20 bg-[#0b1711] px-5 py-5 md:px-9">
		<div class="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4">
			<div>
				<div class="flex items-center gap-2 text-[#c1a567]"><NotebookPen size={17} /><p class="font-[Instrument_Sans_Variable] text-xs font-bold uppercase tracking-[0.22em]">Field notebook · No. 04 · Ink archive</p></div>
				<h1 class="mt-2 text-4xl font-medium tracking-[-0.04em]">Scholarship research, arranged by conviction.</h1>
			</div>
			<p class="max-w-sm font-[Instrument_Sans_Variable] text-sm leading-relaxed text-[#8b968d]">Drag research files between groups. Open a file to inspect its evidence, packet readiness, and blockers without leaving the notebook.</p>
		</div>
	</header>

	<main class="mx-auto max-w-[1500px] px-4 py-6 md:px-8">
		<div class="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
			<section class="relative overflow-hidden border border-[#b99d62]/35 bg-[#111f18] p-6 shadow-[4px_6px_0_#4d432d]">
				<Quote size={28} class="text-[#c1a567]" />
				<p class="mt-4 max-w-3xl text-2xl leading-relaxed text-[#eee3ca]">“The strongest options are not merely high-match. They have clear evidence, a plausible story, and an application effort we can defend.”</p>
				<p class="mt-4 font-[Instrument_Sans_Variable] text-xs font-bold uppercase tracking-[0.18em] text-[#a99972]">Research principle · private working board</p>
			</section>
			<section class="border border-[#b99d62]/25 bg-[#111f18] p-5 font-[Instrument_Sans_Variable]">
				<div class="flex items-center justify-between"><p class="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c1a567]">Pinned comparison</p><button onclick={() => compareOpen = true} class="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#f0ddb0]">Open desk <ArrowUpRight size={12}/></button></div>
				<div class="mt-4 space-y-2">
					{#each pinned as scholarship}
						<div class:lead={scholarship.id === leadId} class="pin-row"><button onclick={() => openFile(scholarship.id)}><span>{scholarship.id === leadId ? 'Lead file' : scholarship.country}</span><strong>{scholarship.name}</strong></button><button onclick={() => togglePin(scholarship.id)} aria-label={`Remove ${scholarship.name} from comparison`}><X size={12}/></button></div>
					{/each}
				</div>
				{#if pinWarning}<p class="mt-3 border-l-2 border-[#a35d49] pl-3 text-xs leading-5 text-[#d5aa99]">{pinWarning}</p>{/if}
			</section>
		</div>

		<section class="mb-7 grid gap-4 border-y border-[#b99d62]/25 bg-[#0c1812] p-4 md:grid-cols-[1fr_auto] md:items-center">
			<div class="grid gap-3 sm:grid-cols-3">
				<button onclick={() => openFile(leadId)} class="brief-tile">
					<span>Lead contender</span>
					<strong>{scholarshipById(leadId).name}</strong>
				</button>
				<button onclick={() => openFile(strongestPacketId)} class="brief-tile">
					<span>Cleanest packet</span>
					<strong>{scholarshipById(strongestPacketId).name} · {coverageFor(strongestPacketId)}%</strong>
				</button>
				<button onclick={() => openFile(mostBlockedId)} class="brief-tile warning">
					<span>Needs defense</span>
					<strong>{scholarshipById(mostBlockedId).name} · {blockersFor(mostBlockedId).length} blockers</strong>
				</button>
			</div>
			<div class="lens-tabs" aria-label="Research lens">
				{#each [
					{ id: 'all', label: 'All' },
					{ id: 'pinned', label: 'Pinned' },
					{ id: 'blockers', label: 'Blockers' },
					{ id: 'ready', label: 'Ready' }
				] as item}
					<button aria-pressed={lens === item.id} onclick={() => lens = item.id as typeof lens}>{item.label}</button>
				{/each}
			</div>
		</section>

		<section class="space-y-8">
			{#each groups as group (group.id)}
				<div class={`research-lane lane-${group.id}`}>
					<div class="lane-header">
						<div>
							<p class="lane-cue">{group.cue}</p>
							<h2>{group.title}</h2>
							<p class="lane-prompt">{group.prompt}</p>
						</div>
						<div class="lane-stats" aria-label={`${group.title} lane summary`}>
							<span><strong>{group.items.length.toString().padStart(2, '0')}</strong> {group.items.length === 1 ? 'file' : 'files'}</span>
							<span><strong>{averageCoverageFor(group.items)}%</strong> avg packet</span>
							<span><strong>{blockerTotalFor(group.items)}</strong> {blockerTotalFor(group.items) === 1 ? 'blocker' : 'blockers'}</span>
							<span><strong>{readyCountFor(group.items)}</strong> ready</span>
						</div>
					</div>
					<div class="file-grid min-h-56 rounded-sm border border-dashed border-[#b99d62]/30 bg-[#0e1a14]/70 p-3" use:dndzone={{ items: group.items, type: 'notebook-file', flipDurationMs: 180 }} onconsider={(event) => updateGroup(group.id, event)} onfinalize={(event) => updateGroup(group.id, event)}>
						{#each group.items as item (item.id)}
							{@const file = notebookResearchFiles.find((entry) => entry.scholarshipId === item.id) ?? notebookResearchFiles[0]}
							{@const blockers = blockersFor(item.id)}
							<article class:lens-dimmed={!lensMatch(item.id)} class="notebook-file group relative border border-[#b99d62]/35 bg-[#efe5cf] p-4 text-[#302f27] shadow-[2px_3px_0_#7d6d47] transition hover:-translate-y-0.5 hover:shadow-[4px_6px_0_#6e5f3d]">
								<div class="absolute -top-2 right-5 h-5 w-14 rotate-2 bg-[#c9aa5e]/75"></div>
								{#if item.id === leadId}<div class="lead-stamp"><Crown size={12} /> lead</div>{/if}
								<div class="flex items-start justify-between gap-3">
									<p class="font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.14em] text-[#75643f]">{item.country} · {item.match}% fit · {item.trust}% trust</p>
									<GripVertical size={15} class="text-[#8b7b58]" />
								</div>
								<h3 class="mt-3 text-xl font-semibold leading-tight">{item.name}</h3>
								<p class="summary mt-2 text-[14px] leading-relaxed text-[#645b4e]">{item.summary}</p>
								<div class="mt-4 grid grid-cols-3 gap-2 font-[Instrument_Sans_Variable] text-center">
									<div class="signal"><strong>{coverageFor(item.id)}%</strong><span>packet</span></div>
									<div class:warn={blockers.length > 0} class="signal"><strong>{blockers.length}</strong><span>blockers</span></div>
									<div class="signal"><strong>{opportunityContext[item.id].hours}h</strong><span>effort</span></div>
								</div>
								<div class="next-action mt-3">
									<span>Next action</span>
									<strong>{file.recommendedNextAction}</strong>
								</div>
								<div class="mt-3 border-l-2 border-[#b49452] bg-[#e3d5b7] px-3 py-2">
									<p class="flex items-center gap-1 font-[Instrument_Sans_Variable] text-[10px] font-bold uppercase tracking-[0.13em] text-[#846a39]"><StickyNote size={12} /> Margin note</p>
									<p class="note-preview mt-1 text-sm italic">{annotations[item.id] ?? file.initialAnnotation}</p>
								</div>
								<div class="mt-3 flex flex-wrap gap-2 font-[Instrument_Sans_Variable]">
									<button onclick={() => openFile(item.id)} class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#654d29] underline decoration-[#c69a44] decoration-2 underline-offset-4"><Highlighter size={14} /> Review file</button>
									<button onclick={() => togglePin(item.id)} aria-pressed={pinnedIds.includes(item.id)} class="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[#6d674a]"><Pin size={13}/>{pinnedIds.includes(item.id) ? 'Pinned' : 'Pin'}</button>
									<label class="ml-auto text-[10px] uppercase tracking-wider text-[#756a54]">Move <select value={group.id} onchange={(event) => moveFile(item.id, event.currentTarget.value as NotebookResearchGroup)}><option value="investigate">Investigate</option><option value="shortlist">Shortlist</option><option value="keep-in-view">Keep in view</option></select></label>
								</div>
							</article>
						{/each}
					</div>
				</div>
			{/each}
		</section>

		<div class="mt-8"><Scorecard concept="notebook" /></div>
	</main>
</div>

<Dialog.Root bind:open={detailOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[80] bg-[#04100b]/75 backdrop-blur-sm"/>
		<Dialog.Content class="fixed bottom-0 right-0 top-0 z-[90] w-full max-w-2xl overflow-y-auto border-l border-[#b99d62]/30 bg-[#efe5cf] p-6 text-[#302f27] shadow-2xl sm:p-8">
			<div class="flex items-start justify-between gap-4">
				<div><p class="font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.16em] text-[#7b6947]">{selected.country} · {selected.degree} · {coverageFor(selected.id)}% packet ready</p><Dialog.Title class="mt-3 font-[Newsreader] text-4xl leading-none">{selected.name}</Dialog.Title><Dialog.Description class="mt-2 font-[Instrument_Sans_Variable] text-sm text-[#6d6554]">{selected.provider}</Dialog.Description></div>
				<Dialog.Close class="border border-[#b9a982] p-2 text-[#75694f]" aria-label="Close research file"><X size={16}/></Dialog.Close>
			</div>
			<section class="mt-8 border-y border-[#c9b98f] py-4"><p class="font-[Instrument_Sans_Variable] text-[10px] font-bold uppercase tracking-[0.16em] text-[#806b40]">Private annotation</p><textarea class="mt-3 min-h-28 w-full resize-y border-0 border-t border-[#c8b98f] bg-transparent pt-3 font-[Newsreader] text-lg italic leading-relaxed outline-none" value={annotations[selected.id]} oninput={(event) => annotations = { ...annotations, [selected.id]: event.currentTarget.value }}></textarea></section>
			<section class="mt-8"><h3 class="font-[Newsreader] text-2xl">Evidence and packet readiness</h3><div class="mt-4 grid gap-2 sm:grid-cols-2">{#each selectedFile.reusableEvidenceIds as evidenceId}{@const evidence = notebookEvidence.find((item) => item.id === evidenceId)!}<button disabled={evidence.state === 'missing'} aria-pressed={(includedEvidence[selected.id] ?? []).includes(evidenceId)} onclick={() => toggleEvidence(evidenceId)} class:included={(includedEvidence[selected.id] ?? []).includes(evidenceId)} class:missing={evidence.state === 'missing'} class="evidence-row"><span>{#if evidence.state === 'verified'}<BadgeCheck size={15}/>{:else if evidence.state === 'missing'}<CircleAlert size={15}/>{:else}<FileCheck2 size={15}/>{/if}</span><span><strong>{evidence.title}</strong><small>{evidence.kind} · {evidence.state === 'ready' ? 'ready, unverified' : evidence.state}</small></span></button>{/each}</div></section>
			<section class="mt-8"><h3 class="font-[Newsreader] text-2xl">Requirement trail</h3><div class="mt-4 divide-y divide-[#c9b98f] border-y border-[#c9b98f]">{#each selectedDependencies as dependency}<div class="grid grid-cols-[22px_1fr] gap-3 py-4">{#if dependency.type === 'blocker' || dependency.state === 'missing'}<CircleAlert size={16} class="text-[#9b5c4b]"/>{:else}<CircleHelp size={16} class="text-[#7c8359]"/>{/if}<div><p class="font-[Instrument_Sans_Variable] text-sm font-bold">{dependency.label} · {dependency.state}</p><p class="mt-1 text-sm leading-6 text-[#625d4e]">{dependency.detail}</p><p class="mt-2 font-[Instrument_Sans_Variable] text-[10px] font-bold uppercase tracking-wider text-[#806b40]">Next: {dependency.nextAction}</p></div></div>{/each}</div></section>
			<div class="mt-8 flex flex-wrap gap-2 font-[Instrument_Sans_Variable]"><button onclick={() => { leadId = selected.id; }} class="rounded-none bg-[#302f27] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#efe5cf]"><Crown size={13} class="mr-1 inline"/> Mark lead</button><button onclick={() => togglePin(selected.id)} class="rounded-none border border-[#b9a982] px-4 py-3 text-xs font-bold uppercase tracking-wider">{pinnedIds.includes(selected.id) ? 'Remove pin' : 'Pin to compare'}</button></div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<Dialog.Root bind:open={compareOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[80] bg-[#04100b]/75 backdrop-blur-sm"/>
		<Dialog.Content class="fixed inset-4 z-[90] overflow-y-auto border border-[#b99d62]/30 bg-[#111f18] p-5 text-[#f0e5ca] shadow-2xl sm:p-7">
			<div class="flex items-start justify-between gap-4"><div><p class="font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.16em] text-[#c1a567]">Pinned files · comparison desk</p><Dialog.Title class="mt-2 font-[Newsreader] text-4xl">Compare the working shortlist.</Dialog.Title></div><Dialog.Close aria-label="Close comparison" class="border border-white/10 p-2"><X size={16}/></Dialog.Close></div>
			<div class="mt-6 grid gap-3 lg:grid-cols-3">{#each pinned as item}<article class:lead-card={item.id === leadId} class="compare-card"><p>{item.country} · {coverageFor(item.id)}% packet · {blockersFor(item.id).length} blockers</p><h2>{item.name}</h2><span>{item.award}</span><em>{item.evidence.find((entry) => entry.state === 'concern')?.detail ?? 'No blocking concern recorded.'}</em><div><button onclick={() => leadId = item.id}>Mark lead</button><button onclick={() => { selected = item; detailOpen = true; compareOpen = false; }}>Open file</button></div></article>{/each}</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<ConceptNav current="notebook" />

<style>
	.file-grid{display:grid;grid-template-columns:1fr;gap:1rem;align-items:start}@media(min-width:720px){.file-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(min-width:1150px){.file-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}.notebook-file{min-height:440px}.lens-dimmed{opacity:.42;filter:saturate(.65)}.lens-dimmed:hover,.lens-dimmed:focus-within{opacity:1;filter:none}.brief-tile{border:1px solid rgba(185,157,98,.32);border-left:3px solid #c1a567;background:#13231b;padding:.9rem;text-align:left;color:#f0e5ca;box-shadow:2px 3px 0 rgba(77,67,45,.75)}.brief-tile.warning{border-left-color:#a35d49}.brief-tile span,.brief-tile strong{display:block}.brief-tile span{font:800 9px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.15em;color:#bca266}.brief-tile strong{margin-top:.35rem;font:650 15px/1.25 "Instrument Sans Variable";color:#efe5cf}.lens-tabs{display:flex;flex-wrap:wrap;gap:.35rem;font-family:"Instrument Sans Variable"}.lens-tabs button{min-height:38px;border:1px solid rgba(185,157,98,.28);background:#101f17;padding:.55rem .75rem;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#b9a982}.lens-tabs button[aria-pressed="true"]{background:#c1a567;color:#07110d}.lead-stamp{position:absolute;right:1rem;top:1.35rem;display:flex;align-items:center;gap:.25rem;border:1px solid #b99d62;background:#302f27;padding:.25rem .4rem;font:800 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#efe5cf;transform:rotate(1deg)}.summary,.note-preview{display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden}.summary{-webkit-line-clamp:2;line-clamp:2}.note-preview{-webkit-line-clamp:2;line-clamp:2}.next-action{border:1px solid #d3c29d;background:#e8dcc0;padding:.6rem .7rem}.next-action span,.next-action strong{display:block}.next-action span{font:800 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.13em;color:#806b40}.next-action strong{margin-top:.25rem;font:650 12px/1.35 "Instrument Sans Variable";color:#3f382b}
	.pin-row{display:grid;grid-template-columns:1fr 28px;border-left:2px solid #7d896a;background:#17251f}.pin-row.lead{border-color:#c1a567;background:#23352b}.pin-row button{border:0;background:transparent;padding:.65rem;text-align:left;color:#f0e5ca}.pin-row button:last-child{display:grid;place-items:center;color:#89948c}.pin-row span,.pin-row strong{display:block}.pin-row span{font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#bca266}.pin-row strong{margin-top:.2rem;font:600 12px "Instrument Sans Variable"}.signal{border:1px solid #d3c29d;background:#e5d9be;padding:.55rem}.signal.warn{background:#ead8cb;border-color:#c49d8c}.signal strong,.signal span{display:block}.signal strong{font:600 16px "IBM Plex Mono"}.signal span{margin-top:.1rem;font-size:8px;text-transform:uppercase;letter-spacing:.1em;color:#766a54}.evidence-row{display:grid;grid-template-columns:22px 1fr;gap:.5rem;border:1px solid #d0c19b;background:#e7dcc4;padding:.75rem;text-align:left}.evidence-row.included{background:#dde0c4;border-color:#7c8359}.evidence-row.missing{background:#ead8cb;border-color:#bf9a8a}.evidence-row strong,.evidence-row small{display:block}.evidence-row strong{font:700 12px "Instrument Sans Variable"}.evidence-row small{margin-top:.2rem;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#756a54}.compare-card{border:1px solid rgba(185,157,98,.35);background:#efe5cf;color:#302f27;padding:1rem;box-shadow:2px 3px 0 #6f5e38}.compare-card.lead-card{outline:2px solid #c1a567}.compare-card p{font:700 9px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.13em;color:#75643f}.compare-card h2{margin-top:1rem;font:600 27px/1 "Newsreader Variable"}.compare-card span,.compare-card em{display:block;margin-top:.75rem}.compare-card span{font:600 12px "IBM Plex Mono"}.compare-card em{font-size:15px;line-height:1.45;color:#675d4e}.compare-card div{display:flex;gap:.4rem;margin-top:1rem}.compare-card button{border:1px solid #b9a982;background:transparent;padding:.55rem .7rem;font:700 9px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#4d4738}@media(max-width:700px){.compare-card h2{font-size:23px}}
	.research-lane{position:relative;overflow:hidden;border:1px solid rgba(185,157,98,.28);background:linear-gradient(135deg,rgba(18,37,28,.96),rgba(6,17,13,.96));padding:1rem;box-shadow:0 22px 70px rgba(0,0,0,.24),3px 4px 0 rgba(93,80,49,.55);transition:border-color .22s ease,box-shadow .22s ease,transform .22s ease}.research-lane:hover{border-color:rgba(193,165,103,.58);box-shadow:0 30px 90px rgba(0,0,0,.34),5px 7px 0 rgba(93,80,49,.62)}.research-lane::before{content:"";position:absolute;inset:0 0 auto;height:4px;background:#c1a567}.lane-investigate::before{background:linear-gradient(90deg,#c7a85e,#9b6b48)}.lane-shortlist::before{background:linear-gradient(90deg,#d8bd73,#7d896a)}.lane-keep-in-view::before{background:linear-gradient(90deg,#8c9b7e,#5e725e)}.lane-header{display:grid;gap:1rem;margin-bottom:1rem;padding:.35rem .15rem .65rem;border-bottom:1px solid rgba(185,157,98,.18)}@media(min-width:900px){.lane-header{grid-template-columns:minmax(0,1fr) auto;align-items:end}}.lane-cue{display:inline-flex;width:max-content;border:1px solid rgba(193,165,103,.32);background:rgba(193,165,103,.08);padding:.32rem .5rem;font:800 9px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.16em;color:#d7bf7d}.lane-header h2{margin-top:.55rem;font:650 clamp(2rem,4vw,3.8rem)/.86 "Newsreader Variable";letter-spacing:-.06em;color:#fff1cf;text-shadow:0 12px 32px rgba(0,0,0,.34)}.lane-prompt{margin-top:.35rem;font:600 13px/1.4 "Instrument Sans Variable";color:#8d9a90}.lane-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.45rem;min-width:min(100%,430px);font-family:"Instrument Sans Variable"}@media(min-width:560px){.lane-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}.lane-stats span{border:1px solid rgba(185,157,98,.22);background:rgba(7,17,13,.62);padding:.6rem .7rem;color:#87958d;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.11em}.lane-stats strong{display:block;margin-bottom:.1rem;font:700 17px "IBM Plex Mono";letter-spacing:-.04em;color:#f2ddb0}.file-grid{border-style:solid;border-color:rgba(185,157,98,.24);background:radial-gradient(circle at top left,rgba(193,165,103,.12),transparent 34%),linear-gradient(180deg,rgba(14,26,20,.88),rgba(7,17,13,.88));padding:1rem;box-shadow:inset 0 1px 0 rgba(255,241,207,.05);transition:border-color .2s ease,background .2s ease}.research-lane:hover .file-grid,.file-grid:focus-within{border-color:rgba(193,165,103,.48);background:radial-gradient(circle at top left,rgba(193,165,103,.16),transparent 36%),linear-gradient(180deg,rgba(16,31,24,.94),rgba(7,17,13,.92))}.notebook-file{overflow:hidden;background:linear-gradient(180deg,#f3ead5,#e8dcc2 62%,#dfd0ad);border-color:rgba(185,157,98,.48);box-shadow:0 18px 35px rgba(0,0,0,.22),2px 3px 0 #7d6d47;transform-origin:center top;transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,filter .18s ease}.notebook-file::before{content:"";position:absolute;inset:0 0 auto;height:5px;background:linear-gradient(90deg,rgba(117,100,63,.75),transparent 72%)}.notebook-file:hover,.notebook-file:focus-within{transform:translateY(-6px) rotate(-.25deg);border-color:#c1a567;box-shadow:0 28px 55px rgba(0,0,0,.32),5px 8px 0 #6e5f3d}.notebook-file button:focus-visible,.notebook-file select:focus-visible,.brief-tile:focus-visible,.lens-tabs button:focus-visible{outline:2px solid #f0ddb0;outline-offset:3px}.signal,.next-action,.notebook-file [class*="border-l-2"]{transition:background .18s ease,border-color .18s ease,transform .18s ease}.notebook-file:hover .next-action{transform:translateY(-1px);border-color:#b99d62}.lens-tabs button{transition:background .16s ease,color .16s ease,border-color .16s ease,transform .16s ease}.lens-tabs button:hover{border-color:#c1a567;transform:translateY(-1px)}@media(max-width:700px){.research-lane{padding:.75rem}.lane-header h2{font-size:2.35rem}.lane-stats span{padding:.55rem}.notebook-file{min-height:0}}@media(prefers-reduced-motion:reduce){.research-lane,.file-grid,.notebook-file,.lens-tabs button,.signal,.next-action{transition:none}.notebook-file:hover,.notebook-file:focus-within,.lens-tabs button:hover{transform:none}}
</style>
