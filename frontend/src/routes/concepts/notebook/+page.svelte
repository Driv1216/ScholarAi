<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import { fade } from 'svelte/transition';
	import { Archive, BookOpenText } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import ComparisonDesk from '$lib/concepts/notebook/ComparisonDesk.svelte';
	import NotebookDecisionRail from '$lib/concepts/notebook/NotebookDecisionRail.svelte';
	import NotebookDossier from '$lib/concepts/notebook/NotebookDossier.svelte';
	import NotebookIndex from '$lib/concepts/notebook/NotebookIndex.svelte';
	import { notebookDependencies, notebookEvidence, notebookResearchFiles, scholarshipById, type NotebookResearchGroup } from '$lib/concepts/data';

	const groupMeta = [
		{ id:'investigate' as const,title:'Investigate',prompt:'Evidence is incomplete'},
		{ id:'shortlist' as const,title:'Shortlist',prompt:'Worth serious effort'},
		{ id:'keep-in-view' as const,title:'Keep in View',prompt:'Interesting, not urgent'}
	];
	let groups = $state(groupMeta.map((group)=>({...group,items:notebookResearchFiles.filter((file)=>file.initialGroup===group.id).map((file)=>({id:file.scholarshipId}))})));
	let selectedId = $state('daad');
	let pinnedIds = $state(['daad','vector','chevening']);
	let leadId = $state('vector');
	let comparisonOpen = $state(false);
	let pinWarning = $state('');
	let annotations = $state<Record<string,string>>(Object.fromEntries(notebookResearchFiles.map((file)=>[file.scholarshipId,file.initialAnnotation])));
	let includedByScholarship = $state<Record<string,string[]>>(Object.fromEntries(notebookResearchFiles.map((file)=>[file.scholarshipId,file.reusableEvidenceIds.filter((id)=>notebookEvidence.find((item)=>item.id===id)?.state!=='missing')])));
	let selectedDependencies = $state<Record<string,string>>(Object.fromEntries(notebookResearchFiles.map((file)=>[file.scholarshipId,file.dependencyIds[0]])));

	const selected = $derived(scholarshipById(selectedId));
	const selectedFile = $derived(notebookResearchFiles.find((file)=>file.scholarshipId===selectedId)!);
	const selectedGroup = $derived(groups.find((group)=>group.items.some((item)=>item.id===selectedId))?.id ?? 'investigate');
	const dependencies = $derived(notebookDependencies.filter((item)=>item.scholarshipId===selectedId));
	const blockerCounts = $derived(Object.fromEntries(notebookResearchFiles.map((file)=>[file.scholarshipId,notebookDependencies.filter((item)=>item.scholarshipId===file.scholarshipId&&(item.state==='missing'||item.type==='blocker')).length])));

	function coverageFor(id: string) {
		const file = notebookResearchFiles.find((item)=>item.scholarshipId===id)!;
		const items = file.reusableEvidenceIds.map((evidenceId)=>notebookEvidence.find((item)=>item.id===evidenceId)!).filter(Boolean);
		const possible = items.filter((item)=>item.state!=='not-relevant').length;
		const included = (includedByScholarship[id] ?? []).filter((evidenceId)=>items.some((item)=>item.id===evidenceId&&item.state!=='missing'&&item.state!=='not-relevant')).length;
		return Math.round((included/Math.max(1,possible))*100);
	}
	function updateGroup(groupId: NotebookResearchGroup, items: Array<{id:string}>) {
		groups = groups.map((group)=>group.id===groupId?{...group,items}:group);
	}
	function moveFile(id: string, target: NotebookResearchGroup) {
		groups = groups.map((group)=>({...group,items:group.id===target?[...group.items.filter((item)=>item.id!==id),{id}]:group.items.filter((item)=>item.id!==id)}));
	}
	function toggleEvidence(id: string) {
		const current=includedByScholarship[selectedId]??[];
		includedByScholarship={...includedByScholarship,[selectedId]:current.includes(id)?current.filter((item)=>item!==id):[...current,id]};
	}
	function togglePin(id=selectedId) {
		pinWarning='';
		if(pinnedIds.includes(id)) pinnedIds=pinnedIds.filter((item)=>item!==id);
		else if(pinnedIds.length<3) pinnedIds=[...pinnedIds,id];
		else pinWarning='Three files are already pinned. Remove one before adding another.';
	}
