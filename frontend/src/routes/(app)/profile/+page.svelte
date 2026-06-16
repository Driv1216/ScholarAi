<script lang="ts">
	import { onMount } from 'svelte';
	import { getProfile, upsertProfile, type StudentProfileInput } from '$lib/api/profile';
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

		return fallback;
	}
</script>

<main class="min-h-screen bg-[#0f1117] py-10">
	<section class="mx-auto w-full max-w-2xl px-6">
		<div class="mb-8">
			<h1 class="text-xl font-semibold text-white">Edit profile</h1>
			<p class="mt-1 text-sm text-white/40">Keep your scholarship profile up to date.</p>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<div class="mx-auto h-8 w-8 animate-pulse rounded-full bg-indigo-500/40"></div>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<div class="mb-5 border-b border-white/[0.06] pb-4">
					<h2 class="text-sm font-medium text-white/70">Personal information</h2>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="flex flex-col gap-1.5 sm:col-span-2">
						<span class="text-xs text-white/50">Full name</span>
						<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.full_name} type="text" required />
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">Nationality</span>
						<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.nationality} type="text" required />
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">Current country</span>
						<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.current_country} type="text" required />
					</label>
				</div>

				<div class="my-6 border-t border-white/[0.06]"></div>
				<div class="mb-5">
					<h2 class="text-sm font-medium text-white/70">Academic information</h2>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">Degree level</span>
						<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.degree_level} required>
							<option value="" disabled>Select degree level</option><option value="bachelors">Bachelors</option><option value="masters">Masters</option><option value="phd">PhD</option><option value="other">Other</option>
						</select>
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">Field of study</span>
						<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.field_of_study} type="text" required />
					</label>
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">CGPA</span>
						<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.cgpa} type="number" min="0" step="0.01" />
					</label>
				</div>

				<div class="my-6 border-t border-white/[0.06]"></div>
				<div class="mb-5">
					<h2 class="text-sm font-medium text-white/70">Financial &amp; goals</h2>
				</div>
				<div class="space-y-5">
					<label class="flex flex-col gap-1.5">
						<span class="text-xs text-white/50">Income range</span>
						<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.income_range} required>
							<option value="" disabled>Select income range</option><option>Below 3LPA</option><option>3-6LPA</option><option>6-10LPA</option><option>Above 10LPA</option><option>Prefer not to say</option>
						</select>
					</label>
					<div>
						<p class="mb-2 text-xs text-white/50">Target countries</p>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each countryOptions as country}
								<label class="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#12151e] px-4 py-3 text-sm text-white/80">
									<input class="accent-indigo-500" type="checkbox" checked={form.target_countries.includes(country)} onchange={() => toggleArrayValue('target_countries', country)} />
									{country}
								</label>
							{/each}
						</div>
					</div>
					<div>
						<p class="mb-2 text-xs text-white/50">Target degrees</p>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each degreeOptions as degree}
								<label class="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#12151e] px-4 py-3 text-sm text-white/80">
									<input class="accent-indigo-500" type="checkbox" checked={form.target_degrees.includes(degree)} onchange={() => toggleArrayValue('target_degrees', degree)} />
									{degree}
								</label>
							{/each}
						</div>
					</div>
					<div>
						<p class="mb-2 text-xs text-white/50">Documents available</p>
						<div class="grid gap-3 sm:grid-cols-2">
							{#each documentOptions as document}
								<label class="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#12151e] px-4 py-3 text-sm text-white/80">
									<input class="accent-indigo-500" type="checkbox" bind:group={form.documents_available} value={document.value} />
									{document.label}
								</label>
							{/each}
						</div>
					</div>
				</div>

				{#if error}
					<p class="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
				{/if}

				<div class="mt-8 flex justify-end">
					<button class="w-full rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 sm:w-auto" type="submit" disabled={saving}>
						{saving ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</form>
		{/if}
	</section>

	{#if saved}
		<div class="fixed bottom-6 right-6">
			<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-400">
				<span>Profile saved</span>
			</div>
		</div>
	{/if}
</main>
