<script lang="ts">
	import policy from '$lib/legal/privacy-policy.md?raw';
	import { renderLegalMarkdown } from '$lib/legal-markdown';

	const renderedPolicy = renderLegalMarkdown(policy);
</script>

<svelte:head>
	<title>Privacy Policy — StreamBridge</title>
	<meta name="description" content="StreamBridge privacy policy" />
    <link rel="canonical" href="https://streambridge.gozarproductions.com/privacy" />
</svelte:head>

<article class="page legal">
	{@html renderedPolicy}
</article>
