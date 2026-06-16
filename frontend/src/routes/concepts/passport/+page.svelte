<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import '@fontsource-variable/newsreader/index.css';
	import { BadgeCheck, Check, FileCheck2, Fingerprint, Plus, Send, ShieldCheck, Stamp } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { profile, scholarshipById, scholarships, sponsorInvitations, verifiedCredentials } from '$lib/concepts/data';

	let selectedId = $state('daad');
	let included = $state<string[]>(verifiedCredentials.filter((credential) => credential.status !== 'Missing').map((credential) => credential.id));
	let assembled = $state<string[]>([]);
	let detailOpen = $state(false);
	const selected = $derived(scholarshipById(selectedId));
	const baseCoverage = $derived(Math.min(92, 38 + included.length * 11));

	function toggleCredential(id: string) {
		included = included.includes(id) ? included.filter((item) => item !== id) : [...included, id];
	}
</script>

<svelte:head><title>Scholarship Passport · ScholarAI Concepts</title></svelte:head>
<div class="min-h-screen overflow-x-hidden bg-[#d9e4dc] pb-28 font-[Instrument_Sans_Variable] text-[#183329]">
	<header class="px-5 py-6 md:px-8"><div class="mx-auto flex max-w-[1480px] flex-wrap items-center justify-between gap-4"><div><p class="text-[10px] font-bold uppercase tracking-[0.22em] text-[#267354]">Concept 13 · Reusable verified identity</p><h1 class="mt-2 font-[Newsreader] text-4xl">Scholarship Passport</h1></div><div class="flex items-center gap-2 rounded-full border border-[#183329]/15 bg-white/45 px-4 py-2 text-xs font-bold"><ShieldCheck size={15}/> 78% identity readiness</div></div></header>
	<main class="mx-auto grid max-w-[1480px] gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
		<section class="overflow-hidden rounded-[32px] bg-[#f6f0df] shadow-[0_30px_80px_rgba(38,68,53,.14)]">
			<div class="grid border-b border-[#183329]/15 md:grid-cols-[260px_1fr]">
				<div class="border-b border-[#183329]/15 bg-[#1d5b43] p-6 text-[#f6f0df] md:border-b-0 md:border-r"><Fingerprint size={38} class="opacity-70"/><p class="mt-16 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8d6c7]">Reusable applicant identity</p><h2 class="mt-3 font-[Newsreader] text-4xl">{profile.name}</h2><p class="mt-3 text-sm text-[#c8ddcf]">{profile.nationality} · {profile.degree}</p><div class="mt-8 border-t border-white/15 pt-4 font-mono text-[10px] leading-6 text-[#b8d6c7]">PASSPORT ID<br/><span class="text-white">SCH–MRA–2026</span></div></div>
				<div class="p-6 md:p-8"><div class="flex flex-wrap items-start justify-between gap-5"><div><p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#267354]">Verified profile surface</p><h2 class="mt-3 max-w-xl font-[Newsreader] text-4xl leading-[1.02]">Build once. Prove once. Reuse deliberately.</h2></div><div class="rotate-[-8deg] rounded-full border-2 border-[#267354]/45 p-4 text-center text-[9px] font-bold uppercase tracking-[0.18em] text-[#267354]"><Stamp size={20} class="mx-auto mb-1"/>4 ready<br/>2 verified</div></div><p class="mt-6 max-w-2xl text-sm leading-6 text-[#53695f]">The passport makes application readiness visible before you commit. Nothing is submitted automatically.</p></div>
			</div>
			<div class="p-5 md:p-8"><div class="flex items-center justify-between"><h3 class="font-[Newsreader] text-2xl">Credential folio</h3><span class="text-[10px] font-bold uppercase tracking-wider text-[#267354]">{included.length} included</span></div><div class="mt-5 grid gap-3 md:grid-cols-2">{#each verifiedCredentials as credential}<button onclick={() => credential.status !== 'Missing' && toggleCredential(credential.id)} class={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${included.includes(credential.id) ? 'border-[#267354]/40 bg-[#e0eee5]' : 'border-[#183329]/12 bg-white/30'}`}><span class={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${credential.status === 'Verified' ? 'bg-[#267354] text-white' : credential.status === 'Missing' ? 'bg-[#ead4cb] text-[#a34f38]' : 'bg-[#d0dfd5]'}`}>{#if credential.status === 'Verified'}<BadgeCheck size={16}/>{:else if included.includes(credential.id)}<Check size={15}/>{:else}<Plus size={15}/>{/if}</span><span><strong class="block text-sm">{credential.title}</strong><small class="mt-1 block text-[11px] leading-5 text-[#64766d]">{credential.issuer} · {credential.coverage}</small></span></button>{/each}</div></div>
		</section>
		<aside class="space-y-5">
			<section class="rounded-[26px] bg-[#173c2f] p-5 text-[#f0f5ef]"><p class="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9bc9b2]">Packet assembler</p><select bind:value={selectedId} class="mt-4 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm">{#each scholarships as scholarship}<option value={scholarship.id} class="text-black">{scholarship.name}</option>{/each}</select><div class="mt-5 flex items-end justify-between"><div><p class="font-[Newsreader] text-5xl">{baseCoverage}%</p><p class="mt-1 text-xs text-white/45">application packet satisfied</p></div><FileCheck2 size={28} class="text-[#9bc9b2]"/></div><div class="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div class="h-full bg-[#9bc9b2] transition-all" style={`width:${baseCoverage}%`}></div></div><button onclick={() => assembled = assembled.includes(selected.id) ? assembled : [...assembled, selected.id]} class="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f1e6c9] px-4 py-3 text-sm font-bold text-[#173c2f]">{assembled.includes(selected.id) ? 'Packet assembled locally' : 'Assemble reusable packet'} <Send size={15}/></button><button onclick={() => detailOpen = true} class="mt-2 w-full px-4 py-2 text-xs text-white/55">Inspect remaining requirements</button></section>
			<section class="rounded-[24px] bg-white/45 p-5"><p class="text-xs font-bold uppercase tracking-[0.15em] text-[#267354]">Sponsor invitations</p><div class="mt-4 space-y-3">{#each sponsorInvitations as invitation}{@const scholarship = scholarshipById(invitation.scholarshipId)}<button onclick={() => selectedId = scholarship.id} class="w-full rounded-xl border border-[#183329]/10 bg-white/45 p-3 text-left"><p class="text-sm font-semibold">{scholarship.name}</p><p class="mt-2 text-xs leading-5 text-[#61736a]">{invitation.message}</p><p class="mt-2 text-[10px] font-bold uppercase text-[#267354]">{invitation.packetCoverage}% packet ready · simulated invitation</p></button>{/each}</div></section>
			<Scorecard concept="passport" compact/>
		</aside>
	</main>
</div>
<DetailDrawer scholarship={selected} bind:open={detailOpen}/>
<ConceptNav current="passport"/>
