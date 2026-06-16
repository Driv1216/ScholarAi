<script lang="ts">
	import { goto } from '$app/navigation';
	import { upsertProfile, type StudentProfileInput } from '$lib/api/profile';
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
		if (profileError instanceof Error) {
			return profileError.message;
		}

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

<main class="min-h-screen bg-[#0f1117] px-6 py-10 text-white/80">
	<section class="mx-auto w-full max-w-2xl rounded-xl border border-white/[0.07] bg-[#1a1d27] p-8">
		<div class="mb-8">
			<h1 class="text-xl font-semibold text-white">Set up your profile</h1>
			<div class="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
				<div class="h-full rounded-full bg-indigo-500 transition-all" style={`width: ${(step / 3) * 100}%`}></div>
			</div>
			<p class="mt-2 text-sm text-white/40">Step {step} of 3</p>
		</div>

		{#if step === 1}
			<div class="space-y-4">
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Full name</span>
					<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.full_name} type="text" required />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Nationality</span>
					<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.nationality} type="text" required />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Current country</span>
					<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.current_country} type="text" required />
				</label>
			</div>
		{:else if step === 2}
			<div class="space-y-4">
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Degree level</span>
					<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.degree_level} required>
						<option value="" disabled>Select degree level</option>
						<option value="bachelors">Bachelors</option>
						<option value="masters">Masters</option>
						<option value="phd">PhD</option>
						<option value="other">Other</option>
					</select>
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Field of study</span>
					<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.field_of_study} type="text" required />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">CGPA</span>
					<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.cgpa} type="number" min="0" step="0.01" />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="mb-1.5 text-xs text-white/50">Income range</span>
					<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.income_range} required>
						<option value="" disabled>Select income range</option>
						<option>Below 3LPA</option>
						<option>3-6LPA</option>
						<option>6-10LPA</option>
						<option>Above 10LPA</option>
						<option>Prefer not to say</option>
					</select>
				</label>
				<div class="flex flex-col gap-1.5">
					<p class="mb-1.5 text-xs text-white/50">Target countries</p>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each countryOptions as country}
							<label class="flex items-center gap-3 rounded-lg border border-white/[0.07] px-4 py-3">
								<input
									class="accent-indigo-500"
									type="checkbox"
									checked={form.target_countries.includes(country)}
									onchange={() => toggleArrayValue('target_countries', country)}
								/>
								<span class="text-xs text-white/50">{country}</span>
							</label>
						{/each}
					</div>
				</div>
				<div class="flex flex-col gap-1.5">
					<p class="mb-1.5 text-xs text-white/50">Target degrees</p>
					<div class="grid gap-3 sm:grid-cols-2">
						{#each degreeOptions as degree}
							<label class="flex items-center gap-3 rounded-lg border border-white/[0.07] px-4 py-3">
								<input
									class="accent-indigo-500"
									type="checkbox"
									checked={form.target_degrees.includes(degree)}
									onchange={() => toggleArrayValue('target_degrees', degree)}
								/>
								<span class="text-xs text-white/50">{degree}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>
		{:else}
			<div class="space-y-3">
				{#each documentOptions as document}
					<label class="label cursor-pointer justify-start gap-3">
						<input
							class="accent-indigo-500"
							type="checkbox"
							bind:group={form.documents_available}
							value={document.value}
						/>
						<span class="text-xs text-white/50">{document.label}</span>
					</label>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 mt-6 text-sm">{error}</p>
		{/if}

		<div class="mt-8 flex justify-between gap-3">
			<button class="rounded-lg px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70" type="button" onclick={previousStep} disabled={step === 1 || loading}>
				Back
			</button>
			{#if step < 3}
				<button class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600" type="button" onclick={nextStep}>Next</button>
			{:else}
				<button class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600" type="button" onclick={submitProfile} disabled={loading}>
					{loading ? 'Saving...' : 'Submit'}
				</button>
			{/if}
		</div>
	</section>
</main>
