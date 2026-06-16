<script lang="ts">
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import { BarChart } from 'layerchart';
	import { Search, SlidersHorizontal } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte'; import DetailDrawer from '$lib/concepts/DetailDrawer.svelte'; import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { scholarships } from '$lib/concepts/data';
	let selected = $state(scholarships[0]); let open = $state(false); let query = $state(''); let sortDesc = $state(true);
	const rows = $derived(scholarships.filter(s=>s.name.toLowerCase().includes(query.toLowerCase())).toSorted((a,b)=>sortDesc?b.match-a.match:a.match-b.match));
	const chartData = scholarships.map(s=>({name:s.id,value:s.match}));
</script>
<svelte:head><title>Decision Terminal · ScholarAI Concepts</title></svelte:head>
<main class="min-h-screen bg-[#070a08] font-['IBM_Plex_Mono'] text-[#d8e1d4]">
	<header class="border-b border-[#93ff4e]/20 px-4 py-3"><div class="mx-auto flex max-w-[1500px] items-center justify-between"><a href="/concepts" class="text-sm font-medium text-[#93ff4e]">SCHOLAR_AI / TERMINAL</a><span class="text-[9px] text-white/30">DATASET 06 · SYNCED 23:19</span></div></header>
	<div class="mx-auto max-w-[1500px] p-4">
		<div class="grid gap-3 lg:grid-cols-[1fr_330px]">
			<section class="min-w-0">
				<div class="grid gap-2 border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-4"><div><p class="text-[9px] text-white/30">MATCHES</p><p class="mt-1 text-xl text-[#93ff4e]">06</p></div><div><p class="text-[9px] text-white/30">HIGH CONFIDENCE</p><p class="mt-1 text-xl">03</p></div><div><p class="text-[9px] text-white/30">OPEN TASKS</p><p class="mt-1 text-xl">04</p></div><div><p class="text-[9px] text-white/30">NEXT DEADLINE</p><p class="mt-1 text-xl">76d</p></div></div>
				<div class="mt-3 flex gap-2"><label class="flex flex-1 items-center gap-2 border border-white/10 bg-white/[0.025] px-3"><Search size={13}/><input bind:value={query} placeholder="FILTER OPPORTUNITIES" class="h-9 w-full bg-transparent text-[10px] outline-none placeholder:text-white/25"/></label><button onclick={()=>sortDesc=!sortDesc} class="border border-white/10 px-3 text-[10px] hover:border-[#93ff4e]/50"><SlidersHorizontal size={13}/></button></div>
				<div class="mt-3 overflow-x-auto border border-white/10"><table class="w-full min-w-[800px] text-left text-[10px]"><thead class="bg-white/[0.04] text-white/30"><tr><th class="p-3">OPPORTUNITY</th><th>MATCH</th><th>TRUST</th><th>EFFORT</th><th>DEADLINE</th><th>EVIDENCE</th></tr></thead><tbody>{#each rows as row}<tr onclick={()=>{selected=row;open=true}} class="cursor-pointer border-t border-white/10 hover:bg-[#93ff4e]/[0.04]"><td class="p-3"><strong class="text-xs font-medium text-white">{row.name}</strong><span class="mt-1 block text-white/30">{row.country} / {row.provider}</span></td><td class="text-[#93ff4e]">{row.match}%</td><td>{row.trust}</td><td>{row.effort}</td><td>{row.deadline}</td><td>{row.evidence.filter(e=>e.state==='pass').length}P · {row.evidence.filter(e=>e.state==='concern').length}C</td></tr>{/each}</tbody></table></div>
			</section>
			<aside class="min-w-0 border border-white/10 bg-white/[0.025] p-4"><p class="text-[9px] text-white/30">MATCH DISTRIBUTION</p><div class="mt-4 h-48"><BarChart data={chartData} x="name" y="value" axis={false} grid={false} rule={false} tooltip={false} series={[{key:'match', value:'value', color:'#93ff4e'}]} props={{bars:{radius:2}}} /></div><div class="mt-5 border-t border-white/10 pt-4"><p class="text-[9px] text-white/30">INSPECTOR</p><h2 class="mt-3 text-base text-white">{selected.name}</h2><p class="mt-2 text-[10px] leading-5 text-white/40">{selected.summary}</p><button onclick={()=>open=true} class="mt-5 w-full border border-[#93ff4e]/40 py-2 text-[10px] text-[#93ff4e] hover:bg-[#93ff4e]/10">OPEN EVIDENCE</button></div></aside>
		</div><div class="mt-5"><Scorecard concept="terminal"/></div>
	</div><DetailDrawer scholarship={selected} bind:open theme="dark"/><ConceptNav current="terminal"/>
</main>
