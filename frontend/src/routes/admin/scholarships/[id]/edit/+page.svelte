<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	interface CriteriaInput {
		criterion_type: string;
		operator: string;
		value: string;
		required: boolean;
	}

	interface ScholarshipInput {
		name: string;
		provider: string;
		official_url: string;
		country: string;
		degree_level: string;
		fields: string;
		award_amount: string;
		deadline: string;
		application_url: string;
		trust_score: number;
		status: string;
		verified_by: string | null;
		last_verified_at: string | null;
	}

	interface ScholarshipResponse {
		id: string;
		name: string;
		provider: string;
		official_url: string;
		country: string | null;
		degree_level: string | null;
		fields: string[];
		award_amount: string | null;
		deadline: string | null;
		application_url: string | null;
		trust_score: number;
		status: string;
		verified_by: string | null;
		last_verified_at: string | null;
		scholarship_criteria: CriteriaInput[];
	}

	const countries = ['Germany', 'UK', 'Canada', 'USA', 'Australia'];
	const degreeLevels = ['bachelors', 'masters', 'phd', 'any'];
	const statuses = ['draft', 'pending_review', 'verified'];
	const criterionTypes = ['nationality', 'cgpa', 'degree_level', 'field', 'income'];
	const operators = ['eq', 'gte', 'lte', 'in', 'contains'];

	let form = $state<ScholarshipInput>({
		name: '',
		provider: '',
		official_url: '',
		country: 'Germany',
		degree_level: 'masters',
		fields: '',
		award_amount: '',
		deadline: '',
		application_url: '',
		trust_score: 50,
		status: 'draft',
		verified_by: null,
		last_verified_at: null
	});
	let criteria = $state<CriteriaInput[]>([
		{ criterion_type: 'nationality', operator: 'eq', value: '', required: true }
	]);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state('');
	let officialUrlVisited = $state(false);
	let visitedUrl = $state('');

	onMount(async () => {
		try {
			const response = await fetch(
				new URL(`/admin/scholarships/${$page.params.id}`, PUBLIC_BACKEND_URL)
			);
			if (!response.ok) {
				throw new Error(`Could not load scholarship: ${response.status}`);
			}

			const scholarship = (await response.json()) as ScholarshipResponse;
			form = {
				name: scholarship.name,
				provider: scholarship.provider,
				official_url: scholarship.official_url,
				country: scholarship.country ?? 'Germany',
				degree_level: scholarship.degree_level ?? 'any',
				fields: (scholarship.fields ?? []).join(', '),
				award_amount: scholarship.award_amount ?? '',
				deadline: scholarship.deadline ?? '',
				application_url: scholarship.application_url ?? '',
				trust_score: scholarship.trust_score,
				status: scholarship.status,
				verified_by: scholarship.verified_by,
				last_verified_at: scholarship.last_verified_at
			};
			criteria =
				scholarship.scholarship_criteria.length > 0
					? scholarship.scholarship_criteria.map((criterion) => ({
							criterion_type: criterion.criterion_type,
							operator: criterion.operator,
							value: criterion.value,
							required: criterion.required
						}))
					: [{ criterion_type: 'nationality', operator: 'eq', value: '', required: true }];
		} catch (loadError) {
			error = loadError instanceof Error ? loadError.message : 'Could not load scholarship';
		} finally {
			loading = false;
		}
	});

	function addCriteria() {
		criteria = [
			...criteria,
			{ criterion_type: 'nationality', operator: 'eq', value: '', required: true }
		];
	}

	function removeCriteria(index: number) {
		criteria = criteria.filter((_, currentIndex) => currentIndex !== index);
	}

	function markOfficialUrlVisited() {
		officialUrlVisited = true;
		visitedUrl = form.official_url;
	}

	function fieldsArray() {
		return form.fields
			.split(',')
			.map((field) => field.trim())
			.filter(Boolean);
	}

	async function saveScholarship(redirectAfterSave = true) {
		error = '';

		if (!officialUrlVisited || visitedUrl !== form.official_url) {
			error = 'Visit the official URL before submitting this scholarship.';
			return;
		}

		saving = true;
		try {
			const response = await fetch(
				new URL(`/admin/scholarships/${$page.params.id}`, PUBLIC_BACKEND_URL),
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...form,
						fields: fieldsArray(),
						award_amount: form.award_amount || null,
						deadline: form.deadline || null,
						application_url: form.application_url || null,
						scholarship_criteria: criteria.filter((criterion) => criterion.value.trim())
					})
				}
			);

			if (!response.ok) {
				throw new Error(`Could not update scholarship: ${response.status}`);
			}

			if (redirectAfterSave) {
				await goto('/admin/scholarships');
			}
		} catch (submitError) {
			error = submitError instanceof Error ? submitError.message : 'Could not update scholarship';
		} finally {
			saving = false;
		}
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		void saveScholarship();
	}

	async function markAsVerified() {
		form.status = 'verified';
		form.last_verified_at = new Date().toISOString();
		await saveScholarship();
	}
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8 text-white/80">
	<section class="mx-auto w-full max-w-5xl">
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold text-white">Edit scholarship</h1>
				<p class="mt-1 text-sm text-white/40">Update scholarship details and eligibility criteria.</p>
			</div>
			<a class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white" href="/admin/scholarships">Back to list</a>
		</div>

		{#if loading}
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-12 text-center">
				<div class="mx-auto h-8 w-8 animate-pulse rounded-full bg-indigo-500/40"></div>
			</div>
		{:else}
			<form class="space-y-6" onsubmit={handleSubmit}>
				<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-6">
					<div class="grid gap-4 md:grid-cols-2">
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Name</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.name} type="text" required />
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Provider</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.provider} type="text" required />
						</label>
						<div class="flex flex-col gap-1.5 md:col-span-2">
							<span class="mb-1.5 text-xs text-white/50">Official URL</span>
							<div class="join w-full">
								<input
									class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none"
									bind:value={form.official_url}
									type="url"
									required
									oninput={() => (officialUrlVisited = false)}
								/>
								<a
									class={`rounded-lg border border-white/[0.10] px-4 py-2 text-sm text-white/60 transition-colors ${form.official_url ? 'hover:bg-white/[0.05] hover:text-white' : 'pointer-events-none opacity-40'}`}
									href={form.official_url || undefined}
									target="_blank"
									rel="noreferrer"
									onclick={markOfficialUrlVisited}
								>
									Visit
								</a>
							</div>
							{#if officialUrlVisited && visitedUrl === form.official_url}
								<span class="text-xs mt-2 text-emerald-400">Official URL visited.</span>
							{/if}
						</div>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Country</span>
							<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.country}>
								{#each countries as country}
									<option value={country}>{country}</option>
								{/each}
							</select>
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Degree level</span>
							<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.degree_level}>
								{#each degreeLevels as degree}
									<option value={degree}>{degree}</option>
								{/each}
							</select>
						</label>
						<label class="flex flex-col gap-1.5 md:col-span-2">
							<span class="mb-1.5 text-xs text-white/50">Fields</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.fields} type="text" />
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Award amount</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.award_amount} type="text" />
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Deadline</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.deadline} type="date" />
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Application URL</span>
							<input class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.application_url} type="url" />
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Trust score</span>
							<input
								class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none"
								bind:value={form.trust_score}
								type="number"
								min="0"
								max="100"
							/>
						</label>
						<label class="flex flex-col gap-1.5">
							<span class="mb-1.5 text-xs text-white/50">Status</span>
							<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={form.status}>
								{#each statuses as status}
									<option value={status}>{status}</option>
								{/each}
							</select>
						</label>
					</div>
				</div>

				<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-6">
					<div class="mb-4 flex items-center justify-between gap-4">
						<h2 class="text-xl font-bold">Criteria</h2>
						<button class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white" type="button" onclick={addCriteria}>
							Add criteria
						</button>
					</div>
					<div class="space-y-3">
						{#each criteria as criterion, index}
							<div class="grid gap-3 rounded-xl border border-white/[0.07] p-4 md:grid-cols-5">
								<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={criterion.criterion_type}>
									{#each criterionTypes as type}
										<option value={type}>{type}</option>
									{/each}
								</select>
								<select class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none" bind:value={criterion.operator}>
									{#each operators as operator}
										<option value={operator}>{operator}</option>
									{/each}
								</select>
								<input
									class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none"
									bind:value={criterion.value}
									type="text"
									placeholder="Value"
								/>
								<label class="label cursor-pointer justify-start gap-3">
									<input class="accent-indigo-500" bind:checked={criterion.required} type="checkbox" />
									<span class="text-xs text-white/50">Required</span>
								</label>
								<button
									class="rounded-lg border border-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
									type="button"
									disabled={criteria.length === 1}
									onclick={() => removeCriteria(index)}
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				</div>

				{#if error}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>
				{/if}

				<div class="flex flex-wrap justify-end gap-3">
					<a class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white" href="/admin/scholarships">Cancel</a>
					<button
						class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
						type="button"
						disabled={saving}
						onclick={markAsVerified}
					>
						Mark as Verified
					</button>
					<button class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600" type="submit" disabled={saving}>
						{saving ? 'Saving...' : 'Save changes'}
					</button>
				</div>
			</form>
		{/if}
	</section>
</main>
