<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, ArrowRight, Check, FileCheck2, Loader2, UserRound } from '@lucide/svelte';
	import { upsertProfile, type StudentProfileInput } from '$lib/api/profile';
	import { calculateNotebookProfileCompleteness } from '$lib/notebook/model';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const countryOptions = ['Germany', 'UK', 'Canada', 'USA', 'Australia'];
	const degreeOptions = ['Masters', 'PhD'];
	const documentOptions = [
		{ label: 'Passport', value: 'passport' },
		{ label: 'Transcripts', value: 'transcripts' },
		{ label: 'Degree Certificate', value: 'degree_certificate' },
		{ label: 'English Test Score', value: 'english_test_score' },
		{ label: 'Recommendation Letters', value: 'recommendation_letters' },
		{ label: 'Statement of Purpose', value: 'statement_of_purpose' },
		{ label: 'CV/Resume', value: 'cv_resume' }
	];

	let step = $state(1);
	let loading = $state(false);
	let error = $state('');
	let form = $state<StudentProfileInput>({
		full_name: '',
		nationality: '',
		current_country: '',
		degree_level: '',
		field_of_study: '',
		cgpa: null,
		income_range: '',
		target_countries: [],
		target_degrees: [],
		documents_available: []
	});

	const completeness = $derived(calculateNotebookProfileCompleteness(form));

	function nextStep() {
		step = Math.min(step + 1, 3);
	}

	function previousStep() {
		step = Math.max(step - 1, 1);
	}

	function toggleArrayValue(field: 'target_countries' | 'target_degrees', value: string) {
		form[field] = form[field].includes(value)
			? form[field].filter((item) => item !== value)
			: [...form[field], value];
	}

	function getErrorMessage(profileError: unknown) {
		if (profileError instanceof Error) return profileError.message;

		if (
			typeof profileError === 'object' &&
			profileError !== null &&
			'message' in profileError &&
			typeof profileError.message === 'string'
		) {
			return profileError.message;
		}

		return 'Could not save profile';
	}

	async function submitProfile() {
		error = '';
		loading = true;

		try {
			await upsertProfile(data.user.id, form);
			await goto('/dashboard');
		} catch (profileError) {
			error = getErrorMessage(profileError);
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Set Up Profile Folio · ScholarAI</title>
</svelte:head>

<main class="min-h-screen overflow-x-hidden bg-[#07110d] px-4 py-6 sm:px-6 lg:px-8">
	<section class="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
		<aside class="setup-brief">
			<p class="flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">
				<UserRound size={15} />
				Profile Folio setup
			</p>
			<h1>Assemble the first packet.</h1>
			<p class="brief-copy">Three passes: identity, academic goals, and documents. This is the same production profile saved through the existing Supabase path.</p>

			<div class="setup-meter">
				<span>Readiness</span>
				<strong>{completeness.percent}%</strong>
				<div><i style={`width: ${completeness.percent}%`}></i></div>
			</div>

			<div class="steps">
				{#each [
					{ id: 1, label: 'Identity' },
					{ id: 2, label: 'Goals' },
					{ id: 3, label: 'Documents' }
				] as item}
					<button type="button" class:active={step === item.id} onclick={() => step = item.id}>
						<span>{item.id}</span>
						{item.label}
					</button>
				{/each}
			</div>
		</aside>

		<section class="setup-panel">
			<div class="panel-heading">
				<p>Step {step} of 3</p>
				<h2>{step === 1 ? 'Identity' : step === 2 ? 'Academic record and goals' : 'Document packet'}</h2>
			</div>

			{#if step === 1}
				<div class="field-grid">
					<label class="field sm:col-span-2">
						<span>Full name</span>
						<input bind:value={form.full_name} type="text" required />
					</label>
					<label class="field">
						<span>Nationality</span>
						<input bind:value={form.nationality} type="text" required />
					</label>
					<label class="field">
						<span>Current country</span>
						<input bind:value={form.current_country} type="text" required />
					</label>
				</div>
			{:else if step === 2}
				<div class="field-grid">
					<label class="field">
						<span>Degree level</span>
						<select bind:value={form.degree_level} required>
							<option value="" disabled>Select degree level</option>
							<option value="bachelors">Bachelors</option>
							<option value="masters">Masters</option>
							<option value="phd">PhD</option>
							<option value="other">Other</option>
						</select>
					</label>
					<label class="field">
						<span>Field of study</span>
						<input bind:value={form.field_of_study} type="text" required />
					</label>
					<label class="field">
						<span>CGPA</span>
						<input bind:value={form.cgpa} type="number" min="0" step="0.01" />
					</label>
					<label class="field">
						<span>Income range</span>
						<select bind:value={form.income_range} required>
							<option value="" disabled>Select income range</option>
							<option>Below 3LPA</option>
							<option>3-6LPA</option>
							<option>6-10LPA</option>
							<option>Above 10LPA</option>
							<option>Prefer not to say</option>
						</select>
					</label>
				</div>

				<div class="choice-grid">
					<div>
						<p class="choice-label">Target countries</p>
						<div class="choices">
							{#each countryOptions as country}
								<label>
									<input type="checkbox" checked={form.target_countries.includes(country)} onchange={() => toggleArrayValue('target_countries', country)} />
									<span>{country}</span>
								</label>
							{/each}
						</div>
					</div>
					<div>
						<p class="choice-label">Target degrees</p>
						<div class="choices">
							{#each degreeOptions as degree}
								<label>
									<input type="checkbox" checked={form.target_degrees.includes(degree)} onchange={() => toggleArrayValue('target_degrees', degree)} />
									<span>{degree}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>
			{:else}
				<div class="packet-intro">
					<FileCheck2 size={18} />
					<p>Select every document that is currently available. Missing pieces will become readiness blockers on the Desk.</p>
				</div>
				<div class="choices document-grid">
					{#each documentOptions as document}
						<label>
							<input type="checkbox" bind:group={form.documents_available} value={document.value} />
							<span>{document.label}</span>
						</label>
					{/each}
				</div>
			{/if}

			{#if error}
				<p class="mt-5 border-l-2 border-[#9b5c4b] bg-[#2a1815] px-4 py-3 text-sm text-[#e0aa98]">{error}</p>
			{/if}

			<div class="setup-actions">
				<button type="button" onclick={previousStep} disabled={step === 1 || loading}>
					<ArrowLeft size={14} />
					Back
				</button>
				{#if step < 3}
					<button class="primary" type="button" onclick={nextStep}>
						Next
						<ArrowRight size={14} />
					</button>
				{:else}
					<button class="primary" type="button" onclick={submitProfile} disabled={loading}>
						{#if loading}<Loader2 class="spin" size={14} />{:else}<Check size={14} />{/if}
						{loading ? 'Saving' : 'Submit'}
					</button>
				{/if}
			</div>
		</section>
	</section>
</main>

<style>
	.setup-brief,
	.setup-panel {
		border: 1px solid rgba(185, 157, 98, 0.3);
		background: linear-gradient(135deg, rgba(18, 37, 28, 0.96), rgba(6, 17, 13, 0.96));
		box-shadow: 4px 6px 0 #4d432d;
	}

	.setup-brief {
		padding: 1.25rem;
	}

	.setup-brief h1 {
		margin-top: 1rem;
		font: 650 clamp(2.6rem, 6vw, 4.7rem) / 0.84 "Newsreader Variable", serif;
		letter-spacing: -0.05em;
		color: #fff1cf;
	}

	.brief-copy {
		margin-top: 1rem;
		font-size: 0.9rem;
		line-height: 1.55;
		color: #9aa69d;
	}

	.setup-meter {
		margin-top: 1.5rem;
		border: 1px solid rgba(185, 157, 98, 0.25);
		background: rgba(7, 17, 13, 0.62);
		padding: 1rem;
	}

	.setup-meter span,
	.panel-heading p,
	.field span,
	.choice-label {
		font: 850 0.62rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #c1a567;
	}

	.setup-meter strong {
		display: block;
		margin-top: 0.45rem;
		font: 700 2rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.setup-meter div {
		margin-top: 0.8rem;
		height: 0.6rem;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: #07110d;
	}

	.setup-meter i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #7d896a, #c1a567);
	}

	.steps {
		display: grid;
		gap: 0.55rem;
		margin-top: 1.2rem;
	}

	.steps button {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		border: 1px solid rgba(185, 157, 98, 0.24);
		background: rgba(7, 17, 13, 0.55);
		padding: 0.75rem;
		text-align: left;
		font-weight: 800;
		color: #aab5ad;
	}

	.steps button.active {
		border-color: #c1a567;
		background: #c1a567;
		color: #07110d;
	}

	.steps span {
		display: grid;
		height: 1.45rem;
		width: 1.45rem;
		place-items: center;
		border: 1px solid currentColor;
		font: 700 0.78rem/1 "IBM Plex Mono", monospace;
	}

	.setup-panel {
		padding: clamp(1rem, 3vw, 1.75rem);
	}

	.panel-heading {
		border-bottom: 1px solid rgba(185, 157, 98, 0.18);
		padding-bottom: 1rem;
	}

	.panel-heading h2 {
		margin-top: 0.4rem;
		font: 650 2rem/1 "Newsreader Variable", serif;
		color: #fff1cf;
	}

	.field-grid,
	.choice-grid,
	.document-grid {
		display: grid;
		gap: 0.85rem;
		margin-top: 1rem;
	}

	@media (min-width: 720px) {
		.field-grid,
		.choice-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.document-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.field {
		display: grid;
		gap: 0.45rem;
	}

	.field input,
	.field select {
		min-height: 2.9rem;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: #07110d;
		padding: 0.7rem 0.85rem;
		color: #f3ead5;
	}

	.choices {
		display: grid;
		gap: 0.65rem;
		margin-top: 0.65rem;
	}

	.choices label {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		border: 1px solid rgba(185, 157, 98, 0.24);
		background: rgba(7, 17, 13, 0.55);
		padding: 0.8rem;
		color: #d7ccb4;
		font-size: 0.88rem;
	}

	.choices input {
		accent-color: #c1a567;
	}

	.packet-intro {
		display: flex;
		gap: 0.65rem;
		margin-top: 1rem;
		border-left: 2px solid #c1a567;
		background: #13231b;
		padding: 0.85rem;
		color: #d7ccb4;
	}

	.packet-intro p {
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.setup-actions {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.setup-actions button {
		display: inline-flex;
		min-height: 2.65rem;
		align-items: center;
		gap: 0.4rem;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: transparent;
		padding-inline: 0.85rem;
		font: 850 0.7rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #e5d7b8;
	}

	.setup-actions button.primary {
		border-color: #c1a567;
		background: #c1a567;
		color: #07110d;
	}

	:global(.spin) {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.spin) {
			animation: none;
		}
	}
</style>
