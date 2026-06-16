<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { supabase } from '$lib/supabase';

	let { children } = $props();
	let signingOut = $state(false);

	const navLinks = [
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/saved', label: 'Saved' },
		{ href: '/applications', label: 'Applications' },
		{ href: '/profile', label: 'Profile' }
	];

	function isActive(path: string) {
		return $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`);
	}

	async function signOut() {
		signingOut = true;
		await supabase.auth.signOut();
		await goto('/login');
	}
</script>

<div class="min-h-screen bg-[#0d0f14] pb-16 sm:pb-0">
	<nav class="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0d0f14]/90 backdrop-blur-md">
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5 sm:px-6">
			<a href="/dashboard" class="shrink-0 text-[15px] font-semibold tracking-tight text-white">
				Scholar<span class="text-indigo-400">AI</span>
			</a>

			<div class="hidden min-w-0 items-center gap-1 sm:flex">
				{#each navLinks as link}
					<a
						href={link.href}
						class={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
							isActive(link.href)
								? 'text-white'
								: 'text-white/40 hover:text-white/75'
						}`}
					>
						{link.label}
					</a>
				{/each}
			</div>

			<button
				class="shrink-0 text-xs text-white/25 transition-colors hover:text-white/60"
				type="button"
				disabled={signingOut}
				onclick={signOut}
			>
				{signingOut ? 'Signing out...' : 'Sign out'}
			</button>
		</div>
	</nav>

	{@render children()}

	<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.07] bg-[#0d0f14]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md sm:hidden">
		<div class="grid grid-cols-4">
			{#each navLinks as link}
				<a href={link.href} class={`flex flex-col items-center gap-1 py-1 text-[10px] transition-colors ${isActive(link.href) ? 'text-white' : 'text-white/35'}`}>
					<span class={`h-1 w-1 rounded-full ${isActive(link.href) ? 'bg-indigo-400' : 'bg-transparent'}`}></span>
					{link.label}
				</a>
			{/each}
		</div>
	</nav>
</div>
