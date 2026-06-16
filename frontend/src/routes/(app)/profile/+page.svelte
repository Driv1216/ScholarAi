<script lang="ts">
	import { onMount } from 'svelte';
	import { FileCheck2, FolderOpen, Loader2, Save, UserRound } from '@lucide/svelte';
	import { getProfile, upsertProfile, type StudentProfileInput } from '$lib/api/profile';
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

	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let saved = $state(false);
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

	onMount(async () => {
		try {
			const profile = await getProfile(data.user.id);

			if (profile) {
				form = {
					full_name: profile.full_name,
					nationality: profile.nationality,
					current_country: profile.current_country,
					degree_level: profile.degree_level,
					field_of_study: profile.field_of_study,
					cgpa: profile.cgpa,
					income_range: profile.income_range,
					target_countries: profile.target_countries ?? [],
					target_degrees: profile.target_degrees ?? [],
					documents_available: profile.documents_available ?? []
				};
			}
		} catch (profileError) {
			error = getErrorMessage(profileError, 'Could not load profile');
		} finally {
			loading = false;
		}
	});

	async function saveProfile() {
		error = '';
		saved = false;
		saving = true;

		try {
			await upsertProfile(data.user.id, form);
			saved = true;
		} catch (profileError) {
			error = getErrorMessage(profileError, 'Could not save profile');
		} finally {
			saving = false;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		void saveProfile();
	}

	function toggleArrayValue(field: 'target_countries' | 'target_degrees', value: string) {
		form[field] = form[field].includes(value)
			? form[field].filter((item) => item !== value)
			: [...form[field], value];
	}

	function getErrorMessage(profileError: unknown, fallback: string) {
		if (profileError instanceof Error) return profileError.message;

		if (
			typeof profileError === 'object' &&
			profileError !== null &&
			'message' in profileError &&
			typeof profileError.message === 'string'
		) {
			return profileError.message;
		}

		return fallback;
	}
</script>

<svelte:head>
	<title>Profile Folio · ScholarAI</title>
</svelte:head>

<main class="min-h-screen overflow-x-hidden bg-[#07110d]">
	<section class="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
		<header class="border border-[#b99d62]/30 bg-[#111f18] p-5 shadow-[4px_6px_0_#4d432d] sm:p-7">
			<p class="flex items-center gap-2 font-[IBM_Plex_Mono] text-[10px] uppercase tracking-[0.18em] text-[#c1a567]">
				<UserRound size={15} />
				Profile Folio
			</p>
			<div class="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
				<div>
					<h1 class="font-[Newsreader_Variable] text-4xl font-medium leading-[0.95] tracking-[-0.04em] text-[#fff1cf] sm:text-6xl">
						Assemble the reusable scholarship packet.
					</h1>
					<p class="mt-4 max-w-2xl text-sm leading-6 text-[#9aa69d]">
						These fields are the production profile data used to judge fit, blockers, and readiness across the research desk.
					</p>
				</div>
				<div class="folio-meter">
					<span>Folio readiness</span>
					<strong>{completeness.percent}%</strong>
					<div><i style={`width: ${completeness.percent}%`}></i></div>
				</div>
			</div>
		</header>

		{#if loading}
			<div class="mt-8 grid min-h-72 place-items-center border border-[#b99d62]/25 bg-[#0c1812]">
				<Loader2 class="spin text-[#c1a567]" size={30} />
			</div>
		{:else}
			<form class="mt-8 grid gap-6" onsubmit={handleSubmit}>
				<section class="folio-section">
					<div class="section-title">
						<FolderOpen size={17} />
						<div>
							<p>Identity</p>
							<h2>Who the file belongs to</h2>
						</div>
					</div>
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
				</section>

				<section class="folio-section">
					<div class="section-title">
						<FileCheck2 size={17} />
						<div>
							<p>Academic Record</p>
							<h2>Evidence of fit</h2>
						</div>
					</div>
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
					</div>
				</section>

				<section class="folio-section">
					<div class="section-title">
						<FolderOpen size={17} />
						<div>
							<p>Destination Goals</p>
							<h2>Where the packet should travel</h2>
						</div>
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
				</section>

				<section class="folio-section">
					<div class="section-title">
						<FolderOpen size={17} />
						<div>
							<p>Funding Context</p>
							<h2>Financial background</h2>
						</div>
					</div>
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
				</section>

				<section class="folio-section">
					<div class="section-title">
						<FileCheck2 size={17} />
						<div>
							<p>Document Packet</p>
							<h2>Reusable proof on hand</h2>
						</div>
					</div>
					<div class="choices document-grid">
						{#each documentOptions as document}
							<label>
								<input type="checkbox" bind:group={form.documents_available} value={document.value} />
								<span>{document.label}</span>
							</label>
						{/each}
					</div>
				</section>

				{#if error}
					<p class="border-l-2 border-[#9b5c4b] bg-[#2a1815] px-4 py-3 text-sm text-[#e0aa98]">{error}</p>
				{/if}

				<div class="sticky bottom-4 z-10 flex justify-end">
					<button class="save-button" type="submit" disabled={saving}>
						{#if saving}<Loader2 class="spin" size={15} />{:else}<Save size={15} />{/if}
						{saving ? 'Saving' : 'Save changes'}
					</button>
				</div>
			</form>
		{/if}
	</section>

	{#if saved}
		<div class="fixed bottom-6 right-6 z-50 border border-[#7d896a]/50 bg-[#13231b] px-4 py-3 text-sm font-semibold text-[#dfe3c8] shadow-[3px_4px_0_#4d432d]">
			Profile saved
		</div>
	{/if}
</main>

<style>
	.folio-meter {
		border: 1px solid rgba(185, 157, 98, 0.25);
		background: rgba(7, 17, 13, 0.62);
		padding: 1rem;
	}

	.folio-meter span,
	.section-title p,
	.choice-label,
	.field span {
		font: 850 0.62rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #c1a567;
	}

	.folio-meter strong {
		display: block;
		margin-top: 0.45rem;
		font: 700 2rem/1 "IBM Plex Mono", monospace;
		color: #f2ddb0;
	}

	.folio-meter div {
		margin-top: 0.8rem;
		height: 0.6rem;
		border: 1px solid rgba(185, 157, 98, 0.35);
		background: #07110d;
	}

	.folio-meter i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #7d896a, #c1a567);
	}

	.folio-section {
		border: 1px solid rgba(185, 157, 98, 0.28);
		background: linear-gradient(135deg, rgba(18, 37, 28, 0.96), rgba(6, 17, 13, 0.96));
		padding: 1rem;
		box-shadow: 3px 4px 0 rgba(93, 80, 49, 0.55);
	}

	.section-title {
		display: flex;
		gap: 0.75rem;
		border-bottom: 1px solid rgba(185, 157, 98, 0.18);
		padding-bottom: 0.85rem;
		color: #c1a567;
	}

	.section-title h2 {
		margin-top: 0.35rem;
		font: 650 1.65rem/1 "Newsreader Variable", serif;
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
			grid-template-columns: repeat(3, minmax(0, 1fr));
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

	.save-button {
		display: inline-flex;
		min-height: 2.85rem;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid #c1a567;
		background: #c1a567;
		padding-inline: 1rem;
		font: 850 0.7rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #07110d;
		box-shadow: 3px 4px 0 #4d432d;
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
