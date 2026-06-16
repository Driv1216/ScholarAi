<script lang="ts">
	import { format, differenceInCalendarDays, parseISO } from 'date-fns';
	import { BadgeCheck, Bookmark, Check, CircleAlert, CircleHelp, Crown, Highlighter, Pin, Target } from '@lucide/svelte';
	import EvidenceFolio from './EvidenceFolio.svelte';
	import DependencyMap from './DependencyMap.svelte';
	import { notebookResearchFiles, opportunityContext, type ConceptScholarship, type NotebookDependency, type NotebookResearchGroup } from '../data';

	let { scholarship, group, annotation, includedIds, dependencies, selectedDependencyId, pinned, lead, coverage, onAnnotation, onToggleEvidence, onDependency, onPin, onLead, onMove }: {
		scholarship: ConceptScholarship; group: NotebookResearchGroup; annotation: string; includedIds: string[]; dependencies: NotebookDependency[]; selectedDependencyId: string; pinned: boolean; lead: boolean; coverage: number;
		onAnnotation: (value: string) => void; onToggleEvidence: (id: string) => void; onDependency: (id: string) => void; onPin: () => void; onLead: () => void; onMove: (group: NotebookResearchGroup) => void;
	} = $props();
	const file = $derived(notebookResearchFiles.find((item) => item.scholarshipId === scholarship.id)!);
	const context = $derived(opportunityContext[scholarship.id]);
	const days = $derived(differenceInCalendarDays(parseISO(scholarship.deadline), new Date('2026-06-15')));
	const strongest = $derived(scholarship.evidence.find((item)=>item.state==='pass'));
	const concern = $derived(scholarship.evidence.find((item)=>item.state==='concern') ?? scholarship.evidence.find((item)=>item.state==='unknown'));
</script>

