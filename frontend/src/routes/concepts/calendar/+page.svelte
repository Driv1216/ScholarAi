<script lang="ts">
	import '@fontsource-variable/instrument-sans/index.css';
	import { dndzone } from 'svelte-dnd-action';
	import { addDays, format, parseISO } from 'date-fns';
	import { CalendarDays, Clock3, GripVertical, Plus, Sparkles } from '@lucide/svelte';
	import ConceptNav from '$lib/concepts/ConceptNav.svelte';
	import DetailDrawer from '$lib/concepts/DetailDrawer.svelte';
	import Scorecard from '$lib/concepts/Scorecard.svelte';
	import { applications, scholarshipById, scholarships, type ConceptScholarship } from '$lib/concepts/data';

	type ScheduleItem = {
		id: string;
		title: string;
		kind: 'task' | 'opportunity';
		meta: string;
		scholarshipId?: string;
	};

	type ScheduleDay = {
		id: string;
		date: Date;
		items: ScheduleItem[];
	};

	const anchor = new Date(2026, 5, 13);
	let days = $state<ScheduleDay[]>([
		{
			id: 'sat',
			date: anchor,
			items: [
				{ id: 'task-proof', title: 'Request proof of enrollment', kind: 'task', meta: '15 min · DAAD' },
				{ id: 'opp-vector', title: 'Review Vector Institute', kind: 'opportunity', meta: '94% match', scholarshipId: 'vector' }
			]
		},
		{
			id: 'sun',
			date: addDays(anchor, 1),
			items: [{ id: 'task-referee', title: 'Send referee brief', kind: 'task', meta: '25 min · Chevening' }]
		},
		{
			id: 'mon',
			date: addDays(anchor, 2),
			items: [
				{ id: 'task-essay', title: 'Draft leadership example', kind: 'task', meta: '60 min · Chevening' },
				{ id: 'opp-wtm', title: 'Assess Women Techmakers', kind: 'opportunity', meta: '92% match', scholarshipId: 'women-techmakers' }
			]
		},
		{
			id: 'tue',
			date: addDays(anchor, 3),
			items: [{ id: 'task-transcript', title: 'Verify transcript format', kind: 'task', meta: '20 min · Erasmus' }]
		},
		{
			id: 'wed',
			date: addDays(anchor, 4),
			items: []
		}
	]);

	let selected = $state<ConceptScholarship>(scholarships[0]);
	let drawerOpen = $state(false);

	const upcoming = scholarships.toSorted((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 4);
	const scheduledMinutes = $derived(
		days.reduce((total, day) => total + day.items.reduce((sum, item) => sum + (Number(item.meta.match(/\d+/)?.[0]) || 20), 0), 0)
	);

	function updateDay(dayId: string, event: CustomEvent<{ items: ScheduleItem[] }>) {
		days = days.map((day) => (day.id === dayId ? { ...day, items: event.detail.items } : day));
	}

	function openScholarship(id?: string) {
		if (!id) return;
		selected = scholarshipById(id);
		drawerOpen = true;
	}
</script>

<svelte:head><title>Application Calendar · ScholarAI Concepts</title></svelte:head>

<div class="min-h-screen bg-[#f3f7fb] pb-28 font-[Instrument_Sans_Variable] text-[#152536]">
	<header class="border-b border-[#cddbe7] bg-white/90 px-5 py-4 backdrop-blur md:px-8">
		<div class="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#3271a8]">Concept 03 · Workload first</p>
				<h1 class="mt-1 text-2xl font-semibold tracking-[-0.04em]">Application Calendar</h1>
			</div>
			<div class="flex gap-2 text-sm">
				<span class="rounded-full bg-[#e7f2fb] px-3 py-2 text-[#24618f]">{scheduledMinutes} min scheduled</span>
				<button class="flex items-center gap-2 rounded-full bg-[#1769aa] px-4 py-2 font-semibold text-white"><Plus size={15} /> Add task</button>
			</div>
		</div>
	</header>

	<main class="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[1fr_300px] lg:px-8">
		<section class="overflow-hidden rounded-[24px] border border-[#c9d8e5] bg-white shadow-[0_20px_70px_rgba(36,89,130,0.08)]">
			<div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce6ee] px-5 py-4">
				<div class="flex items-center gap-3">
					<div class="grid size-10 place-items-center rounded-xl bg-[#e2f0fb] text-[#1769aa]"><CalendarDays size={20} /></div>
					<div><p class="font-semibold">Five-day execution plan</p><p class="text-sm text-[#6b7d8c]">Drag work to rebalance the week.</p></div>
				</div>
				<div class="rounded-xl border border-[#d2e0ea] px-3 py-2 text-sm font-medium">June 13–17, 2026</div>
			</div>

			<div class="grid min-h-[570px] divide-y divide-[#dce6ee] md:grid-cols-5 md:divide-x md:divide-y-0">
				{#each days as day (day.id)}
					<div class="min-w-0 bg-gradient-to-b from-[#fbfdff] to-white">
						<div class="border-b border-[#e3ebf2] px-3 py-4">
							<p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b8c99]">{format(day.date, 'EEE')}</p>
							<p class="mt-1 text-2xl font-semibold">{format(day.date, 'd')}</p>
						</div>
						<div
							class="min-h-[460px] space-y-3 p-3"
							use:dndzone={{ items: day.items, type: 'calendar-item', flipDurationMs: 180 }}
							onconsider={(event) => updateDay(day.id, event)}
							onfinalize={(event) => updateDay(day.id, event)}
						>
							{#each day.items as item (item.id)}
								<button
									onclick={() => openScholarship(item.scholarshipId)}
									class:cursor-default={!item.scholarshipId}
									class="group w-full rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md {item.kind === 'opportunity' ? 'border-[#9dc8e6] bg-[#eaf6ff]' : 'border-[#d6e1e9] bg-white'}"
								>
									<div class="mb-3 flex items-start justify-between gap-2">
										<span class="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] {item.kind === 'opportunity' ? 'bg-[#cce9fb] text-[#155f94]' : 'bg-[#edf1f4] text-[#647684]'}">{item.kind}</span>
										<GripVertical size={15} class="text-[#9aabb8] opacity-60 group-hover:opacity-100" />
									</div>
									<p class="text-sm font-semibold leading-snug">{item.title}</p>
									<p class="mt-2 flex items-center gap-1 text-xs text-[#708391]"><Clock3 size={12} /> {item.meta}</p>
								</button>
							{/each}
							<div class="rounded-2xl border border-dashed border-[#cfdee9] px-3 py-6 text-center text-xs text-[#91a2af]">Drop work here</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<aside class="space-y-5">
			<section class="rounded-[22px] bg-[#163f61] p-5 text-white shadow-[0_18px_50px_rgba(22,63,97,0.2)]">
				<div class="flex items-center gap-2 text-[#9ed4f5]"><Sparkles size={16} /><p class="text-xs font-bold uppercase tracking-[0.16em]">Planner note</p></div>
				<p class="mt-4 text-xl font-semibold leading-tight">Monday is overloaded.</p>
				<p class="mt-2 text-sm leading-relaxed text-[#c5dfef]">Move the leadership draft to Wednesday to create a focused writing block.</p>
			</section>

			<section class="rounded-[22px] border border-[#c9d8e5] bg-white p-4">
				<h2 class="px-1 text-sm font-semibold">Deadline radar</h2>
				<div class="mt-3 space-y-2">
					{#each upcoming as item}
						<button onclick={() => openScholarship(item.id)} class="w-full rounded-xl border border-[#e0e8ef] p-3 text-left transition hover:border-[#87bce0] hover:bg-[#f6fbff]">
							<div class="flex justify-between gap-3"><p class="text-sm font-semibold">{item.name}</p><span class="text-xs font-bold text-[#2172ad]">{item.match}%</span></div>
							<p class="mt-2 text-xs text-[#748693]">{format(parseISO(item.deadline), 'MMM d')} · {item.effort} effort</p>
						</button>
					{/each}
				</div>
			</section>
			<Scorecard concept="calendar" compact />
		</aside>
	</main>
</div>

<ConceptNav current="calendar" />
<DetailDrawer scholarship={selected} bind:open={drawerOpen} />
