<script lang="ts">
	import { Archive, ArrowRight } from '@lucide/svelte';
</script>

<svelte:head>
	<title>ScholarAI · Scholarship Research Desk</title>
	<meta
		name="description"
		content="ScholarAI helps students find scholarships, prove fit, save strong options, and track applications from one research desk."
	/>
</svelte:head>

<main class="home-shell">
	<header class="site-header">
		<a class="brand" href="/" aria-label="ScholarAI home">
			<span><Archive size={16} /></span>
			<strong>ScholarAI</strong>
		</a>
		<nav aria-label="Public navigation">
			<a href="/login">Sign in</a>
			<a class="nav-primary" href="/signup">Create account</a>
		</nav>
	</header>

	<section class="hero" aria-label="ScholarAI introduction">
		<div class="hero-copy">
			<p class="eyebrow">Scholarship research desk</p>
			<h1>Scholarship work, organized from match to submission.</h1>
			<p>
				ScholarAI helps students judge fit, save strong opportunities, and track applications without
				turning the process into a spreadsheet maze.
			</p>
			<div class="hero-actions">
				<a class="primary-action" href="/login">
					Open your desk
					<ArrowRight size={16} />
				</a>
				<a class="secondary-action" href="/signup">Create account</a>
			</div>
		</div>
	</section>

	<section class="explain" aria-label="How ScholarAI helps">
		<div>
			<span>01</span>
			<h2>Build one profile folio.</h2>
			<p>Your goals, documents, academics, and destinations become the evidence behind each match.</p>
		</div>
		<div>
			<span>02</span>
			<h2>Review real readiness.</h2>
			<p>Each file shows blockers, deadlines, match score, trust, and the next useful action.</p>
		</div>
		<div>
			<span>03</span>
			<h2>Track the application work.</h2>
			<p>Move serious opportunities into Apply Track and keep tasks, status, and links together.</p>
		</div>
	</section>
</main>

<style>
	.home-shell {
		min-height: 100vh;
		overflow-x: hidden;
		background:
			linear-gradient(rgba(193, 165, 103, 0.028) 1px, transparent 1px),
			linear-gradient(90deg, rgba(193, 165, 103, 0.028) 1px, transparent 1px),
			radial-gradient(circle at 72% 20%, rgba(193, 165, 103, 0.1), transparent 26%),
			linear-gradient(135deg, #07110d 0%, #0b1711 52%, #050a08 100%);
		background-size: 44px 44px, 44px 44px, auto, auto;
		color: #f2ead8;
	}

	.site-header,
	.hero,
	.explain {
		width: min(100% - 2rem, 1220px);
		margin-inline: auto;
	}

	.site-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.25rem 0;
	}

	.brand,
	.site-header nav,
	.site-header nav a,
	.hero-actions,
	.primary-action,
	.secondary-action {
		display: flex;
		align-items: center;
	}

	.brand {
		gap: 0.65rem;
		color: #f3ead5;
		text-decoration: none;
	}

	.brand span {
		display: grid;
		width: 2.25rem;
		height: 2.25rem;
		place-items: center;
		border: 1px solid rgba(185, 157, 98, 0.38);
		background: rgba(17, 31, 24, 0.9);
		color: #c1a567;
	}

	.brand strong {
		font: 650 1.18rem/1 "Newsreader Variable", serif;
		letter-spacing: -0.02em;
	}

	.site-header nav {
		gap: 0.5rem;
	}

	.site-header nav a,
	.primary-action,
	.secondary-action {
		min-height: 2.7rem;
		justify-content: center;
		border: 1px solid rgba(185, 157, 98, 0.3);
		padding-inline: 0.95rem;
		font: 800 0.68rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #d7ccb4;
		text-decoration: none;
	}

	.site-header nav .nav-primary,
	.primary-action {
		border-color: #c1a567;
		background: #c1a567;
		color: #07110d;
	}

	.hero {
		display: flex;
		min-height: min(720px, calc(100svh - 5rem));
		align-items: center;
		padding: clamp(2.5rem, 6vw, 4.5rem) 0 clamp(3rem, 6vw, 5rem);
	}

	.hero-copy {
		min-width: 0;
		max-width: 46rem;
	}

	.eyebrow,
	.explain span {
		font: 850 0.66rem/1 "Instrument Sans Variable", sans-serif;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #c1a567;
	}

	.hero-copy h1 {
		max-width: 42rem;
		margin-top: 0.9rem;
		font: 650 clamp(3rem, 5.4vw, 4.85rem) / 0.95 "Newsreader Variable", serif;
		letter-spacing: -0.035em;
		color: #fff1cf;
	}

	.hero-copy > p:not(.eyebrow) {
		max-width: 36rem;
		margin-top: 1rem;
		font-size: clamp(1rem, 1.5vw, 1.1rem);
		line-height: 1.65;
		color: #a9b4ad;
	}

	.hero-actions {
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.6rem;
	}

	.primary-action {
		gap: 0.45rem;
		min-width: 10.5rem;
	}

	.secondary-action {
		min-width: 10rem;
	}

	.explain {
		display: grid;
		gap: 1rem;
		border-top: 1px solid rgba(185, 157, 98, 0.18);
		padding: 2rem 0 4rem;
	}

	@media (min-width: 780px) {
		.explain {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.explain div {
		min-width: 0;
		padding-top: 0.3rem;
	}

	.explain h2 {
		margin-top: 0.7rem;
		font: 650 1.45rem/1.05 "Newsreader Variable", serif;
		color: #fff1cf;
	}

	.explain p {
		margin-top: 0.55rem;
		font-size: 0.9rem;
		line-height: 1.55;
		color: #9aa69d;
	}

	a:focus-visible {
		outline: 2px solid #c1a567;
		outline-offset: 3px;
	}

	@media (max-width: 640px) {
		.site-header {
			align-items: flex-start;
		}

		.site-header nav {
			flex-direction: column;
			align-items: stretch;
		}

		.site-header nav a {
			min-height: 2.25rem;
			padding-inline: 0.65rem;
			font-size: 0.58rem;
		}

		.hero {
			min-height: auto;
			padding-top: 2.25rem;
		}

		.hero-copy h1 {
			font-size: clamp(2.65rem, 12vw, 3.5rem);
		}

		.hero-actions,
		.primary-action,
		.secondary-action {
			width: 100%;
		}
	}
</style>
