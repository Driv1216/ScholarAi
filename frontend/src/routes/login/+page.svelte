<script lang="ts">
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const redirectTo = 'http://localhost:5173/auth/callback';

	async function signInWithGoogle() {
		error = '';
		loading = true;

		const { error: signInError } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo }
		});

		if (signInError) {
			error = signInError.message;
			loading = false;
		}
	}

	async function signInWithEmail() {
		error = '';
		loading = true;

		const { error: signInError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		loading = false;

		if (signInError) {
			error = signInError.message;
			return;
		}

		await goto('/dashboard');
	}

	function handleEmailSubmit(event: SubmitEvent) {
		event.preventDefault();
		void signInWithEmail();
	}
</script>

<main class="flex min-h-screen bg-[#0d0f14]">
	<section class="relative hidden w-[48%] flex-col justify-between overflow-hidden border-r border-white/[0.07] p-12 lg:flex xl:p-16">
		<a href="/login" class="text-[15px] font-semibold tracking-tight text-white">
			Scholar<span class="text-indigo-400">AI</span>
		</a>

		<div class="max-w-md">
			<p class="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
				Scholarship workspace
			</p>
			<h2 class="max-w-sm text-[40px] font-medium leading-[1.08] tracking-[-0.035em] text-white">
				Spend less time searching. More time applying.
			</h2>
			<p class="mt-5 max-w-sm text-sm leading-6 text-white/45">
				A focused place to find relevant funding, save strong options, and keep every application moving.
			</p>

			<ol class="mt-10 max-w-sm border-t border-white/[0.07]">
				<li class="grid grid-cols-[28px_1fr] gap-3 border-b border-white/[0.07] py-4">
					<span class="font-mono text-[11px] text-indigo-400">01</span>
					<div>
						<p class="text-sm font-medium text-white/80">Build your profile once</p>
						<p class="mt-1 text-xs leading-5 text-white/35">Your goals and background shape every match.</p>
					</div>
				</li>
				<li class="grid grid-cols-[28px_1fr] gap-3 border-b border-white/[0.07] py-4">
					<span class="font-mono text-[11px] text-indigo-400">02</span>
					<div>
						<p class="text-sm font-medium text-white/80">Review the reasoning</p>
						<p class="mt-1 text-xs leading-5 text-white/35">See why an opportunity belongs on your shortlist.</p>
					</div>
				</li>
				<li class="grid grid-cols-[28px_1fr] gap-3 border-b border-white/[0.07] py-4">
					<span class="font-mono text-[11px] text-indigo-400">03</span>
					<div>
						<p class="text-sm font-medium text-white/80">Track the work</p>
						<p class="mt-1 text-xs leading-5 text-white/35">Keep deadlines, status, and next steps together.</p>
					</div>
				</li>
			</ol>
		</div>

		<p class="text-xs text-white/25">Funding discovery without the spreadsheet sprawl.</p>
	</section>

	<section class="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
		<div class="w-full max-w-[360px]">
			<p class="mb-12 text-[15px] font-semibold tracking-tight text-white lg:hidden">
				Scholar<span class="text-indigo-400">AI</span>
			</p>

			<p class="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">Account</p>
			<h1 class="text-2xl font-medium tracking-[-0.025em] text-white">Welcome back</h1>
			<p class="mb-8 mt-2 text-sm text-white/40">Sign in to continue your scholarship search.</p>

			<button
				class="mb-6 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-white/[0.12] bg-white/[0.04] text-sm font-medium text-white/90 transition-colors hover:border-white/[0.18] hover:bg-white/[0.07]"
				type="button"
				onclick={signInWithGoogle}
				disabled={loading}
			>
				<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
					<path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
					<path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.25-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
					<path fill="#FBBC05" d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.5H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.5l3.35-2.62Z" />
					<path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.5l3.35 2.62C7.18 7.75 9.39 6 12 6Z" />
				</svg>
				Continue with Google
			</button>

			<div class="mb-6 flex items-center gap-3">
				<div class="h-px flex-1 bg-white/[0.06]"></div>
				<span class="text-xs text-white/30">or</span>
				<div class="h-px flex-1 bg-white/[0.06]"></div>
			</div>

			<form class="flex flex-col gap-4" onsubmit={handleEmailSubmit}>
				<label>
					<span class="mb-1.5 block text-xs text-white/50">Email</span>
				<input
					class="h-11 w-full rounded-lg border border-white/[0.10] bg-[#11141b] px-3.5 text-sm text-white placeholder-white/20 transition-colors hover:border-white/[0.16] focus:border-indigo-400/70 focus:outline-none"
					type="email"
					bind:value={email}
					autocomplete="email"
					placeholder="you@example.com"
					required
				/>
				</label>

				<label>
					<span class="mb-1.5 block text-xs text-white/50">Password</span>
				<input
					class="h-11 w-full rounded-lg border border-white/[0.10] bg-[#11141b] px-3.5 text-sm text-white transition-colors hover:border-white/[0.16] focus:border-indigo-400/70 focus:outline-none"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					required
				/>
				</label>

				{#if error}
					<p class="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
						{error}
					</p>
				{/if}

				<button
					class="mt-1 h-11 w-full rounded-lg bg-indigo-500 text-sm font-medium text-white transition-colors hover:bg-indigo-400"
					type="submit"
					disabled={loading}
				>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
			</form>

			<p class="mt-7 text-center text-xs text-white/35">
				No account?
				<a class="text-indigo-400 transition-colors hover:text-indigo-300" href="/signup">
					Sign up
				</a>
			</p>
		</div>
	</section>
</main>
