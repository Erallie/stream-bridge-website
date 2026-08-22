<script lang="ts">
    import policy from '$lib/legal/privacy-policy.md?raw';
    import { marked } from 'marked';
</script>

<svelte:head>
    <title>Privacy Policy — StreamBridge</title>
    <meta name="description" content="StreamBridge privacy policy" />
</svelte:head>

<article class="page legal">
    {@html marked.parse(policy)}
</article>