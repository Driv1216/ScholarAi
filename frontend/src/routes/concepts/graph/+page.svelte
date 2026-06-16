<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { Check, ChevronRight, CircleAlert, FileText, Network, UserRound } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { documents, opportunityContext, recommenders, scholarshipById, scholarships } from '$lib/concepts/data';

	type GraphNode = { id:string; label:string; type:'scholarship'|'document'|'person'|'blocker'; x:number; y:number; scholarshipId?:string; detail:string };
	const nodes: GraphNode[] = [
		{ id:'daad',label:'DAAD',type:'scholarship',x:42,y:30,scholarshipId:'daad',detail:'Primary German funding route' },
		{ id:'vector',label:'Vector AI',type:'scholarship',x:67,y:28,scholarshipId:'vector',detail:'Best probability-adjusted option' },
		{ id:'chevening',label:'Chevening',type:'scholarship',x:49,y:58,scholarshipId:'chevening',detail:'High-value leadership application' },
		{ id:'proposal',label:'Proposal',type:'document',x:18,y:19,detail:'Research proposal draft' },
		{ id:'transcript',label:'Transcript',type:'document',x:22,y:53,detail:'Official academic transcript' },
		{ id:'mehta',label:'Prof. Mehta',type:'person',x:73,y:58,detail:'Research supervisor and confirmed referee' },
		{ id:'nomination',label:'Nomination',type:'blocker',x:88,y:15,detail:'Vector program nomination is not confirmed' },
		{ id:'work-proof',label:'Work proof',type:'blocker',x:38,y:80,detail:'Chevening work experience proof is missing' }
	];
	const edges = [['daad','proposal'],['daad','transcript'],['daad','mehta'],['vector','transcript'],['vector','mehta'],['vector','nomination'],['chevening','mehta'],['chevening','work-proof'],['chevening','transcript']];
	let selectedId = $state('vector');
	let detailOpen = $state(false);
	const selected = $derived(nodes.find((node) => node.id === selectedId) ?? nodes[0]);
	const connectedIds = $derived(edges.filter((edge) => edge.includes(selectedId)).flatMap((edge) => edge).filter((id) => id !== selectedId));
	const connected = $derived(nodes.filter((node) => connectedIds.includes(node.id)));
	const selectedScholarship = $derived(selected.scholarshipId ? scholarshipById(selected.scholarshipId) : scholarships[0]);
	const colors = { scholarship:'#f4d35e',document:'#72d7f2',person:'#bd9cff',blocker:'#ff766b' };
</script>

<svelte:head><title>Relationship Graph · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen overflow-x-hidden bg-[#100d18] pb-28 font-[Instrument_Sans_Variable] text-[#f8f4ff]">
	<header class="border-b border-white/10 px-5 py-5 md:px-8"><div class="mx-auto flex max-w-[1500px] flex-wrap items-end justify-between gap-4"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-[#ed6aa7]">Concept 10 · Dependency intelligence</p><h1 class="mt-2 text-3xl font-semibold tracking-[-0.05em]">Relationship Graph</h1></div><p class="max-w-md text-sm text-white/45">A scholarship is never one item. It is a network of proof, people, decisions, and blockers.</p></div></header>

	<main class="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
		<section class="relative min-h-[680px] overflow-hidden rounded-[30px] border border-white/10 bg-[#171222]">
			<div class="absolute inset-0 opacity-15" style="background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:34px 34px"></div>
			<div class="relative flex flex-wrap items-center justify-between gap-3 p-5"><p class="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#ed9bc1]"><Network size={16}/> Dependency field</p><div class="flex flex-wrap gap-3 text-[10px] uppercase text-white/45">{#each Object.entries(colors) as [key,color]}<span><i class="mr-1 inline-block size-2 rounded-full" style={`background:${color}`}></i>{key}</span>{/each}</div></div>
			<svg viewBox="0 0 100 92" class="relative h-[570px] w-full" role="img" aria-labelledby="graph-title graph-desc">
				<title id="graph-title">Application relationship graph</title><desc id="graph-desc">Scholarships connected to documents, recommenders, and blockers. The structured list beside the graph provides the same controls.</desc>
				{#each edges as edge}{@const from=nodes.find((node)=>node.id===edge[0])!}{@const to=nodes.find((node)=>node.id===edge[1])!}<line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={edge.includes(selectedId)?'#ffffff':'#685b7e'} stroke-opacity={edge.includes(selectedId)?.7:.32} stroke-width={edge.includes(selectedId)?.7:.35}/>{/each}
				{#each nodes as node}
					<g role="button" tabindex="0" aria-label={`${node.type}: ${node.label}`} onclick={() => selectedId=node.id} onkeydown={(event)=>event.key==='Enter'&&(selectedId=node.id)} class="cursor-pointer">
						{#if selectedId===node.id}<circle cx={node.x} cy={node.y} r="6.5" fill="none" stroke="#fff" stroke-opacity=".35"/>{/if}
						<circle cx={node.x} cy={node.y} r={node.type==='scholarship'?4.5:3.3} fill={colors[node.type]}/><text x={node.x} y={node.y+(node.type==='scholarship'?7:5.5)} text-anchor="middle" fill="#eee7f7" font-size="2.3">{node.label}</text>
					</g>
				{/each}
			</svg>
		</section>

		<aside class="space-y-5">
			<section class="rounded-[26px] bg-[#f7f2ff] p-5 text-[#241a32]">
				<p class="text-[10px] font-bold uppercase tracking-[0.17em] text-[#a14375]">{selected.type} selected</p><h2 class="mt-3 text-2xl font-semibold">{selected.label}</h2><p class="mt-3 text-sm leading-relaxed text-[#756881]">{selected.detail}</p>
				<div class="mt-5 border-t border-[#dfd4eb] pt-4"><p class="text-xs font-bold uppercase tracking-[0.13em] text-[#8c7b98]">Connected requirements</p><div class="mt-3 space-y-2">{#each connected as node}<button onclick={() => selectedId=node.id} class="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left text-sm font-semibold shadow-sm"><span>{node.label}</span><ChevronRight size={15}/></button>{/each}</div></div>
				{#if selected.scholarshipId}<button onclick={() => detailOpen=true} class="mt-5 w-full rounded-xl bg-[#321f48] px-4 py-3 text-sm font-semibold text-white">Open scholarship evidence</button>{/if}
			</section>

			<section class="rounded-[24px] border border-white/10 p-4">
				<p class="text-xs font-bold uppercase tracking-[0.14em] text-white/45">Accessible dependency index</p>
				<div class="mt-3 space-y-2">{#each nodes as node}<button onclick={() => selectedId=node.id} class:!border-[#ed6aa7]={selectedId===node.id} class="flex w-full items-center gap-3 rounded-xl border border-white/10 p-3 text-left text-sm hover:bg-white/5">{#if node.type==='blocker'}<CircleAlert size={15} class="text-[#ff766b]"/>{:else if node.type==='document'}<FileText size={15} class="text-[#72d7f2]"/>{:else if node.type==='person'}<UserRound size={15} class="text-[#bd9cff]"/>{:else}<Check size={15} class="text-[#f4d35e]"/>{/if}<span>{node.label}</span></button>{/each}</div>
			</section>
			<Scorecard concept="graph" compact/>
		</aside>
	</main>
</div>

<DetailDrawer scholarship={selectedScholarship} bind:open={detailOpen} theme="dark"/>
<ConceptNav current="graph"/>