</script>

<svelte:head><title>Research Notebook · ScholarAI Concepts</title></svelte:head>
<div class="notebook-shell">
	<header class="desk-header"><div><p><Archive size={14}/> Concept 04 · Ink archive edition</p><h1>Research Notebook</h1></div><div><BookOpenText size={20}/><span>Scholarship research arranged by conviction, evidence, and effort.</span></div></header>
	<main class="research-desk">
		<div class="index-wrap"><NotebookIndex {groups} {selectedId} {blockerCounts} onSelect={(id)=>selectedId=id} onUpdate={updateGroup} onMove={moveFile}/></div>
		<div class="dossier-wrap">{#key selectedId}<div in:fade={{duration:160}}><NotebookDossier scholarship={selected} group={selectedGroup} annotation={annotations[selectedId]} includedIds={includedByScholarship[selectedId]??[]} {dependencies} selectedDependencyId={selectedDependencies[selectedId]} pinned={pinnedIds.includes(selectedId)} lead={leadId===selectedId} coverage={coverageFor(selectedId)} onAnnotation={(value)=>annotations={...annotations,[selectedId]:value}} onToggleEvidence={toggleEvidence} onDependency={(id)=>selectedDependencies={...selectedDependencies,[selectedId]:id}} onPin={()=>togglePin()} onLead={()=>leadId=selectedId} onMove={(group)=>moveFile(selectedId,group)}/></div>{/key}</div>
		<div class="decision-wrap"><NotebookDecisionRail {selectedId} {pinnedIds} {leadId} coverage={coverageFor(selectedId)} warning={pinWarning} onSelect={(id)=>selectedId=id} onRemove={togglePin} onCompare={()=>comparisonOpen=true}/></div>
	</main>
</div>
<ComparisonDesk bind:open={comparisonOpen} {pinnedIds} {leadId} {coverageFor} onLead={(id)=>leadId=id} onOpen={(id)=>selectedId=id}/>
<ConceptNav current="notebook"/>

<style>
	:global(body){background:#0c1712}.notebook-shell{min-height:100vh;overflow-x:hidden;background:#0c1712;color:#eee5d2;padding-bottom:6rem;background-image:radial-gradient(rgba(213,190,132,.05) .65px,transparent .7px);background-size:22px 22px}.desk-header{display:flex;align-items:end;justify-content:space-between;gap:2rem;border-bottom:1px solid rgba(217,191,125,.17);padding:1.2rem 2rem}.desk-header p{display:flex;align-items:center;gap:.4rem;font:700 9px "Instrument Sans Variable";letter-spacing:.2em;text-transform:uppercase;color:#b79c62}.desk-header h1{margin-top:.3rem;font:500 36px/1 "Newsreader Variable"}.desk-header>div:last-child{display:flex;align-items:center;gap:.65rem;max-width:390px;font:500 11px/1.5 "Instrument Sans Variable";color:#829087}.research-desk{display:grid;grid-template-columns:260px minmax(0,1fr) 300px;align-items:start;gap:1.15rem;max-width:1800px;margin:0 auto;padding:1rem}.dossier-wrap{min-width:0}@media(max-width:1250px){.research-desk{grid-template-columns:230px minmax(0,1fr)}.research-desk>:last-child{grid-column:1/-1;grid-template-columns:repeat(4,1fr)}}@media(max-width:1023px){.desk-header{display:block;padding:1rem}.desk-header>div:last-child{margin-top:.8rem}.research-desk{display:flex;flex-direction:column;padding:.75rem}.research-desk>*{width:100%}.dossier-wrap{order:2}.research-desk>:first-child{order:1}.research-desk>:last-child{order:3;display:grid;grid-template-columns:1fr}.desk-header h1{font-size:30px}}
	.index-wrap,.decision-wrap{min-width:0}
	@media(max-width:1250px){.decision-wrap{grid-column:1/-1}}
	@media(max-width:1023px){.index-wrap{order:1;max-width:100%;overflow:hidden;contain:layout paint}.dossier-wrap{order:2}.decision-wrap{order:3}.research-desk>*{max-width:100%}}
</style>
