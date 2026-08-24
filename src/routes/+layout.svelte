<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import '../app.css';

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeMobileMenu();
		}
	}

</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<a class="brand" href={resolve('/')} aria-label="StreamBridge home">
		<img class="brand-logo" src={logo} alt="" />
		StreamBridge
	</a>
	<nav class="desktop-nav" aria-label="Main navigation">
		<a href={resolve('/#features')}>Features</a>
		<a href="https://github.com/Erallie/stream-bridge#readme" target="_blank" rel="noreferrer">
			Documentation
		</a>
		<a href={resolve('/support')}>Support</a>
		<a href={resolve('/privacy')}>Privacy</a>
		<a href={resolve('/terms')}>Terms</a>
		<a class="button small" href={resolve('/dashboard')}>Dashboard</a>
	</nav>
	<button
		class="mobile-menu-button"
		type="button"
		aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
		aria-expanded={mobileMenuOpen}
		aria-controls="mobile-navigation"
		onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
	>
		<span class:open={mobileMenuOpen}></span>
		<span class:open={mobileMenuOpen}></span>
		<span class:open={mobileMenuOpen}></span>
	</button>
</header>
{#if mobileMenuOpen}
	<button
		class="mobile-menu-backdrop"
		type="button"
		aria-label="Close navigation menu"
		onclick={closeMobileMenu}
	></button>
	<nav id="mobile-navigation" class="mobile-nav" aria-label="Mobile navigation">
		<div class="mobile-nav-links">
			<a href={resolve('/#features')} onclick={closeMobileMenu}>Features</a>
			<a
				href="https://github.com/Erallie/stream-bridge#readme"
				target="_blank"
				rel="noreferrer"
				onclick={closeMobileMenu}
			>
				Documentation
			</a>
			<a href={resolve('/support')} onclick={closeMobileMenu}>Support</a>
			<a href={resolve('/privacy')} onclick={closeMobileMenu}>Privacy</a>
			<a href={resolve('/terms')} onclick={closeMobileMenu}>Terms</a>
		</div>
		<a
			class="button mobile-dashboard-button"
			href={resolve('/dashboard')}
			onclick={closeMobileMenu}
		>
			Dashboard
		</a>
	</nav>
{/if}
<main>{@render children()}</main>
<footer>
	<div class="footer-brand">
		<img class="footer-logo" src={logo} alt="StreamBridge logo" />

		<div>
			<strong>StreamBridge</strong>
			<br />
			One conversation, wherever your community chats.
		</div>
	</div>

	<div class="footer-links">
		<a href={resolve('/support')}>Support</a>
		<a href={resolve('/privacy')}>Privacy Policy</a>
		<a href={resolve('/terms')}>Terms of Service</a>
	</div>
</footer>
