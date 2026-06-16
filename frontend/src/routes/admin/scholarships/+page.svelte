<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';

	interface ScholarshipCriteria {
		criterion_type: string;
		operator: string;
		value: string;
		required: boolean;
	}

	interface Scholarship {
		id: string;
		source_id: string | null;
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
		scholarship_criteria: ScholarshipCriteria[];
	}

	let scholarships = $state<Scholarship[]>([]);
	let loading = $state(true);
	let error = $state('');
	let savingId = $state('');

	onMount(() => {
		void loadScholarships();
	});

	async function loadScholarships() {
		error = '';
		loading = true;
		try {
			const response = await fetch(new URL('/admin/scholarships', PUBLIC_BACKEND_URL));
			if (!response.ok) {
				throw new Error(`Could not load scholarships: ${response.status}`);
			}
			scholarships = (await response.json()) as Scholarship[];
		} catch (loadError) {
			error = loadError instanceof Error ? loadError.message : 'Could not load scholarships';
		} finally {
			loading = false;
		}
	}

	async function verifyScholarship(scholarship: Scholarship) {
		savingId = scholarship.id;
		error = '';
		try {
			const response = await fetch(
				new URL(`/admin/scholarships/${scholarship.id}`, PUBLIC_BACKEND_URL),
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...scholarship,
						status: 'verified',
						last_verified_at: new Date().toISOString()
					})
				}
			);
			if (!response.ok) {
				throw new Error(`Could not verify scholarship: ${response.status}`);
			}
			const updated = (await response.json()) as Scholarship;
			scholarships = scholarships.map((item) => (item.id === updated.id ? updated : item));
		} catch (verifyError) {
			error = verifyError instanceof Error ? verifyError.message : 'Could not verify scholarship';
		} finally {
			savingId = '';
		}
	}

	async function deleteScholarship(scholarship: Scholarship) {
		if (!confirm(`Delete ${scholarship.name}?`)) {
			return;
		}

		savingId = scholarship.id;
		error = '';
		try {
			const response = await fetch(
				new URL(`/admin/scholarships/${scholarship.id}`, PUBLIC_BACKEND_URL),
				{ method: 'DELETE' }
			);
			if (!response.ok) {
				throw new Error(`Could not delete scholarship: ${response.status}`);
			}
			scholarships = scholarships.filter((item) => item.id !== scholarship.id);
		} catch (deleteError) {
			error = deleteError instanceof Error ? deleteError.message : 'Could not delete scholarship';
		} finally {
			savingId = '';
		}
	}

	function statusClass(status: string) {
		const classes: Record<string, string> = {
			verified: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
			pending_review: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
			draft: 'border-white/[0.07] bg-white/[0.05] text-white/50',
			expired: 'border-red-500/20 bg-red-500/10 text-red-400'
		};

		return classes[status] ?? 'border-white/[0.07] bg-white/[0.05] text-white/50';
	}

	function formatDate(value: string | null) {
		if (!value) {
			return 'No deadline';
		}

		return new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(`${value}T00:00:00`));
	}
</script>

<main class="min-h-screen bg-[#0f1117] px-6 py-8 text-white/80">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-xl font-semibold text-white">Scholarships</h1>
				<p class="mt-1 text-sm text-white/40">All statuses are visible for admin review.</p>
			</div>
			<a class="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600" href="/admin/scholarships/new">Add New Scholarship</a>
		</div>

		{#if error}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>
		{/if}

		<div class="overflow-x-auto rounded-xl border border-white/[0.07] bg-[#1a1d27]">
			<table class="table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Provider</th>
						<th>Country</th>
						<th>Degree</th>
						<th>Status</th>
						<th>Trust</th>
						<th>Deadline</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr>
							<td colspan="8" class="py-12 text-center">
								<div class="mx-auto h-8 w-8 animate-pulse rounded-full bg-indigo-500/40"></div>
							</td>
						</tr>
					{:else if scholarships.length === 0}
						<tr>
							<td colspan="8" class="py-12 text-center text-white/40">
								No scholarships found.
							</td>
						</tr>
					{:else}
						{#each scholarships as scholarship}
							<tr>
								<td class="min-w-64 font-semibold">{scholarship.name}</td>
								<td>{scholarship.provider}</td>
								<td>{scholarship.country ?? '-'}</td>
								<td>{scholarship.degree_level ?? 'any'}</td>
								<td>
									<span class={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusClass(scholarship.status)}`}>
										{scholarship.status}
									</span>
								</td>
								<td>{scholarship.trust_score}</td>
								<td>{formatDate(scholarship.deadline)}</td>
								<td>
									<div class="flex flex-wrap gap-2">
										<a
											class="rounded-lg border border-white/[0.10] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white"
											href={`/admin/scholarships/${scholarship.id}/edit`}
										>
											Edit
										</a>
										<button
											class="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
											type="button"
											disabled={savingId === scholarship.id}
											onclick={() => verifyScholarship(scholarship)}
										>
											Verify
										</button>
										<button
											class="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
											type="button"
											disabled={savingId === scholarship.id}
											onclick={() => deleteScholarship(scholarship)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
</main>
