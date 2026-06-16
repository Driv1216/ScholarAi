<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Archive, BookMarked, ClipboardList, FolderKanban, LogOut, UserRound } from '@lucide/svelte';
	import { supabase } from '$lib/supabase';

	let { children } = $props();
	let signingOut = $state(false);

	const navLinks = [
		{ href: '/dashboard', label: 'Desk', icon: FolderKanban },
		{ href: '/saved', label: 'Watchlist', icon: BookMarked },
		{ href: '/applications', label: 'Apply Track', icon: ClipboardList },
		{ href: '/profile', label: 'Profile Folio', icon: UserRound }
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

<div class="min-h-screen bg-[#07110d] pb-20 font-[Instrument_Sans_Variable] text-[#f2ead8] sm:pb-0">
	<nav class="sticky top-0 z-50 border-b border-[#b99d62]/20 bg-[#08130f]/92 backdrop-blur-md">
		<div class="mx-auto flex h-16 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
			<a href="/dashboard" class="group flex shrink-0 items-center gap-3 text-[#f3ead5]">
				<span class="grid h-9 w-9 place-items-center border border-[#b99d62]/45 bg-[#111f18] shadow-[2px_3px_0_#4d432d]">
					<Archive size={17} class="text-[#c1a567]" />
				</span>
				<span class="leading-none">
					<span class="block font-[Newsreader_Variable] text-xl font-semibold tracking-[-0.03em]">ScholarAI</span>
					<span class="mt-1 block font-[IBM_Plex_Mono] text-[9px] uppercase tracking-[0.18em] text-[#9aa69d]">Ink archive</span>
				</span>
			</a>

			<div class="hidden min-w-0 items-center gap-1 md:flex">
				{#each navLinks as link}
					{@const Icon = link.icon}
					<a
						href={link.href}
						class={`flex items-center gap-2 border px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors ${
							isActive(link.href)
								? 'border-[#c1a567]/60 bg-[#c1a567] text-[#07110d]'
								: 'border-transparent text-[#9aa69d] hover:border-[#b99d62]/30 hover:text-[#f3ead5]'
						}`}
					>
						<Icon size={14} />
						{link.label}
					</a>
				{/each}
			</div>

			<button
				class="flex shrink-0 items-center gap-2 border border-[#b99d62]/25 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#9aa69d] transition-colors hover:border-[#b99d62]/50 hover:text-[#f3ead5]"
				type="button"
				disabled={signingOut}
				onclick={signOut}
			>
				<LogOut size={14} />
				{signingOut ? 'Signing out...' : 'Sign out'}
			</button>
		</div>
	</nav>

	{@render children()}

	<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-[#b99d62]/20 bg-[#08130f]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden">
		<div class="grid grid-cols-4">
			{#each navLinks as link}
				{@const Icon = link.icon}
				<a href={link.href} class={`flex flex-col items-center gap-1 py-1 text-[9px] font-bold uppercase tracking-[0.08em] transition-colors ${isActive(link.href) ? 'text-[#f3ead5]' : 'text-[#7f8a82]'}`}>
					<Icon size={16} class={isActive(link.href) ? 'text-[#c1a567]' : 'text-[#7f8a82]'} />
					{link.label}
				</a>
			{/each}
		</div>
	</nav>
</div>
