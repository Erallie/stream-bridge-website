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
    };

    type AccountState = {
        authenticated: boolean;
        identities: Identity[];
    };

    type DiscordGuild = {
        id: string;
        name: string;
    };

    const api = PUBLIC_STREAMBRIDGE_API_URL.replace(/\/$/, '');

    const providers = ['discord', 'google', 'twitch', 'kick'];
    const ssnPlatforms = ['discord', 'twitch', 'youtube', 'kick'];
    const directPlatforms = ['discord', 'youtube', 'twitch', 'kick'];

    let loading = $state(true);
    let error = $state('');
    let saved = $state('');

    let me = $state<AccountState>({
        authenticated: false,
        identities: []
    });

    let workspaces = $state<Workspace[]>([]);
    let discordGuilds = $state<DiscordGuild[]>([]);

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
            connections: []
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

    async function load(): Promise<void> {
        loading = true;
        error = '';

        try {
            me = await request('/dashboard/api/me');

            if (me.authenticated) {
                const [data, guildData] = await Promise.all([
                    request('/dashboard/api/workspaces'),
                    findIdentity('discord')
                        ? request('/dashboard/api/discord/guilds')
                        : Promise.resolve({ guilds: [] })
                ]);
                workspaces = data.workspaces;
                discordGuilds = guildData.guilds;
            }
        } catch (caughtError) {
            error =
                caughtError instanceof Error
                    ? caughtError.message
                    : 'Could not reach StreamBridge';
        } finally {
            loading = false;
        }
    }

    function auth(provider: string, mode = 'login'): void {
        const returnTo = `${location.origin}${base}/dashboard`;

        location.href =
            `${api}/dashboard/auth/${provider}` +
            `?mode=${mode}` +
            `&return_to=${encodeURIComponent(returnTo)}`;
    }

    async function save(item: Workspace): Promise<void> {
        error = '';
        saved = '';

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

            saved = `${item.name} saved`;

            await load();
        } catch (caughtError) {
            error =
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

    async function setConnection(
        item: Workspace,
        provider: string,
        identity: Identity,
        enabled: boolean
    ): Promise<void> {
        if (!item.id) {
            return;
        }

        await request(
            `/dashboard/api/workspaces/${item.id}/connections/${provider}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    provider_user_id: identity.provider_user_id,
                    enabled,
                    settings: {}
                })
            }
        );

        await load();
    }

    function toggleTarget(
        item: Workspace,
        platform: string
    ): void {
        if (item.ssn_targets.includes(platform)) {
            item.ssn_targets = item.ssn_targets.filter(
                (target) => target !== platform
            );
        } else {
            item.ssn_targets = [...item.ssn_targets, platform];
        }
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

    onMount(load);
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

    {#if saved}
        <div class="notice">
            {saved}
        </div>
    {/if}

    {#if loading}
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
                        save(item);
                    }}
                >
                    <div class="workspace-header">
                        <h2>
                            {item.name || 'Untitled bridge'}
                        </h2>

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

                        <label>
                            Discord server

                            <span class="muted">Optional</span>

                            <select
                                bind:value={item.discord_guild_id}
                            >
                                <option value="">
                                    None — standalone bridge
                                </option>

                                {#each discordGuilds as guild}
                                    <option value={guild.id}>
                                        {guild.name}
                                    </option>
                                {/each}
                            </select>

                            {#if !findIdentity('discord')}
                                <span class="muted">
                                    Link Discord above to select a server.
                                </span>
                            {/if}
                        </label>

                        <label class="full">
                            Social Stream Ninja session ID

                            <span class="muted">Optional</span>

                            <input
                                bind:value={item.ssn_session_id}
                                autocomplete="off"
                            />
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

                        <div class="full">
                            <strong>SSN platforms</strong>

                            <div class="checks">
                                {#each ssnPlatforms as platform}
                                    <label class="check">
                                        <input
                                            type="checkbox"
                                            checked={item.ssn_targets.includes(
                                                platform
                                            )}
                                            onchange={() =>
                                                toggleTarget(
                                                    item,
                                                    platform
                                                )}
                                        />

                                        {platform}
                                    </label>
                                {/each}
                            </div>
                        </div>

                        <div class="full">
                            <strong>
                                Direct platform connections
                            </strong>

                            <p class="muted">
                                Link an account above, save this
                                bridge, then choose which accounts it
                                may use when SSN is unavailable.
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
                                            disabled={!item.id || !identity}
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

                                        {platform}

                                        {#if !identity}
                                            (link first)
                                        {/if}
                                    </label>
                                {/each}
                            </div>
                        </div>

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
