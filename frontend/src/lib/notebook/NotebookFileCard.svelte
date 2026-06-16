<script lang="ts">
	import {
		ArrowUpRight,
		Bookmark,
		ClipboardCheck,
		FileText,
		GripVertical,
		Loader2,
		MoveRight,
		Play,
		ShieldAlert
	} from '@lucide/svelte';
	import { applicationStatusLabels } from '$lib/api/applications';
	import type { NotebookBucket, NotebookFile } from '$lib/notebook/model';

	let {
		file,
		bucket = file.bucket,
		dragHandle = false,
		busy = false,
		onOpen,
		onSave,
		onUnsave,
		onTrack,
		onMove
	}: {
		file: NotebookFile;
		bucket?: NotebookBucket;
		dragHandle?: boolean;
		busy?: boolean;
		onOpen?: (file: NotebookFile) => void;
		onSave?: (file: NotebookFile) => void;
		onUnsave?: (file: NotebookFile) => void;
		onTrack?: (file: NotebookFile) => void;
		onMove?: (file: NotebookFile, bucket: NotebookBucket) => void;
	} = $props();

	const scholarship = $derived(file.scholarship);
	const application = $derived(file.application);
	const primaryUrl = $derived(scholarship.application_url ?? scholarship.official_url);
</script>

