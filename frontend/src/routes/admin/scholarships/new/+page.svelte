<script lang="ts">
	import { goto } from '$app/navigation';
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
	}

	interface ExtractedScholarship {
		name: string | null;
		provider: string | null;
		country: string | null;
		degree_level: string | null;
		fields: string[] | null;
		award_amount: string | null;
		deadline: string | null;
		application_url: string | null;
		eligibility_notes: string | null;
		nationality: string | null;
		min_cgpa: number | null;
		warnings?: string[];
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
		status: 'draft'
	});
	let criteria = $state<CriteriaInput[]>([
		{ criterion_type: 'nationality', operator: 'eq', value: '', required: true }
	]);
	let saving = $state(false);
	let error = $state('');
	let extractUrl = $state('');
	let extractText = $state('');
	let extracting = $state(false);
	let extractError = $state('');
	let aiWarnings = $state<string[]>([]);
	let aiExtracted = $state(false);
	let officialUrlVisited = $state(false);
	let visitedUrl = $state('');

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

	function handleExtractUrlInput(event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		extractUrl = value;
		form.official_url = value;
		officialUrlVisited = false;
	}

	function normalizeSelectValue(value: string | null, options: string[], fallback: string) {
		return value && options.includes(value) ? value : fallback;
	}

	function applyExtractedScholarship(extracted: ExtractedScholarship) {
		form = {
			...form,
			name: extracted.name ?? '',
			provider: extracted.provider ?? '',
			official_url: extractUrl,
			country: normalizeSelectValue(extracted.country, countries, form.country),
			degree_level: normalizeSelectValue(extracted.degree_level, degreeLevels, form.degree_level),
			fields: (extracted.fields ?? []).join(', '),
			award_amount: extracted.award_amount ?? '',
			deadline: extracted.deadline ?? '',
			application_url: extracted.application_url ?? ''
		};

		const extractedCriteria: CriteriaInput[] = [];
		if (extracted.nationality) {
			extractedCriteria.push({
				criterion_type: 'nationality',
				operator: extracted.nationality === 'ANY' ? 'in' : 'eq',
				value: extracted.nationality,
				required: true
			});
		}
		if (extracted.min_cgpa !== null) {
			extractedCriteria.push({
				criterion_type: 'cgpa',
				operator: 'gte',
				value: String(extracted.min_cgpa),
				required: true
			});
		}
		if (extractedCriteria.length > 0) {
			criteria = extractedCriteria;
		}

		officialUrlVisited = false;
		visitedUrl = '';
		aiWarnings = extracted.warnings ?? [];
		aiExtracted = true;
	}

	async function handleExtract() {
		extractError = '';
		error = '';
		aiWarnings = [];
		aiExtracted = false;

		if (!extractUrl.trim()) {
			extractError = 'Enter a scholarship URL to extract.';
			return;
		}

		extracting = true;
		try {
			const response = await fetch(new URL('/admin/extract', PUBLIC_BACKEND_URL), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: extractUrl.trim(),
					text: extractText.trim() || null
				})
			});
			const payload = await response.json();

			if (!response.ok) {
				const detail = typeof payload?.detail === 'string' ? payload.detail : 'Could not extract scholarship';
				throw new Error(detail);
			}

			applyExtractedScholarship(payload as ExtractedScholarship);
		} catch (extractSubmitError) {
			extractError =
				extractSubmitError instanceof Error
					? extractSubmitError.message
					: 'Could not extract scholarship';
		} finally {
			extracting = false;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = '';

		if (!officialUrlVisited || visitedUrl !== form.official_url) {
			error = 'Visit the official URL before submitting this scholarship.';
			return;
		}

		saving = true;
		try {
			const response = await fetch(new URL('/admin/scholarships', PUBLIC_BACKEND_URL), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...form,
					fields: fieldsArray(),
					award_amount: form.award_amount || null,
					deadline: form.deadline || null,
					application_url: form.application_url || null,
					scholarship_criteria: criteria.filter((criterion) => criterion.value.trim())
				})
			});

			if (!response.ok) {
				throw new Error(`Could not create scholarship: ${response.status}`);
			}

			await goto('/admin/scholarships');
		} catch (submitError) {
			error = submitError instanceof Error ? submitError.message : 'Could not create scholarship';
		} finally {
			saving = false;
		}
	}
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8 text-white/80">
	<section class="mx-auto w-full max-w-5xl">
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold text-white">Add scholarship</h1>
				<p class="mt-1 text-sm text-white/40">Create a new scholarship and matching criteria.</p>
			</div>
			<a class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white" href="/admin/scholarships">Back to list</a>
		</div>

		<form class="space-y-6" onsubmit={handleSubmit}>
			<div class="rounded-xl border border-white/[0.07] bg-[#1a1d27] p-6">
				<div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
					<label class="flex flex-col gap-1.5">
						<span class="mb-1.5 text-xs text-white/50">Extract from URL</span>
						<input
							class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none"
							value={extractUrl}
							type="url"
							placeholder="https://example.edu/scholarship"
							oninput={handleExtractUrlInput}
						/>
					</label>
					<button
						class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
						type="button"
						disabled={extracting || !extractUrl.trim()}
						onclick={handleExtract}
					>
						{#if extracting}
							<span class="inline-block h-3 w-3 animate-pulse rounded-full bg-white/60"></span>
							Extracting
						{:else}
							Extract
						{/if}
					</button>
				</div>
				<div class="mt-4">
					<label class="flex flex-col gap-1.5">
						<span class="mb-1.5 text-xs text-white/50">Page text fallback</span>
						<textarea
							class="min-h-32 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 py-3 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none min-h-32"
							bind:value={extractText}
							placeholder="If the backend cannot reach the site, paste the scholarship page text here and click Extract again."
						></textarea>
					</label>
				</div>
				{#if aiExtracted}
					<div class="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
						<div>
							<p>AI-extracted data — please verify all fields before saving</p>
							{#if aiWarnings.length > 0}
								<ul class="mt-2 list-disc pl-5">
									{#each aiWarnings as warning}
										<li>{warning}</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				{/if}
				{#if extractError}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 mt-4">{extractError}</div>
				{/if}
			</div>

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
						<input
							class="h-11 rounded-lg border border-white/[0.08] bg-[#12151e] px-3.5 text-sm text-white transition-colors focus:border-indigo-500/60 focus:outline-none"
							bind:value={form.fields}
							type="text"
							placeholder="Computer science, AI, Engineering"
						/>
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

			<div class="flex justify-end gap-3">
				<a class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white" href="/admin/scholarships">Cancel</a>
				<button class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600" type="submit" disabled={saving}>
					{saving ? 'Saving...' : 'Create scholarship'}
				</button>
			</div>
		</form>
	</section>
</main>
