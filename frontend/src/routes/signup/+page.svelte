<script lang="ts">
	import { supabase } from '$lib/supabase';

	let fullName = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let success = $state('');
	let loading = $state(false);

	async function createAccount() {
		error = '';
		success = '';
		loading = true;

		const { error: signUpError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName
				}
			}
		});

		loading = false;

		if (signUpError) {
			error = signUpError.message;
			return;
		}

		success = 'Check your email to confirm your account';
	}

	function handleCreateAccount(event: SubmitEvent) {
		event.preventDefault();
		void createAccount();
	}
</script>

<main class="flex min-h-screen bg-[#0d0f14]">
	<section class="hidden w-[42%] flex-col justify-between border-r border-white/[0.07] p-12 lg:flex xl:p-16">
		<a href="/login" class="text-[15px] font-semibold tracking-tight text-white">Scholar<span class="text-indigo-400">AI</span></a>
		<div class="max-w-sm">
			<p class="text-[11px] font-medium uppercase tracking-[0.18em] text-white/30">Start with context</p>
			<h2 class="mt-5 text-3xl font-medium leading-tight tracking-[-0.03em] text-white">Better matches begin with a better profile.</h2>
			<p class="mt-4 text-sm leading-6 text-white/40">After creating your account, you’ll add your academic background, target countries, and funding goals.</p>
		</div>
		<p class="text-xs text-white/25">No noise. Just relevant opportunities and the work ahead.</p>
	</section>

	<section class="flex flex-1 items-center justify-center px-6 py-12">
		<div class="w-full max-w-[360px]">
			<p class="mb-12 text-[15px] font-semibold tracking-tight text-white lg:hidden">Scholar<span class="text-indigo-400">AI</span></p>
			<div class="mb-8">
				<p class="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">New account</p>
				<h1 class="text-2xl font-medium tracking-[-0.025em] text-white">Create your account</h1>
				<p class="mt-2 text-sm text-white/40">Set up your scholarship workspace.</p>
			</div>

			<form class="space-y-4" onsubmit={handleCreateAccount}>
				<label class="flex flex-col gap-1.5">
					<span class="text-xs text-white/50">Full name</span>
					<input class="h-11 rounded-lg border border-white/[0.10] bg-[#11141b] px-3.5 text-sm text-white transition-colors hover:border-white/[0.16] focus:border-indigo-400/70 focus:outline-none" type="text" bind:value={fullName} autocomplete="name" required />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="text-xs text-white/50">Email</span>
					<input class="h-11 rounded-lg border border-white/[0.10] bg-[#11141b] px-3.5 text-sm text-white transition-colors hover:border-white/[0.16] focus:border-indigo-400/70 focus:outline-none" type="email" bind:value={email} autocomplete="email" required />
				</label>
				<label class="flex flex-col gap-1.5">
					<span class="text-xs text-white/50">Password</span>
					<input class="h-11 rounded-lg border border-white/[0.10] bg-[#11141b] px-3.5 text-sm text-white transition-colors hover:border-white/[0.16] focus:border-indigo-400/70 focus:outline-none" type="password" bind:value={password} autocomplete="new-password" required />
				</label>

				{#if error}<p class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>{/if}
				{#if success}<p class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">{success}</p>{/if}

				<button class="h-11 w-full rounded-lg bg-indigo-500 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-400" type="submit" disabled={loading}>
					{loading ? 'Creating account...' : 'Create account'}
				</button>
			</form>

			<p class="mt-7 text-center text-xs text-white/35">
				Already have an account?
				<a class="text-indigo-400 transition-colors hover:text-indigo-300" href="/login">Sign in</a>
			</p>
		</div>
	</section>
</main>
