<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { CircleAlert, GripVertical } from '@lucide/svelte';
	import { scholarshipById, type NotebookResearchGroup } from '../data';

	type Group = { id: NotebookResearchGroup; title: string; prompt: string; items: Array<{ id: string }> };
	let { groups, selectedId, blockerCounts, onSelect, onUpdate, onMove }: {
		groups: Group[];
		selectedId: string;
		blockerCounts: Record<string, number>;
		onSelect: (id: string) => void;
		onUpdate: (group: NotebookResearchGroup, items: Array<{ id: string }>) => void;
		onMove: (id: string, group: NotebookResearchGroup) => void;
	} = $props();
</script>

<aside class="index-rail">
	<div class="rail-heading"><p>Research index</p><span>{groups.reduce((sum, group) => sum + group.items.length, 0).toString().padStart(2, '0')} files</span></div>
	<div class="group-row">
		{#each groups as group}
			<section class="research-group">
				<div class="group-heading"><div><h2>{group.title}</h2><p>{group.prompt}</p></div><span>{group.items.length}</span></div>
				<div class="file-stack" use:dndzone={{ items: group.items, type: 'notebook-file-final', flipDurationMs: 160 }} onconsider={(event) => onUpdate(group.id, event.detail.items)} onfinalize={(event) => onUpdate(group.id, event.detail.items)}>
					{#each group.items as item (item.id)}
						{@const scholarship = scholarshipById(item.id)}
						<button class:active={selectedId === item.id} onclick={() => onSelect(item.id)} class="file-tab">
							<div class="file-meta"><span>{scholarship.country}</span><GripVertical size={12}/></div>
							<strong>{scholarship.name}</strong>
							<div class="file-signals"><span>{scholarship.match}% fit</span><span>{scholarship.trust}% trust</span><span class:warning={blockerCounts[item.id] > 0}><CircleAlert size={10}/>{blockerCounts[item.id]}</span></div>
							<label><span class="sr-only">Move {scholarship.name}</span><select value={group.id} onchange={(event) => onMove(item.id, event.currentTarget.value as NotebookResearchGroup)} onclick={(event) => event.stopPropagation()}><option value="investigate">Investigate</option><option value="shortlist">Shortlist</option><option value="keep-in-view">Keep in View</option></select></label>
						</button>
					{/each}
					{#if group.items.length === 0}<p class="empty-file">Drop a research file here</p>{/if}
				</div>
			</section>
		{/each}
	</div>
</aside>

<style>
	.index-rail{min-width:0}.rail-heading,.group-heading,.file-meta,.file-signals{display:flex;align-items:center;justify-content:space-between;gap:.5rem}.rail-heading{border-bottom:1px solid rgba(217,191,125,.22);padding:0 0 .85rem;font:600 10px/1.2 "Instrument Sans Variable";letter-spacing:.18em;text-transform:uppercase;color:#cbb581}.rail-heading span{color:#f2e8cf}.group-row{display:grid;gap:1rem;margin-top:1rem}.research-group{min-width:0}.group-heading{margin-bottom:.5rem}.group-heading h2{font:500 20px/1 "Newsreader Variable";color:#eee5d2}.group-heading p{margin-top:.25rem;font:500 9px/1.3 "Instrument Sans Variable";color:#7f8c82}.group-heading span{font:10px "IBM Plex Mono";color:#c5ad74}.file-stack{min-height:72px;display:grid;gap:.5rem;border-left:1px solid rgba(217,191,125,.18);padding-left:.55rem}.file-tab{width:100%;border:1px solid rgba(225,211,177,.1);border-left:2px solid #58685e;background:#17251f;padding:.7rem;text-align:left;color:#e9e0cd;transition:160ms}.file-tab:hover,.file-tab:focus-visible{border-color:rgba(217,191,125,.42);background:#1c2c25;outline:none}.file-tab.active{border-left-color:#d1b46d;background:#22342b;box-shadow:0 8px 28px rgba(0,0,0,.2)}.file-meta,.file-signals{font:500 8px/1.2 "IBM Plex Mono";text-transform:uppercase;letter-spacing:.08em;color:#819087}.file-tab strong{display:block;margin:.5rem 0;font:600 13px/1.2 "Instrument Sans Variable";color:#f0e8d7}.file-signals span{display:flex;align-items:center;gap:2px}.file-signals .warning{color:#c88473}.file-tab select{width:100%;margin-top:.6rem;border:0;border-top:1px solid rgba(225,211,177,.08);background:transparent;padding-top:.45rem;font:500 9px "Instrument Sans Variable";color:#9eaa9f;outline:none}.empty-file{border:1px dashed rgba(217,191,125,.2);padding:1rem;text-align:center;font:500 9px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.12em;color:#637168}@media(max-width:1023px){.group-row{display:flex;overflow-x:auto;padding-bottom:.5rem}.research-group{min-width:250px}.file-stack{min-height:0}}@media(min-width:1024px){.index-rail{position:sticky;top:1rem;max-height:calc(100vh - 2rem);overflow-y:auto;padding-right:.35rem}}
	@media(max-width:1023px){.index-rail{width:100%;max-width:100%;overflow:hidden;contain:inline-size}.group-row{width:100%;max-width:100%;contain:inline-size}}
</style>