<article class={`notebook-file readiness-${file.readiness.tone}`}>
	<div class="tape" aria-hidden="true"></div>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="file-kicker">
				{scholarship.country ?? 'Global'} / {scholarship.degree_level ?? 'Any degree'}
			</p>
			<h3>{scholarship.name}</h3>
			<p class="provider">{scholarship.provider}</p>
		</div>
		{#if dragHandle}
			<GripVertical class="mt-1 shrink-0 text-[#8d7b55]" size={18} aria-hidden="true" />
		{/if}
	</div>

	<div class="mt-4 grid grid-cols-3 gap-2">
		<div class="metric">
			<strong>{file.readiness.percent}%</strong>
			<span>ready</span>
		</div>
		<div class:warn={file.blockers.length > 0} class="metric">
			<strong>{file.blockers.length}</strong>
			<span>blocks</span>
		</div>
		<div class:warn={file.deadlineStatus === 'urgent' || file.deadlineStatus === 'expired'} class="metric">
			<strong>{scholarship.match_score}%</strong>
			<span>match</span>
		</div>
	</div>

	<div class="file-rule">
		<div>
			<p>Award</p>
			<strong>{scholarship.award_amount ?? 'Not listed'}</strong>
		</div>
		<div>
			<p>Deadline</p>
			<strong class:urgent={file.deadlineStatus === 'urgent'} class:closed={file.deadlineStatus === 'expired'}>
				{file.deadlineText}
			</strong>
		</div>
	</div>

	<div class="next-action">
		<span><FileText size={13} /> Next action</span>
		<strong>{file.nextAction.label}</strong>
		<p>{file.nextAction.detail}</p>
	</div>

	{#if application}
		<div class="application-strip">
			<ClipboardCheck size={14} />
			<span>{applicationStatusLabels[application.status]}</span>
			<small>{file.tasksCompleted}/{file.tasksTotal || 0} tasks</small>
		</div>
	{:else if file.blockers[0]}
		<div class="application-strip warning">
			<ShieldAlert size={14} />
			<span>{file.blockers[0].label}</span>
			<small>Needs proof</small>
		</div>
	{/if}

	<div class="mt-4 flex flex-wrap items-center gap-2">
		<button class="ink-link" type="button" onclick={() => onOpen?.(file)}>
			Review file
		</button>
		{#if application}
			<a class="icon-action" href={primaryUrl} target="_blank" rel="noreferrer">
				<ArrowUpRight size={14} />
				Apply
			</a>
		{:else}
			<button class="icon-action" type="button" disabled={busy} onclick={() => onTrack?.(file)}>
				{#if busy}<Loader2 class="spin" size={14} />{:else}<Play size={14} />{/if}
				Track
			</button>
		{/if}
		{#if onSave || onUnsave}
			<button
				class="icon-action"
				type="button"
				disabled={busy}
				aria-pressed={file.isSaved}
				onclick={() => (file.isSaved ? onUnsave?.(file) : onSave?.(file))}
			>
				{#if busy}<Loader2 class="spin" size={14} />{:else}<Bookmark class={file.isSaved ? 'filled' : ''} size={14} />{/if}
				{file.isSaved ? 'Saved' : 'Save'}
			</button>
		{/if}
	</div>

	{#if onMove}
		<label class="move-menu">
			<span><MoveRight size={13} /> Move</span>
			<select value={bucket} onchange={(event) => onMove?.(file, event.currentTarget.value as NotebookBucket)}>
				<option value="needs-proof">Needs Proof</option>
				<option value="apply-track">Apply Track</option>
				<option value="watchlist">Watchlist</option>
			</select>
		</label>
	{/if}
</article>

<style>
	.notebook-file {
		position: relative;
		min-height: 100%;
		overflow: hidden;
		border: 1px solid rgba(185, 157, 98, 0.46);
		background: linear-gradient(180deg, #f3ead5, #e8dcc2 62%, #dfd0ad);
		box-shadow: 0 18px 35px rgba(0, 0, 0, 0.22), 2px 3px 0 #7d6d47;
		color: #302f27;
		padding: 1rem;
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
	}

	.notebook-file:hover,
	.notebook-file:focus-within {
		transform: translateY(-4px) rotate(-0.18deg);
		border-color: #c1a567;
		box-shadow: 0 28px 55px rgba(0, 0, 0, 0.3), 5px 8px 0 #6e5f3d;
	}

	.notebook-file::before {
		content: "";
		position: absolute;
		inset: 0 0 auto;
		height: 5px;
		background: linear-gradient(90deg, rgba(117, 100, 63, 0.75), transparent 72%);
	}

	.tape {
		position: absolute;
		right: 1.4rem;
		top: -0.45rem;
		height: 1.2rem;
		width: 3.8rem;
		rotate: 2deg;
		background: rgba(201, 170, 94, 0.75);
	}

	.file-kicker {
		font: 800 0.62rem/1.2 "IBM Plex Mono", monospace;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #75643f;
	}

	h3 {
		margin-top: 0.65rem;
		font: 650 1.25rem/1.05 "Newsreader Variable", serif;
		color: #282821;
	}

	.provider {
		margin-top: 0.35rem;
		font-size: 0.8rem;
		line-height: 1.35;
		color: #706653;
	}

	.metric {
		border: 1px solid #d3c29d;
		background: #e5d9be;
		padding: 0.55rem 0.35rem;
		text-align: center;
	}

	.metric.warn {
		background: #ead8cb;
		border-color: #c49d8c;
	}

	.metric strong,
	.metric span {
		display: block;
	}

	.metric strong {
		font: 700 1rem/1 "IBM Plex Mono", monospace;
	}

	.metric span {
		margin-top: 0.2rem;
		font-size: 0.5rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #766a54;
	}

	.file-rule {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin-top: 0.9rem;
		border-block: 1px solid #d2c19b;
	}

	.file-rule > div {
		padding: 0.75rem 0.65rem 0.75rem 0;
	}

	.file-rule > div + div {
		border-left: 1px solid #d2c19b;
		padding-left: 0.65rem;
	}

	.file-rule p,
	.next-action span,
	.move-menu span {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font: 800 0.58rem/1.2 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: #806b40;
	}

	.file-rule strong {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.8rem;
		line-height: 1.25;
		color: #4b4435;
	}

	.file-rule strong.urgent {
		color: #9b5c4b;
	}

	.file-rule strong.closed {
		color: #756a54;
		text-decoration: line-through;
	}

	.next-action {
		margin-top: 0.9rem;
		border: 1px solid #d3c29d;
		background: #e8dcc0;
		padding: 0.7rem;
	}

	.next-action strong {
		display: block;
		margin-top: 0.35rem;
		font: 750 0.82rem/1.25 "Instrument Sans Variable", sans-serif;
		color: #3f382b;
	}

	.next-action p {
		margin-top: 0.25rem;
		font-size: 0.76rem;
		line-height: 1.35;
		color: #6b5f4a;
	}

	.application-strip {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin-top: 0.8rem;
		border-left: 2px solid #7d896a;
		background: #dfe3c8;
		padding: 0.55rem 0.65rem;
		font: 750 0.72rem/1 "Instrument Sans Variable", sans-serif;
		color: #4c573c;
	}

	.application-strip.warning {
		border-left-color: #9b5c4b;
		background: #ead8cb;
		color: #744838;
	}

	.application-strip small {
		margin-left: auto;
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.72;
	}

	.ink-link,
	.icon-action {
		display: inline-flex;
		min-height: 2.25rem;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid transparent;
		background: transparent;
		font: 850 0.68rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #654d29;
	}

	.ink-link {
		text-decoration: underline;
		text-decoration-color: #c69a44;
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}

	.icon-action {
		border-color: #c9b98f;
		padding-inline: 0.55rem;
		color: #5c563f;
		text-decoration: none;
	}

	.move-menu {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.7rem;
	}

	.move-menu select {
		min-width: 0;
		border: 1px solid #c9b98f;
		background: #eadfc8;
		padding: 0.5rem;
		font: 750 0.72rem/1 "Instrument Sans Variable", sans-serif;
		color: #4d4738;
	}

	button:focus-visible,
	a:focus-visible,
	select:focus-visible {
		outline: 2px solid #7d896a;
		outline-offset: 3px;
	}

	.filled {
		fill: currentColor;
	}

	.spin {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.notebook-file,
		.spin {
			transition: none;
			animation: none;
		}

		.notebook-file:hover,
		.notebook-file:focus-within {
			transform: none;
		}
	}
</style>
