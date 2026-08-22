<script lang="ts">
    import terms from '$lib/legal/terms-of-service.md?raw';
    import { marked } from 'marked';
</script>

<svelte:head>
    <title>Terms of Service — StreamBridge</title>
    <meta name="description" content="StreamBridge terms of service" />
</svelte:head>

<article class="page legal">
    {@html marked.parse(terms)}
</article>