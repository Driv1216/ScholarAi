<script lang="ts">
	import { Archive, ArrowRight, FileCheck2, Loader2, UserRound } from '@lucide/svelte';
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

<svelte:head>
	<title>Create Account · ScholarAI</title>
</svelte:head>

<main class="auth-shell">
	<section class="archive-panel" aria-label="ScholarAI profile folio introduction">
		<a href="/login" class="brand-lockup">
			<span><Archive size={17} /></span>
			<strong>ScholarAI</strong>
			<small>Ink archive</small>
		</a>

		<div class="archive-copy">
			<p class="eyebrow">Start with context</p>
			<h2>Better matches begin with a better folio.</h2>
			<p>
				Create the account, then assemble the identity, academic, destination, funding, and document packet that powers the Desk.
			</p>
			<div class="folio-preview">
				<div><span>Identity</span><strong>Name, country, nationality</strong></div>
				<div><span>Academic</span><strong>Degree, field, CGPA</strong></div>
				<div><span>Packet</span><strong>Documents ready to reuse</strong></div>
			</div>
		</div>

		<p class="archive-footer">One profile. Many scholarship files.</p>
	</section>

	<section class="form-stage">
		<div class="auth-card">
			<a href="/login" class="mobile-brand">
				<span><Archive size={16} /></span>
				ScholarAI
			</a>

			<div class="file-tab">
				<span>New folio</span>
				<i>Account setup</i>
			</div>

			<div class="form-heading">
				<p><UserRound size={14} /> Archive access</p>
				<h1>Create your account</h1>
				<span>Open the research desk and build your scholarship packet.</span>
			</div>

			<form onsubmit={handleCreateAccount}>
				<label>
					<span>Full name</span>
					<input type="text" bind:value={fullName} autocomplete="name" required />
				</label>
				<label>
					<span>Email</span>
					<input type="email" bind:value={email} autocomplete="email" required />
				</label>
				<label>
					<span>Password</span>
					<input type="password" bind:value={password} autocomplete="new-password" required />
				</label>

				{#if error}<p class="error-note">{error}</p>{/if}
				{#if success}<p class="success-note">{success}</p>{/if}

				<button class="submit-button" type="submit" disabled={loading}>
					{#if loading}<Loader2 class="spin" size={15} />{:else}<FileCheck2 size={15} />{/if}
					{loading ? 'Creating folio' : 'Create account'}
					<ArrowRight size={15} />
				</button>
			</form>

			<p class="switch-link">
				Already have an account?
				<a href="/login">Sign in</a>
			</p>
		</div>
	</section>
</main>

<style>
	.auth-shell {
		display: grid;
		min-height: 100vh;
		overflow: hidden;
		background:
			radial-gradient(circle at 20% 10%, rgba(193, 165, 103, 0.13), transparent 32%),
			linear-gradient(135deg, #07110d 0%, #0d1c15 48%, #050b09 100%);
		color: #f2ead8;
	}

	@media (min-width: 1024px) {
		.auth-shell {
			grid-template-columns: minmax(28rem, 44%) minmax(0, 1fr);
		}
	}

	.archive-panel {
		position: relative;
		display: none;
		min-height: 100vh;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		border-right: 1px solid rgba(185, 157, 98, 0.25);
		background:
			linear-gradient(rgba(193, 165, 103, 0.045) 1px, transparent 1px),
			linear-gradient(90deg, rgba(193, 165, 103, 0.045) 1px, transparent 1px),
			linear-gradient(180deg, rgba(17, 31, 24, 0.96), rgba(7, 17, 13, 0.98));
		background-size: 34px 34px, 34px 34px, auto;
		padding: clamp(2rem, 4vw, 4rem);
	}

	@media (min-width: 1024px) {
		.archive-panel {
			display: flex;
		}
	}

	.archive-panel::after {
		content: "";
		position: absolute;
		right: -4rem;
		top: 18%;
		width: 14rem;
		height: 34rem;
		rotate: -10deg;
		border: 1px solid rgba(185, 157, 98, 0.24);
		background: rgba(239, 229, 207, 0.045);
		box-shadow: 14px 16px 0 rgba(77, 67, 45, 0.3);
	}

	.brand-lockup,
	.mobile-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		width: max-content;
		color: #f3ead5;
		text-decoration: none;
	}

	.brand-lockup span,
	.mobile-brand span {
		display: grid;
		height: 2.35rem;
		width: 2.35rem;
		place-items: center;
		border: 1px solid rgba(185, 157, 98, 0.45);
		background: #111f18;
		box-shadow: 2px 3px 0 #4d432d;
		color: #c1a567;
	}

	.brand-lockup strong {
		font: 650 1.25rem/1 "Newsreader Variable", serif;
	}

	.brand-lockup small {
		border-left: 1px solid rgba(185, 157, 98, 0.28);
		padding-left: 0.7rem;
		font: 800 0.58rem/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #9aa69d;
	}

	.archive-copy {
		position: relative;
		z-index: 1;
		max-width: 31rem;
	}

	.eyebrow,
	.file-tab span,
	.form-heading p,
	form label span,
	.folio-preview span {
		font: 850 0.65rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #c1a567;
	}

	.archive-copy h2 {
		margin-top: 1.2rem;
		font: 650 clamp(3rem, 6vw, 5.8rem) / 0.82 "Newsreader Variable", serif;
		letter-spacing: -0.055em;
		color: #fff1cf;
	}

	.archive-copy > p:not(.eyebrow) {
		margin-top: 1.25rem;
		max-width: 25rem;
		font-size: 0.95rem;
		line-height: 1.65;
		color: #9aa69d;
	}

	.folio-preview {
		display: grid;
		gap: 0.6rem;
		margin-top: 2rem;
		max-width: 26rem;
	}

	.folio-preview div {
		border-left: 2px solid #c1a567;
		background: rgba(19, 35, 27, 0.88);
		padding: 0.8rem 0.9rem;
	}

	.folio-preview strong {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.92rem;
		color: #f3ead5;
	}

	.archive-footer {
		position: relative;
		z-index: 1;
		font-size: 0.75rem;
		color: #8d9a90;
	}

	.form-stage {
		display: grid;
		min-height: 100vh;
		place-items: center;
		padding: clamp(1rem, 5vw, 3rem);
	}

	.auth-card {
		position: relative;
		width: min(100%, 27rem);
		border: 1px solid rgba(185, 157, 98, 0.34);
		background: linear-gradient(180deg, #f3ead5, #e8dcc2 64%, #dfd0ad);
		color: #302f27;
		padding: clamp(1.2rem, 4vw, 2rem);
		box-shadow: 0 28px 70px rgba(0, 0, 0, 0.34), 5px 7px 0 rgba(93, 80, 49, 0.7);
	}

	.auth-card::before {
		content: "";
		position: absolute;
		inset: 0 0 auto;
		height: 5px;
		background: linear-gradient(90deg, rgba(117, 100, 63, 0.8), transparent 72%);
	}

	.mobile-brand {
		margin-bottom: 1.3rem;
		font: 650 1.2rem/1 "Newsreader Variable", serif;
		color: #302f27;
	}

	@media (min-width: 1024px) {
		.mobile-brand {
			display: none;
		}
	}

	.file-tab {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		border-bottom: 1px solid #c9b98f;
		padding-bottom: 0.85rem;
	}

	.file-tab i {
		font: 700 0.63rem/1 "IBM Plex Mono", monospace;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #756a54;
	}

	.form-heading {
		margin-top: 1.35rem;
	}

	.form-heading p {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.form-heading h1 {
		margin-top: 0.65rem;
		font: 650 2.7rem/0.92 "Newsreader Variable", serif;
		letter-spacing: -0.04em;
		color: #282821;
	}

	.form-heading span {
		display: block;
		margin-top: 0.7rem;
		font-size: 0.9rem;
		line-height: 1.5;
		color: #645b4e;
	}

	form {
		display: grid;
		gap: 0.9rem;
		margin-top: 1.35rem;
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

	.error-note,
	.success-note {
		border-left: 2px solid #9b5c4b;
		background: #ead8cb;
		padding: 0.75rem 0.85rem;
		font-size: 0.85rem;
		line-height: 1.45;
		color: #744838;
	}

	.success-note {
		border-left-color: #7d896a;
		background: #dfe3c8;
		color: #4c573c;
	}

	.submit-button {
		display: flex;
		min-height: 3rem;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem;
		border: 1px solid #302f27;
		background: #302f27;
		padding-inline: 0.95rem;
		color: #efe5cf;
		font-weight: 800;
	}

	.switch-link {
		margin-top: 1.25rem;
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
		.form-stage {
			align-items: start;
			padding-top: 1rem;
		}

		.auth-card {
			box-shadow: 3px 4px 0 rgba(93, 80, 49, 0.7);
		}

		.form-heading h1 {
			font-size: 2.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.spin) {
			animation: none;
		}
	}
</style>
