<script lang="ts">
	import logo from '$lib/assets/logo.svg';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<a class="brand" href={resolve('/')} aria-label="StreamBridge home">
		<img class="brand-logo" src={logo} alt="" />
		StreamBridge
	</a>
	<nav aria-label="Main navigation">
		<a href={resolve('/#features')}>Features</a>
		<a
			href="https://github.com/Erallie/stream-bridge#readme"
			target="_blank"
			rel="noreferrer"
		>
			Documentation
		</a>
		<a href={resolve('/support')}>Support</a>
		<a href={resolve('/privacy')}>Privacy</a>
		<a href={resolve('/terms')}>Terms</a>
		<a class="button small" href={resolve('/dashboard')}>Dashboard</a>
	</nav>
</header>
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
