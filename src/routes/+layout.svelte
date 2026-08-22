<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { base } from '$app/paths';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="site-header">
	<a class="brand" href={`${base}/`} aria-label="StreamBridge home">
        <img class="brand-logo" src={favicon} alt="" />
        StreamBridge
    </a>
	<nav aria-label="Main navigation">
        <a href={`${base}/#features`}>Features</a>
        <a href={`${base}/privacy`}>Privacy</a>
        <a href={`${base}/terms`}>Terms</a>
        <a class="button small" href={`${base}/dashboard`}>Dashboard</a>
    </nav>
</header>
<main>{@render children()}</main>
<footer>
    <div class="footer-brand">
        <img
            class="footer-logo"
            src={favicon}
            alt="StreamBridge logo"
        />

        <div>
            <strong>StreamBridge</strong>
            <br />
            One conversation, wherever your community chats.
        </div>
    </div>

    <div class="footer-links">
        <a href={`${base}/privacy`}>Privacy Policy</a>
        <a href={`${base}/terms`}>Terms of Service</a>
    </div>
</footer>
