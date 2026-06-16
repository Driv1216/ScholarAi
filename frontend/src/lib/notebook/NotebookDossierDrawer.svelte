<script lang="ts">
	import { Dialog } from 'bits-ui';
	import {
		ArrowUpRight,
		Bookmark,
		CheckCircle2,
		ClipboardCheck,
		FileWarning,
		Loader2,
		Play,
		X
	} from '@lucide/svelte';
	import { applicationStatusLabels } from '$lib/api/applications';
	import type { NotebookFile } from '$lib/notebook/model';

	let {
		open = $bindable(false),
		file,
		busy = false,
		onSave,
		onUnsave,
		onTrack
	}: {
		open: boolean;
		file: NotebookFile | null;
		busy?: boolean;
		onSave?: (file: NotebookFile) => void;
		onUnsave?: (file: NotebookFile) => void;
		onTrack?: (file: NotebookFile) => void;
	} = $props();

	const scholarship = $derived(file?.scholarship ?? null);
	const application = $derived(file?.application ?? null);
	const primaryUrl = $derived(scholarship ? scholarship.application_url ?? scholarship.official_url : '#');
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-[80] bg-[#04100b]/75 backdrop-blur-sm" />
		<Dialog.Content class="dossier">
			{#if file && scholarship}
				<div class="flex items-start justify-between gap-4">
					<div class="min-w-0">
						<p class="dossier-kicker">
							{scholarship.country ?? 'Global'} / {scholarship.degree_level ?? 'Any degree'} / {file.readiness.percent}% ready
						</p>
						<Dialog.Title class="mt-3 font-[Newsreader_Variable] text-4xl leading-none text-[#282821]">
							{scholarship.name}
						</Dialog.Title>
						<Dialog.Description class="mt-2 text-sm text-[#6d6554]">
							{scholarship.provider}
						</Dialog.Description>
					</div>
					<Dialog.Close class="close-button" aria-label="Close research file">
						<X size={16} />
					</Dialog.Close>
				</div>

				<section class="abstract">
					<p>Decision abstract</p>
					<strong>{file.nextAction.label}</strong>
					<span>{file.nextAction.detail}</span>
				</section>

				<section class="facts">
					<div>
						<span>Match</span>
						<strong>{scholarship.match_score}%</strong>
					</div>
					<div>
						<span>Trust</span>
						<strong>{scholarship.trust_score}%</strong>
					</div>
					<div>
						<span>Award</span>
						<strong>{scholarship.award_amount ?? 'Not listed'}</strong>
					</div>
					<div>
						<span>Deadline</span>
						<strong>{file.deadlineText}</strong>
					</div>
				</section>

				<section class="memo-section">
					<h3>Evidence memo</h3>
					{#if scholarship.match_reasons.length > 0}
						<ul>
							{#each scholarship.match_reasons.slice(0, 4) as reason}
								<li><CheckCircle2 size={15} /> {reason}</li>
							{/each}
						</ul>
					{:else}
						<p class="muted">No match reasons were returned for this file.</p>
					{/if}
				</section>

				<section class="memo-section">
					<h3>Readiness packet</h3>
					<div class="readiness-bar" aria-label={`Readiness ${file.readiness.percent}%`}>
						<span style={`width: ${file.readiness.percent}%`}></span>
					</div>
					<div class="signal-grid">
						{#each file.readiness.signals as signal}
							<span>{signal}</span>
						{/each}
					</div>
				</section>

				<section class="memo-section">
					<h3>Blockers</h3>
					{#if file.blockers.length > 0}
						<div class="blockers">
							{#each file.blockers as blocker}
								<article class={`blocker ${blocker.severity}`}>
									<FileWarning size={16} />
									<div>
										<strong>{blocker.label}</strong>
										<p>{blocker.detail}</p>
									</div>
								</article>
							{/each}
						</div>
					{:else}
						<p class="muted">No blockers are currently derived for this file.</p>
					{/if}
				</section>

				{#if application}
					<section class="memo-section">
						<h3>Application tasks</h3>
						<div class="application-status">
							<ClipboardCheck size={15} />
							<span>{applicationStatusLabels[application.status]}</span>
							<small>{file.tasksCompleted}/{file.tasksTotal || 0} complete</small>
						</div>
						{#if (application.application_tasks ?? []).length > 0}
							<ul class="tasks">
								{#each application.application_tasks ?? [] as task}
									<li class:done={task.completed}>
										<span>{task.completed ? 'Done' : 'Open'}</span>
										{task.task_name}
									</li>
								{/each}
							</ul>
						{/if}
					</section>
				{/if}

				<div class="actions">
					<a href={primaryUrl} target="_blank" rel="noreferrer">
						<ArrowUpRight size={15} />
						View and apply
					</a>
					{#if application && (onSave || onUnsave)}
						<button type="button" disabled={busy} onclick={() => (file.isSaved ? onUnsave?.(file) : onSave?.(file))}>
							{#if busy}<Loader2 class="spin" size={15} />{:else}<Bookmark size={15} />{/if}
							{file.isSaved ? 'Remove save' : 'Save file'}
						</button>
					{:else if !application && onTrack}
						<button type="button" disabled={busy} onclick={() => onTrack?.(file)}>
							{#if busy}<Loader2 class="spin" size={15} />{:else}<Play size={15} />{/if}
							Start tracking
						</button>
					{/if}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	.dossier {
		position: fixed;
		inset: 0 0 0 auto;
		z-index: 90;
		width: min(100%, 44rem);
		overflow-y: auto;
		border-left: 1px solid rgba(185, 157, 98, 0.45);
		background: linear-gradient(180deg, #f3ead5, #e8dcc2 70%, #dcccaa);
		color: #302f27;
		box-shadow: -24px 0 80px rgba(0, 0, 0, 0.42);
		padding: clamp(1.25rem, 3vw, 2rem);
	}

	.dossier-kicker {
		font: 800 0.62rem/1.2 "IBM Plex Mono", monospace;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #7b6947;
	}

	.close-button {
		display: grid;
		place-items: center;
		border: 1px solid #b9a982;
		background: transparent;
		color: #75694f;
		padding: 0.55rem;
	}

	.abstract {
		margin-top: 1.75rem;
		border-block: 1px solid #c9b98f;
		padding-block: 1rem;
	}

	.abstract p,
	.facts span {
		font: 850 0.62rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #806b40;
	}

	.abstract strong {
		display: block;
		margin-top: 0.5rem;
		font: 700 1.35rem/1.15 "Newsreader Variable", serif;
		color: #302f27;
	}

	.abstract span {
		display: block;
		margin-top: 0.4rem;
		font-size: 0.95rem;
		line-height: 1.5;
		color: #635844;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: 1rem;
		border: 1px solid #c9b98f;
	}

	.facts div {
		min-width: 0;
		border-bottom: 1px solid #c9b98f;
		padding: 0.85rem;
	}

	.facts div:nth-child(odd) {
		border-right: 1px solid #c9b98f;
	}

	.facts div:nth-last-child(-n + 2) {
		border-bottom: 0;
	}

	.facts strong {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.9rem;
		line-height: 1.25;
		color: #443c2e;
	}

	.memo-section {
		margin-top: 1.6rem;
	}

	.memo-section h3 {
		font: 650 1.45rem/1 "Newsreader Variable", serif;
		color: #302f27;
	}

	.memo-section ul {
		margin-top: 0.75rem;
		display: grid;
		gap: 0.55rem;
	}

	.memo-section li {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		border-left: 2px solid #7d896a;
		background: rgba(223, 227, 200, 0.65);
		padding: 0.65rem 0.75rem;
		font-size: 0.86rem;
		line-height: 1.4;
		color: #4e543a;
	}

	.readiness-bar {
		margin-top: 0.85rem;
		height: 0.65rem;
		border: 1px solid #b9a982;
		background: #dfd0ad;
	}

	.readiness-bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #7d896a, #c1a567);
	}

	.signal-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.45rem;
		margin-top: 0.75rem;
	}

	.signal-grid span {
		border: 1px solid #d0c19b;
		background: #e7dcc4;
		padding: 0.55rem;
		font: 800 0.64rem/1.15 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #675d4e;
	}

	.blockers {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.85rem;
	}

	.blocker {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.6rem;
		border-left: 2px solid #9b5c4b;
		background: #ead8cb;
		padding: 0.75rem;
	}

	.blocker.notice {
		border-left-color: #b99d62;
		background: #eadfc8;
	}

	.blocker strong {
		font: 800 0.82rem/1 "Instrument Sans Variable", sans-serif;
	}

	.blocker p,
	.muted {
		margin-top: 0.25rem;
		font-size: 0.82rem;
		line-height: 1.45;
		color: #625d4e;
	}

	.application-status {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.75rem;
		border-left: 2px solid #7d896a;
		background: #dfe3c8;
		padding: 0.7rem 0.8rem;
		font: 800 0.75rem/1 "Instrument Sans Variable", sans-serif;
		color: #4c573c;
	}

	.application-status small {
		margin-left: auto;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}

	.tasks li.done {
		opacity: 0.62;
		text-decoration: line-through;
	}

	.tasks span {
		min-width: 2.4rem;
		font: 850 0.55rem/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #806b40;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
		margin-top: 2rem;
	}

	.actions a,
	.actions button {
		display: inline-flex;
		min-height: 2.75rem;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid #302f27;
		background: #302f27;
		padding-inline: 0.9rem;
		font: 850 0.68rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #efe5cf;
		text-decoration: none;
	}

	.actions button {
		background: transparent;
		color: #302f27;
	}

	button:focus-visible,
	a:focus-visible {
		outline: 2px solid #7d896a;
		outline-offset: 3px;
	}

	.spin {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.dossier {
			width: 100%;
		}

		.facts,
		.signal-grid {
			grid-template-columns: 1fr;
		}

		.facts div,
		.facts div:nth-child(odd),
		.facts div:nth-last-child(-n + 2) {
			border-right: 0;
			border-bottom: 1px solid #c9b98f;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spin {
			animation: none;
		}
	}
</style>