<article class="dossier">
	<header class="file-header">
		<div><p>Research file · {scholarship.id.toUpperCase()} · {group.replace('-', ' ')}</p><h1>{scholarship.name}</h1><span>{scholarship.provider} · {scholarship.country} · {scholarship.degree}</span></div>
		<div class="header-actions">{#if lead}<span class="lead"><Crown size={12}/> Lead contender</span>{/if}<button aria-pressed={pinned} onclick={onPin}><Pin size={14}/>{pinned ? 'Pinned' : 'Pin to compare'}</button></div>
	</header>

	<section class="abstract">
		<div><p>Decision abstract</p><h2>{file.recommendedVerdict}</h2><blockquote>{scholarship.summary}</blockquote></div>
		<div class="signals"><span><BadgeCheck size={14}/><strong>Strongest signal</strong>{strongest?.detail}</span><span class="concern"><CircleAlert size={14}/><strong>Primary concern</strong>{concern?.detail ?? 'No major concern recorded.'}</span></div>
	</section>

	<section class="facts">
		{#each [{label:'Award',value:scholarship.award},{label:'Deadline',value:format(parseISO(scholarship.deadline),'MMM d, yyyy')},{label:'Days left',value:String(days)},{label:'Match',value:`${scholarship.match}%`},{label:'Trust',value:`${scholarship.trust}%`},{label:'Effort',value:`${scholarship.effort} · ${context.hours}h`},{label:'Packet',value:`${coverage}% ready`}] as fact}<div><p>{fact.label}</p><strong>{fact.value}</strong></div>{/each}
	</section>

	<section class="annotation"><div><p><Highlighter size={13}/> Private margin annotation</p><span>Session-only concept note</span></div><textarea aria-label={`Private note for ${scholarship.name}`} value={annotation} oninput={(event)=>onAnnotation(event.currentTarget.value)}></textarea></section>

	<section class="eligibility">
		<div class="section-title"><p>Eligibility evidence</p><h3>What the file currently proves.</h3></div>
		<div class="evidence-list">{#each scholarship.evidence as item}<div class:item-concern={item.state==='concern'}><span>{#if item.state==='pass'}<Check size={15}/>{:else if item.state==='concern'}<CircleAlert size={15}/>{:else}<CircleHelp size={15}/>{/if}</span><p><strong>{item.label}</strong><small>{item.state}</small><em>{item.detail}</em></p></div>{/each}</div>
	</section>

	<EvidenceFolio evidenceIds={file.reusableEvidenceIds} {includedIds} onToggle={onToggleEvidence}/>
	<DependencyMap scholarshipName={scholarship.name} {dependencies} selectedId={selectedDependencyId} onSelect={onDependency}/>

	<footer class="decision-footer"><div><p><Target size={13}/> Recommended next action</p><strong>{file.recommendedNextAction}</strong></div><div><label>Move file<select value={group} onchange={(event)=>onMove(event.currentTarget.value as NotebookResearchGroup)}><option value="investigate">Investigate</option><option value="shortlist">Shortlist</option><option value="keep-in-view">Keep in View</option></select></label><button onclick={onLead}><Crown size={13}/>{lead?'Current lead':'Mark as lead'}</button><button onclick={onPin}><Bookmark size={13}/>{pinned?'Remove comparison':'Add comparison'}</button></div></footer>
</article>

<!-- svelte-ignore css_unused_selector -->
<style>
	.dossier{min-width:0;background:#efe5cf;color:#303229;box-shadow:0 30px 80px rgba(0,0,0,.36),5px 7px 0 #8e7d58;padding:clamp(1.25rem,3vw,2.5rem);background-image:radial-gradient(rgba(76,70,51,.08) .55px,transparent .7px);background-size:5px 5px}.file-header{display:flex;align-items:start;justify-content:space-between;gap:1.5rem;border-bottom:2px solid #4f5947;padding-bottom:1.4rem}.file-header p,.section-title p,.abstract>div>p{font:700 9px "Instrument Sans Variable";letter-spacing:.18em;text-transform:uppercase;color:#806b40}.file-header h1{max-width:700px;margin-top:.65rem;font:500 clamp(38px,5vw,67px)/.92 "Newsreader Variable";letter-spacing:-.045em}.file-header span{display:block;margin-top:.65rem;font:600 10px "Instrument Sans Variable";color:#766e5c}.header-actions{display:grid;justify-items:end;gap:.5rem;flex-shrink:0}.header-actions button,.lead{display:flex;gap:.4rem;align-items:center;border:1px solid #b9a982;background:transparent;padding:.55rem .7rem;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#5f604f}.lead{border-color:#8c7441;color:#755c27}.abstract{display:grid;grid-template-columns:1.2fr .8fr;gap:2rem;border-bottom:1px solid #c9b98f;padding:2rem 0}.abstract h2{margin-top:.35rem;font:500 31px "Newsreader Variable";color:#5b654c}.abstract blockquote{margin-top:.8rem;font:400 20px/1.5 "Newsreader Variable";color:#535449}.signals{display:grid;gap:.6rem}.signals span{display:grid;grid-template-columns:18px 1fr;gap:.3rem .45rem;border-left:2px solid #758263;background:#e3dfc9;padding:.8rem;font:italic 12px/1.45 "Newsreader Variable";color:#636452}.signals svg{grid-row:span 2}.signals strong{font:700 8px "Instrument Sans Variable";letter-spacing:.12em;text-transform:uppercase;color:#59644c}.signals .concern{border-color:#995e4d;background:#ead9cc}.signals .concern strong{color:#824d40}.facts{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border-bottom:1px solid #c9b98f;padding:1rem 0}.facts div{min-width:0;border-right:1px solid #d4c8a9;padding:.3rem .65rem}.facts div:first-child{padding-left:0}.facts div:last-child{border:0}.facts p{font:700 7px "Instrument Sans Variable";letter-spacing:.12em;text-transform:uppercase;color:#8a7b61}.facts strong{display:block;margin-top:.4rem;font:600 10px/1.35 "IBM Plex Mono";overflow-wrap:anywhere}.annotation{margin:2rem 0;border-left:3px solid #b49452;background:#e5d8bb;padding:1rem}.annotation>div{display:flex;justify-content:space-between;gap:1rem}.annotation p{display:flex;gap:.4rem;align-items:center;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#755e30}.annotation span{font:600 7px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#9a8c70}.annotation textarea{width:100%;min-height:92px;margin-top:.7rem;resize:vertical;border:0;border-top:1px solid #c8b98f;background:transparent;padding-top:.7rem;font:italic 17px/1.45 "Newsreader Variable";color:#4e4d42;outline:none}.eligibility{border-top:1px solid #c9b98f;padding:2rem 0}.section-title h3{margin-top:.35rem;font:500 29px/1 "Newsreader Variable"}.evidence-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;margin-top:1rem}.evidence-list>div{display:grid;grid-template-columns:22px 1fr;gap:.45rem;border:1px solid #d1c4a4;padding:.75rem}.evidence-list .item-concern{border-color:#c29a88;background:#ead9cc}.evidence-list strong,.evidence-list small,.evidence-list em{display:block}.evidence-list strong{font:700 10px "Instrument Sans Variable"}.evidence-list small{margin-top:.15rem;font:700 7px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#887659}.evidence-list em{margin-top:.4rem;font:italic 12px/1.4 "Newsreader Variable";color:#6a6655}.decision-footer{display:flex;align-items:end;justify-content:space-between;gap:1rem;margin-top:2rem;border-top:2px solid #4f5947;padding-top:1.2rem}.decision-footer p{display:flex;gap:.4rem;align-items:center;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#806b40}.decision-footer strong{display:block;margin-top:.4rem;font:600 15px "Newsreader Variable"}.decision-footer>div:last-child{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:end}.decision-footer label,.decision-footer button{border:1px solid #b6a77f;background:transparent;padding:.55rem .65rem;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.09em;color:#525747}.decision-footer label{display:flex;align-items:center;gap:.4rem}.decision-footer select{border:0;background:transparent;font:inherit;color:inherit}.decision-footer button{display:flex;align-items:center;gap:.3rem}@media(max-width:1200px){.facts{grid-template-columns:repeat(4,1fr);gap:.7rem}.facts div{border-right:0;border-bottom:1px solid #d4c8a9;padding:.5rem 0}}@media(max-width:700px){.dossier{padding:1rem;box-shadow:0 20px 50px rgba(0,0,0,.35),3px 4px 0 #8e7d58}.file-header,.abstract,.decision-footer{display:block}.header-actions{justify-items:start;margin-top:1rem}.abstract{grid-template-columns:1fr}.signals{margin-top:1rem}.facts{grid-template-columns:repeat(2,1fr)}.evidence-list{grid-template-columns:1fr}.decision-footer>div:last-child{justify-content:start;margin-top:1rem}}
	:global(.signals svg){grid-row:span 2}
</style>
