<script lang="ts">
	import '@xyflow/svelte/dist/style.css';
	import { Background, BackgroundVariant, Controls, SvelteFlow, type Edge, type Node } from '@xyflow/svelte';
	import { CircleAlert, FileText, Link2, ShieldCheck, UserRound } from '@lucide/svelte';
	import type { NotebookDependency } from '../data';

	let { scholarshipName, dependencies, selectedId, onSelect }: { scholarshipName: string; dependencies: NotebookDependency[]; selectedId: string; onSelect: (id: string) => void } = $props();
	const stateColors = { verified:'#6f8263',ready:'#b39a62','in-progress':'#aa8359',missing:'#9b5c4b',external:'#6e7680' };
	const positions = [{x:25,y:20},{x:260,y:20},{x:25,y:145},{x:260,y:145},{x:145,y:250}];
	const nodes = $derived<Node[]>([
		{ id:'root', position:{x:145,y:110}, data:{label:scholarshipName}, draggable:false, selectable:false, style:'background:#24352d;color:#f3ead6;border:1px solid #b89e66;border-radius:2px;font:600 11px Instrument Sans Variable;padding:10px;width:150px;text-align:center' },
		...dependencies.map((item,index) => ({ id:item.id, position:positions[index % positions.length], data:{label:`${item.label} · ${item.state}`}, draggable:false, focusable:true, ariaRole:'button' as const, domAttributes:{'aria-label':`${item.label}: ${item.state}`}, style:`background:#eee4cd;color:#34362c;border:1px solid ${stateColors[item.state]};border-left:4px solid ${stateColors[item.state]};border-radius:2px;font:600 10px Instrument Sans Variable;padding:8px;width:130px` }))
	]);
	const edges = $derived<Edge[]>(dependencies.map((item) => ({id:`root-${item.id}`,source:'root',target:item.id,style:'stroke:#897b5d;stroke-width:1'})));
	const selected = $derived(dependencies.find((item) => item.id === selectedId) ?? dependencies[0]);
</script>

<section class="dependency-section">
	<div class="heading"><div><p>Dependency intelligence</p><h3>What must become true?</h3></div><span><Link2 size={13}/>{dependencies.length} connected requirements</span></div>
	<div class="map-shell">
		<SvelteFlow {nodes} {edges} fitView fitViewOptions={{padding:.25,duration:180}} deleteKey={null} nodesConnectable={false} elementsSelectable={true} panOnScroll zoomOnDoubleClick={false} onnodeclick={({node}) => node.id !== 'root' && onSelect(node.id)}>
			<Background variant={BackgroundVariant.Dots} patternColor="#8e8268" bgColor="#28382f" gap={20} size={1}/>
			<Controls showLock={false}/>
		</SvelteFlow>
	</div>
	{#if selected}<div class="selected-dependency"><p>{selected.type} · {selected.state}</p><h4>{selected.label}</h4><span>{selected.detail}</span><strong>Next action · {selected.nextAction}</strong></div>{/if}
	<div class="dependency-list" aria-label="Accessible dependency index">
		{#each dependencies as item}
			<button class:active={item.id === selectedId} onclick={() => onSelect(item.id)}>
				{#if item.type === 'blocker'}<CircleAlert size={14}/>{:else if item.type === 'document'}<FileText size={14}/>{:else if item.type === 'recommender'}<UserRound size={14}/>{:else}<ShieldCheck size={14}/>{/if}
				<span><strong>{item.label}</strong><small>{item.state} · {item.nextAction}</small></span>
			</button>
		{/each}
	</div>
</section>

<style>
	.dependency-section{border-top:1px solid #c9b98f;padding-top:2rem}.heading{display:flex;align-items:end;justify-content:space-between;gap:1rem}.heading p{font:700 9px "Instrument Sans Variable";letter-spacing:.17em;text-transform:uppercase;color:#75623c}.heading h3{margin-top:.35rem;font:500 29px/1 "Newsreader Variable";color:#27291f}.heading span{display:flex;gap:.35rem;align-items:center;font:700 8px "Instrument Sans Variable";text-transform:uppercase;letter-spacing:.1em;color:#81765e}.map-shell{height:330px;margin-top:1rem;border:1px solid #cabc99;background:#28382f}.map-shell :global(.svelte-flow__attribution){display:none}.map-shell :global(.svelte-flow__controls){box-shadow:none;border:1px solid #9f9277}.map-shell :global(.svelte-flow__controls-button){background:#eee4cd;border-bottom:1px solid #cabc99;color:#3c4237}.selected-dependency{border:1px solid #c9b98f;border-top:0;background:#eee6d3;padding:1rem}.selected-dependency p{font:700 8px "Instrument Sans Variable";letter-spacing:.12em;text-transform:uppercase;color:#8b7046}.selected-dependency h4{margin-top:.35rem;font:600 18px "Newsreader Variable";color:#2d3027}.selected-dependency span,.selected-dependency strong{display:block;margin-top:.45rem;font:500 11px/1.5 "Instrument Sans Variable";color:#696654}.selected-dependency strong{color:#6d5038}.dependency-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.4rem;margin-top:.8rem}.dependency-list button{display:flex;gap:.5rem;align-items:start;border:1px solid #d3c6a7;background:transparent;padding:.65rem;text-align:left;color:#555445}.dependency-list button.active,.dependency-list button:focus-visible{border-color:#857146;outline:none;background:#e9dfc8}.dependency-list strong,.dependency-list small{display:block}.dependency-list strong{font:700 10px "Instrument Sans Variable"}.dependency-list small{margin-top:.2rem;font:500 8px/1.35 "Instrument Sans Variable";color:#847b68}@media(max-width:600px){.dependency-list{grid-template-columns:1fr}.map-shell{height:300px}.heading{align-items:start;flex-direction:column}}
</style>
