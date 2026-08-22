<script lang="ts">import policy from '$lib/legal/privacy-policy.md?raw';import {markdown} from '$lib/markdown';</script>
<svelte:head><title>Privacy Policy — StreamBridge</title><meta name="description" content="StreamBridge privacy policy" /></svelte:head>
<article class="page legal">{@html markdown(policy)}</article>
