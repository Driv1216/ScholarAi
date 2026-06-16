<script lang="ts">
	import { BadgeCheck, Check, CircleAlert, CircleHelp, FileCheck2 } from '@lucide/svelte';
	import { notebookEvidence } from '../data';
	let { evidenceIds, includedIds, onToggle }: { evidenceIds: string[]; includedIds: string[]; onToggle: (id: string) => void } = $props();
	const items = $derived(evidenceIds.map((id) => notebookEvidence.find((item) => item.id === id)!).filter(Boolean));
	const eligible = $derived(items.filter((item) => item.state !== 'missing' && item.state !== 'not-relevant'));
	const coverage = $derived(Math.round((includedIds.filter((id) => eligible.some((item) => item.id === id)).length / Math.max(1, eligible.length + items.filter((item) => item.state === 'missing').length)) * 100));
</script>

<section class="folio">
	<div class="section-heading"><div><p>Reusable evidence folio</p><h3>Build once. Reuse deliberately.</h3></div><div class="coverage"><strong>{coverage}%</strong><span>packet ready</span></div></div>
	<div class="coverage-rule"><span style={`width:${coverage}%`}></span></div>
	<div class="evidence-grid">
		{#each items as item}
			<button disabled={item.state === 'missing' || item.state === 'not-relevant'} aria-pressed={includedIds.includes(item.id)} onclick={() => onToggle(item.id)} class:included={includedIds.includes(item.id)} class:missing={item.state === 'missing'} class="evidence-item">
				<span class="evidence-icon">{#if item.state === 'verified'}<BadgeCheck size={15}/>{:else if item.state === 'missing'}<CircleAlert size={15}/>{:else if includedIds.includes(item.id)}<Check size={15}/>{:else}<CircleHelp size={15}/>{/if}</span>
				<span><strong>{item.title}</strong><small>{item.kind} · {item.state === 'ready' ? 'ready but unverified' : item.state}</small><em>{item.detail}</em></span>
			</button>
		{/each}
	</div>
	<p class="local-note"><FileCheck2 size={13}/> Local concept packet only. Nothing is submitted or shared.</p>
</section>

<style>
	.folio{border-top:1px solid #c9b98f;padding-top:2rem}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:1rem}.section-heading p{font:700 9px "Instrument Sans Variable";letter-spacing:.17em;text-transform:uppercase;color:#75623c}.section-heading h3{margin-top:.35rem;font:500 29px/1 "Newsreader Variable";color:#27291f}.coverage{text-align:right}.coverage strong{display:block;font:600 28px/1 "IBM Plex Mono";color:#59654a}.coverage span{font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#8a806a}.coverage-rule{height:2px;margin:1rem 0 1.25rem;background:#d8cdb2}.coverage-rule span{display:block;height:100%;background:#7c8359;transition:width 180ms}.evidence-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}.evidence-item{display:grid;grid-template-columns:26px 1fr;gap:.5rem;border:1px solid #d6c9a9;background:#eee6d2;padding:.75rem;text-align:left;color:#35372c;transition:150ms}.evidence-item:not(:disabled):hover,.evidence-item:focus-visible{border-color:#817046;outline:2px solid transparent;background:#e8ddc4}.evidence-item.included{border-color:#7e8964;background:#e2e2ca}.evidence-item.missing{border-color:#c6a394;background:#ebdcd1;color:#72483c}.evidence-icon{padding-top:1px}.evidence-item strong,.evidence-item small,.evidence-item em{display:block}.evidence-item strong{font:700 11px/1.25 "Instrument Sans Variable"}.evidence-item small{margin-top:.2rem;font:700 7px "Instrument Sans Variable";letter-spacing:.1em;text-transform:uppercase;color:#81745c}.evidence-item em{margin-top:.4rem;font:italic 12px/1.35 "Newsreader Variable";color:#696452}.local-note{display:flex;gap:.4rem;align-items:center;margin-top:1rem;font:600 8px "Instrument Sans Variable";letter-spacing:.1em;text-transform:uppercase;color:#93866e}@media(max-width:600px){.evidence-grid{grid-template-columns:1fr}}
</style>
