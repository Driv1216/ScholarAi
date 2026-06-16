<script lang="ts">
	import { goto } from '$app/navigation';
	import { Archive, ArrowRight, FileText, Loader2, LockKeyhole } from '@lucide/svelte';
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

<svelte:head>
	<title>Sign In · ScholarAI</title>
</svelte:head>

<main class="auth-shell">
	<section class="auth-card" aria-label="Sign in">
		<a href="/login" class="brand">
			<span><Archive size={17} /></span>
			<strong>ScholarAI</strong>
			<small>Ink archive</small>
		</a>

		<div class="heading">
			<p><LockKeyhole size={14} /> Account</p>
			<h1>Welcome back</h1>
			<span>Open your scholarship desk.</span>
		</div>

		<button class="google-button" type="button" onclick={signInWithGoogle} disabled={loading}>
			<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
				<path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.4Z" />
				<path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.42l-3.25-2.53c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
				<path fill="#FBBC05" d="M6.39 13.88A6 6 0 0 1 6.08 12c0-.65.11-1.29.31-1.88V7.5H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.5l3.35-2.62Z" />
				<path fill="#EA4335" d="M12 5.99c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.5l3.35 2.62C7.18 7.75 9.39 6 12 6Z" />
			</svg>
			Continue with Google
		</button>

		<div class="divider">
			<span></span>
			<p>or</p>
			<span></span>
		</div>

		<form onsubmit={handleEmailSubmit}>
			<label>
				<span>Email</span>
				<input type="email" bind:value={email} autocomplete="email" placeholder="you@example.com" required />
			</label>

			<label>
				<span>Password</span>
				<input type="password" bind:value={password} autocomplete="current-password" required />
			</label>

			{#if error}
				<p class="error-note">{error}</p>
			{/if}

			<button class="submit-button" type="submit" disabled={loading}>
				{#if loading}<Loader2 class="spin" size={15} />{:else}<FileText size={15} />{/if}
				{loading ? 'Opening desk' : 'Sign in'}
				<ArrowRight size={15} />
			</button>
		</form>

		<p class="switch-link">
			No account?
			<a href="/signup">Create one</a>
		</p>
	</section>
</main>

<style>
	.auth-shell {
		display: grid;
		min-height: 100vh;
		place-items: center;
		overflow-x: hidden;
		background:
			linear-gradient(rgba(193, 165, 103, 0.035) 1px, transparent 1px),
			linear-gradient(90deg, rgba(193, 165, 103, 0.035) 1px, transparent 1px),
			radial-gradient(circle at 50% 18%, rgba(193, 165, 103, 0.12), transparent 30%),
			linear-gradient(135deg, #07110d 0%, #0b1912 52%, #050b09 100%);
		background-size: 40px 40px, 40px 40px, auto, auto;
		padding: clamp(1rem, 4vw, 2rem);
		color: #f2ead8;
	}

	.auth-card {
		position: relative;
		width: min(100%, 25.5rem);
		border: 1px solid rgba(185, 157, 98, 0.34);
		background: linear-gradient(180deg, #f3ead5, #e8dcc2 68%, #dfd0ad);
		color: #302f27;
		padding: clamp(1.2rem, 4vw, 1.8rem);
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34), 4px 6px 0 rgba(93, 80, 49, 0.72);
	}

	.auth-card::before {
		content: "";
		position: absolute;
		inset: 0 0 auto;
		height: 5px;
		background: linear-gradient(90deg, rgba(117, 100, 63, 0.8), transparent 72%);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		color: #302f27;
		text-decoration: none;
	}

	.brand span {
		display: grid;
		height: 2.35rem;
		width: 2.35rem;
		place-items: center;
		border: 1px solid #b9a982;
		background: #eadfc8;
		color: #806b40;
	}

	.brand strong {
		font: 650 1.3rem/1 "Newsreader Variable", serif;
	}

	.brand small {
		margin-left: auto;
		font: 800 0.58rem/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #756a54;
	}

	.heading {
		margin-top: 2rem;
	}

	.heading p,
	form label span {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font: 850 0.65rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #9a7d42;
	}

	.heading h1 {
		margin-top: 0.65rem;
		font: 650 2.75rem/0.92 "Newsreader Variable", serif;
		letter-spacing: -0.04em;
		color: #282821;
	}

	.heading > span {
		display: block;
		margin-top: 0.6rem;
		font-size: 0.92rem;
		line-height: 1.45;
		color: #675d4e;
	}

	.google-button,
	.submit-button {
		display: flex;
		min-height: 3rem;
		width: 100%;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		border: 1px solid #b9a982;
		background: #eadfc8;
		color: #302f27;
		font-weight: 800;
	}

	.google-button {
		margin-top: 1.45rem;
	}

	.divider {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
		margin: 1rem 0;
	}

	.divider span {
		height: 1px;
		background: #c9b98f;
	}

	.divider p {
		font-size: 0.76rem;
		color: #756a54;
	}

	form {
		display: grid;
		gap: 0.85rem;
	}

	form label {
		display: grid;
		gap: 0.45rem;
	}

	form input {
		min-height: 2.9rem;
		border: 1px solid #c9b98f;
		background: #efe5cf;
		padding: 0.75rem 0.85rem;
		color: #302f27;
	}

	form input::placeholder {
		color: #9a8f77;
	}

	.error-note {
		border-left: 2px solid #9b5c4b;
		background: #ead8cb;
		padding: 0.75rem 0.85rem;
		font-size: 0.85rem;
		line-height: 1.45;
		color: #744838;
	}

	.submit-button {
		justify-content: space-between;
		border-color: #302f27;
		background: #302f27;
		padding-inline: 0.95rem;
		color: #efe5cf;
	}

	.switch-link {
		margin-top: 1.15rem;
		text-align: center;
		font-size: 0.8rem;
		color: #675d4e;
	}

	.switch-link a {
		font-weight: 800;
		color: #654d29;
		text-decoration: underline;
		text-decoration-color: #c69a44;
		text-decoration-thickness: 2px;
		text-underline-offset: 4px;
	}

	button:focus-visible,
	a:focus-visible,
	input:focus-visible {
		outline: 2px solid #7d896a;
		outline-offset: 3px;
	}

	:global(.spin) {
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 520px) {
		.auth-shell {
			align-items: start;
			padding-top: 1rem;
		}

		.auth-card {
			box-shadow: 3px 4px 0 rgba(93, 80, 49, 0.72);
		}

		.brand small {
			display: none;
		}

		.heading {
			margin-top: 1.6rem;
		}

		.heading h1 {
			font-size: 2.35rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.spin) {
			animation: none;
		}
	}
</style>
