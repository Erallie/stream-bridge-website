<script lang="ts">
    import { base } from '$app/paths';
    import { onMount } from 'svelte';
    import { PUBLIC_STREAMBRIDGE_API_URL } from '$env/static/public';

    type Identity = {
        provider: string;
        provider_user_id: string;
        display_name: string;
        avatar_url: string;
    };

    type Connection = {
        provider: string;
        provider_user_id: string;
        enabled: boolean;
        settings: Record<string, string>;
    };

    type Workspace = {
        id?: string;
        name: string;
        discord_guild_id: string | null;
        ssn_session_id: string | null;
        ssn_password: string | null;
        ssn_targets: string[];
        relay_template: string;
        transport_announcements: boolean;
        enabled: boolean;
        connections: Connection[];
        discord_channel_id: string | null;
        discord_enabled: boolean;
        discord_forward_enabled: boolean;
        discord_receive_enabled: boolean;
        runtime_status: {
            ssn: string;
            direct_platforms: string[];
        };
    };

    type AccountState = {
        authenticated: boolean;
        identities: Identity[];
    };

    type DiscordGuild = {
        id: string;
        name: string;
    };

    type DiscordChannel = {
        id: string;
        name: string;
        type: 'text' | 'voice';
    };

    const api = PUBLIC_STREAMBRIDGE_API_URL.replace(/\/$/, '');

    const providers = ['discord', 'google', 'twitch', 'kick'];
    const directPlatforms = ['twitch', 'kick', 'youtube'];

    let loading = $state(true);
    let error = $state('');
    let saved = $state('');
    let saveError = $state('');
    let saveTarget = $state<Workspace | null>(null);

    let me = $state<AccountState>({
        authenticated: false,
        identities: []
    });

    let workspaces = $state<Workspace[]>([]);
    let discordGuilds = $state<DiscordGuild[]>([]);
    let channelsByGuild = $state<Record<string, DiscordChannel[]>>({});

    function createBlankWorkspace(): Workspace {
        return {
            name: 'My stream',
            discord_guild_id: null,
            ssn_session_id: null,
            ssn_password: null,
            ssn_targets: ['twitch', 'youtube', 'kick'],
            relay_template: '{name} ({platform}) said: {message}',
            transport_announcements: true,
            enabled: true,
            connections: [],
            discord_channel_id: null,
            discord_enabled: false,
            discord_forward_enabled: true,
            discord_receive_enabled: true,
            runtime_status: {
                ssn: 'disconnected',
                direct_platforms: []
            }
        };
    }

    function providerName(provider: string): string {
        if (provider === 'google') {
            return 'Google / YouTube';
        }

        return provider[0].toUpperCase() + provider.slice(1);
    }

    function identityProvider(platform: string): string {
        return platform === 'youtube' ? 'google' : platform;
    }

    function platformName(platform: string): string {
        return platform === 'youtube'
            ? 'YouTube'
            : platform[0].toUpperCase() + platform.slice(1);
    }

    function findIdentity(provider: string): Identity | undefined {
        return me.identities.find(
            (identity) => identity.provider === provider
        );
    }

    async function request(
        path: string,
        options: RequestInit = {}
    ): Promise<any> {
        const response = await fetch(api + path, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        const body = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                body.error || `Request failed (${response.status})`
            );
        }

        return body;
    }

    async function initialRequest(path: string): Promise<any> {
        try {
            return await request(path);
        } catch (caughtError) {
            if (!(caughtError instanceof TypeError)) {
                throw caughtError;
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            return request(path);
        }
    }

    async function load(): Promise<void> {
        loading = true;
        error = '';

        try {
            me = await initialRequest('/dashboard/api/me');

            if (me.authenticated) {
                const [workspaceResult, guildResult] =
                    await Promise.allSettled([
                        initialRequest('/dashboard/api/workspaces'),
                        findIdentity('discord')
                            ? initialRequest('/dashboard/api/discord/guilds')
                            : Promise.resolve({ guilds: [] })
                    ]);

                if (workspaceResult.status === 'fulfilled') {
                    workspaces = workspaceResult.value.workspaces;
                    try {
                        await loadWorkspaceChannels(workspaces);
                    } catch (caughtError) {
                        error = caughtError instanceof Error
                            ? caughtError.message
                            : 'Could not load Discord channels';
                    }
                } else {
                    error = workspaceResult.reason instanceof Error
                        ? workspaceResult.reason.message
                        : 'Could not load bridges';
                }

                if (guildResult.status === 'fulfilled') {
                    discordGuilds = guildResult.value.guilds;
                } else if (!error) {
                    error = guildResult.reason instanceof Error
                        ? guildResult.reason.message
                        : 'Could not load Discord servers';
                }
            }
        } catch (caughtError) {
            me = {
                authenticated: false,
                identities: []
            };
            workspaces = [];
            discordGuilds = [];
            channelsByGuild = {};
            loading = false;
            error =
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Could not reach StreamBridge';
        } finally {
            loading = false;
        }
    }

    async function loadWorkspaceChannels(items: Workspace[]): Promise<void> {
        const guildIds = [
            ...new Set(
                items
                    .map((item) => item.discord_guild_id)
                    .filter((value): value is string => Boolean(value))
            )
        ];
        await Promise.all(guildIds.map(loadDiscordChannels));
    }

    async function loadDiscordChannels(guildId: string): Promise<void> {
        if (!guildId || channelsByGuild[guildId]) {
            return;
        }
        const data = await request(
            `/dashboard/api/discord/guilds/${guildId}/channels`
        );
        channelsByGuild = {
            ...channelsByGuild,
            [guildId]: data.channels
        };
    }

    function discordChannels(item: Workspace): DiscordChannel[] {
        return item.discord_guild_id
            ? channelsByGuild[item.discord_guild_id] || []
            : [];
    }

    function setSsnTargets(item: Workspace, value: string): void {
        item.ssn_targets = [
            ...new Set(
                value
                    .split(',')
                    .map((target) => target.trim().toLowerCase())
                    .filter(Boolean)
            )
        ];
    }

    function auth(provider: string, mode = 'login'): void {
        const returnTo = `${location.origin}${base}/dashboard`;

        location.href =
            `${api}/dashboard/auth/${provider}` +
            `?mode=${mode}` +
            `&return_to=${encodeURIComponent(returnTo)}`;
    }

    async function save(item: Workspace): Promise<void> {
        saved = '';
        saveError = '';
        saveTarget = item;

        try {
            const path = item.id
                ? `/dashboard/api/workspaces/${item.id}`
                : '/dashboard/api/workspaces';

            const result = await request(path, {
                method: item.id ? 'PATCH' : 'POST',
                body: JSON.stringify(item)
            });

            if (!item.id) {
                item.id = result.id;
            }

            await Promise.all(
                item.connections.map((connection) =>
                    request(
                        `/dashboard/api/workspaces/${item.id}/connections/${connection.provider}`,
                        {
                            method: 'PUT',
                            body: JSON.stringify({
                                provider_user_id:
                                    connection.provider_user_id,
                                enabled: connection.enabled,
                                settings: connection.settings
                            })
                        }
                    )
                )
            );

            saved = `${item.name} saved`;
        } catch (caughtError) {
            saveError =
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Could not save workspace';
        }
    }

    async function remove(item: Workspace): Promise<void> {
        if (!item.id || !confirm(`Delete ${item.name}?`)) {
            return;
        }

        await request(`/dashboard/api/workspaces/${item.id}`, {
            method: 'DELETE'
        });

        workspaces = workspaces.filter(
            (workspace) => workspace.id !== item.id
        );
    }

    function setConnection(
        item: Workspace,
        provider: string,
        identity: Identity,
        enabled: boolean
    ): void {
        const existing = item.connections.find(
            (connection) => connection.provider === provider
        );

        item.connections = [
            ...item.connections.filter(
                (connection) => connection.provider !== provider
            ),
            {
                provider,
                provider_user_id: identity.provider_user_id,
                enabled,
                settings: existing?.settings || {}
            }
        ];
    }

    async function logout(): Promise<void> {
        await request('/dashboard/api/logout', {
            method: 'POST'
        });

        me = {
            authenticated: false,
            identities: []
        };

        workspaces = [];
    }

    onMount(() => {
        load();
    });
</script>

<svelte:head>
    <title>Dashboard — StreamBridge</title>
</svelte:head>

<div class="page">
    <div class="page-title">
        <div class="eyebrow">Control center</div>

        <h1>StreamBridge dashboard</h1>

        <p class="muted">
            Link the accounts you use, then create a bridge for a
            Discord server or a standalone stream.
        </p>
    </div>

    {#if error}
        <div class="notice error">
            {error}
        </div>
    {/if}

    {#if loading && !error}
        <div class="panel">
            Loading your bridge…
        </div>
    {:else if !me.authenticated}
        <section class="panel">
            <h2>Sign in to continue</h2>

            <p class="muted">
                These providers only establish who you are.
                StreamBridge never receives your password.
            </p>

            <div class="card-grid">
                {#each providers as provider}
                    <button
                        class="button secondary"
                        onclick={() => auth(provider)}
                    >
                        Continue with {providerName(provider)}
                    </button>
                {/each}
            </div>
        </section>
    {:else}
        <section>
            <div class="workspace-header">
                <div>
                    <h2>Linked accounts</h2>

                    <p class="muted">
                        Authorize each platform once. Linked accounts can
                        sign you in and can be assigned to any bridge you
                        manage.
                    </p>
                </div>

                <button
                    class="button secondary small"
                    onclick={logout}
                >
                    Sign out
                </button>
            </div>

            <div class="card-grid">
                {#each providers as provider}
                    {@const identity = findIdentity(provider)}

                    <div class="panel account">
                        {#if identity?.avatar_url}
                            <img
                                class="avatar"
                                src={identity.avatar_url}
                                alt=""
                            />
                        {:else}
                            <div class="avatar"></div>
                        {/if}

                        <div>
                            <strong>
                                {providerName(provider)}
                            </strong>

                            <div class="muted">
                                {identity?.display_name || 'Not linked'}
                            </div>
                        </div>

                        <div class="account-actions">
                            {#if !identity}
                                <button
                                    class="button small"
                                    onclick={() => auth(provider, 'link')}
                                >
                                    Link
                                </button>
                            {:else}
                                <span aria-label="Linked">✓</span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </section>

        <section class="workspace">
            <div class="workspace-header">
                <div>
                    <h2>Your bridges</h2>

                    <p class="muted">
                        Choose a Discord server you administer, or
                        create a standalone bridge without Discord.
                    </p>
                </div>

                <button
                    class="button"
                    onclick={() => {
                        workspaces = [
                            ...workspaces,
                            createBlankWorkspace()
                        ];
                    }}
                >
                    New bridge
                </button>
            </div>

            {#if workspaces.length === 0}
                <div class="panel">
                    <h3>No bridges yet</h3>

                    <p class="muted">
                        Create one to begin configuring relay
                        connections.
                    </p>
                </div>
            {/if}

            {#each workspaces as item}
                <form
                    class="panel workspace"
                    onsubmit={(event) => {
                        event.preventDefault();
                        const targetsInput = event.currentTarget.elements
                            .namedItem('ssn_targets');
                        if (targetsInput instanceof HTMLInputElement) {
                            setSsnTargets(item, targetsInput.value);
                        }
                        save(item);
                    }}
                >
                    <div class="workspace-header">
                        <div>
                            <h2>
                                {item.name || 'Untitled bridge'}
                            </h2>

                            <div class="muted">
                                SSN: {item.runtime_status.ssn} · Direct:
                                {item.runtime_status.direct_platforms.join(', ') || 'none'}
                            </div>
                        </div>

                        <label class="check">
                            <input
                                type="checkbox"
                                bind:checked={item.enabled}
                            />

                            Running
                        </label>
                    </div>

                    <div class="form-grid">
                        <label>
                            Bridge name

                            <input
                                bind:value={item.name}
                                maxlength="80"
                                required
                            />
                        </label>

                        <label class="full">
                            Social Stream Ninja session ID

                            <span class="muted">Optional</span>

                            <input
                                type="password"
                                bind:value={item.ssn_session_id}
                                autocomplete="off"
                                spellcheck="false"
                            />

                            <span class="muted">
                                Leave blank and save to disconnect SSN.
                            </span>
                        </label>

                        <label class="full">
                            Direct relay message

                            <textarea
                                rows="2"
                                bind:value={item.relay_template}
                                required
                            ></textarea>

                            <span class="muted">
                                Must include {'{name}'},
                                {'{platform}'}, and {'{message}'}.
                            </span>
                        </label>

                        <label class="full">
                            SSN platforms

                            <input
                                name="ssn_targets"
                                value={item.ssn_targets.join(', ')}
                                onblur={(event) =>
                                    setSsnTargets(
                                        item,
                                        event.currentTarget.value
                                    )}
                                placeholder="twitch, youtube, kick, tiktok, ..."
                                spellcheck="false"
                            />

                            <span class="muted">
                                Enter any SSN platform identifiers,
                                separated by commas. This is not limited
                                to StreamBridge's direct platforms.
                            </span>
                        </label>

                        <div class="full">
                            <strong>
                                Direct platform connections
                            </strong>

                            <p class="muted">
                                Link an account above, then choose
                                which accounts this bridge may use
                                when SSN is unavailable. Changes take
                                effect when you press Save bridge.
                            </p>

                            <div class="checks">
                                {#each directPlatforms as platform}
                                    {@const identity = findIdentity(
                                        identityProvider(platform)
                                    )}

                                    {@const connected =
                                        item.connections.find(
                                            (connection) =>
                                                connection.provider ===
                                                platform
                                        )}

                                    <label class="check">
                                        <input
                                            type="checkbox"
                                            disabled={!identity}
                                            checked={Boolean(
                                                connected?.enabled
                                            )}
                                            onchange={(event) => {
                                                if (identity) {
                                                    setConnection(
                                                        item,
                                                        platform,
                                                        identity,
                                                        event.currentTarget
                                                            .checked
                                                    );
                                                }
                                            }}
                                        />

                                        {platformName(platform)}

                                        {#if !identity}
                                            (link first)
                                        {/if}
                                    </label>
                                {/each}

                                <label class="check">
                                    <input
                                        type="checkbox"
                                        disabled={!findIdentity('discord')}
                                        bind:checked={item.discord_enabled}
                                    />

                                    Discord

                                    {#if !findIdentity('discord')}
                                        (link first)
                                    {/if}
                                </label>
                            </div>
                        </div>

                        {#if item.discord_enabled}
                            <label>
                                Discord server

                                <select
                                    required
                                    value={item.discord_guild_id || ''}
                                    onchange={(event) => {
                                        item.discord_guild_id =
                                            event.currentTarget.value || null;
                                        item.discord_channel_id = null;
                                        if (item.discord_guild_id) {
                                            loadDiscordChannels(
                                                item.discord_guild_id
                                            );
                                        }
                                    }}
                                >
                                    <option value="">
                                        Select a Discord server
                                    </option>

                                    {#each discordGuilds as guild}
                                        <option value={guild.id}>
                                            {guild.name}
                                        </option>
                                    {/each}
                                </select>
                            </label>

                            {#if item.discord_guild_id}
                                <label>
                                    Discord relay channel

                                    <select
                                        bind:value={item.discord_channel_id}
                                        required
                                    >
                                        <option value="">
                                            Select a channel
                                        </option>

                                        {#each discordChannels(item) as channel}
                                            <option value={channel.id}>
                                                #{channel.name} ({channel.type})
                                            </option>
                                        {/each}
                                    </select>

                                    <span class="muted">
                                        The same text channel or
                                        voice-channel side chat is used in
                                        both directions.
                                    </span>
                                </label>

                                <div class="checks full">
                                    <label class="check">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                item.discord_forward_enabled
                                            }
                                        />

                                        Forward messages from Discord
                                    </label>

                                    <label class="check">
                                        <input
                                            type="checkbox"
                                            bind:checked={
                                                item.discord_receive_enabled
                                            }
                                        />

                                        Forward messages to Discord
                                    </label>
                                </div>
                            {/if}

                            <label class="check full">
                                <input
                                    type="checkbox"
                                    bind:checked={
                                        item.transport_announcements
                                    }
                                />

                                Announce switches between SSN and direct
                                relay in configured Discord channels
                            </label>
                        {/if}
                    </div>

                    <div class="workspace-actions">
                        <button
                            class="button"
                            type="submit"
                        >
                            Save bridge
                        </button>

                        {#if item.id}
                            <button
                                class="button danger"
                                type="button"
                                onclick={() => remove(item)}
                            >
                                Delete
                            </button>
                        {/if}
                    </div>

                    {#if saveTarget === item && saveError}
                        <div class="notice error">
                            {saveError}
                        </div>
                    {/if}

                    {#if saveTarget === item && saved}
                        <div class="notice">
                            {saved}
                        </div>
                    {/if}
                </form>
            {/each}
        </section>
    {/if}
</div>

<style>
    .workspace-actions {
        display: flex;
        justify-content: flex-start;
        gap: 12px;
        margin-top: 22px;
    }
</style>
