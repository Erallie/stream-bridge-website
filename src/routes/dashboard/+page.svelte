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
		discord_guild_id: string | null;
		ssn_session_id: string | null;
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
	const discordInviteUrl = 'https://discord.com/oauth2/authorize?client_id=1538972596165419069';
	const providerLogos: Record<string, string> = {
		discord: 'https://cdn.simpleicons.org/discord/5865F2',
		google: 'https://cdn.simpleicons.org/google',
		twitch: 'https://cdn.simpleicons.org/twitch/9146FF',
		kick: 'https://cdn.simpleicons.org/kick/53FC18'
	};

	let loading = $state(true);
	let error = $state('');
	let saved = $state('');
	let saveError = $state('');
	let saveTarget = $state<Workspace | null>(null);
	let accountMessage = $state('');
	let accountError = $state('');
	let disconnectingProvider = $state('');
	let showSsnSessionId = $state(false);

	let me = $state<AccountState>({
		authenticated: false,
		identities: []
	});

	let workspaces = $state<Workspace[]>([]);
	let discordGuilds = $state<DiscordGuild[]>([]);
	let channelsByGuild = $state<Record<string, DiscordChannel[]>>({});

	function providerName(provider: string): string {
		if (provider === 'google') {
			return 'Google / YouTube';
		}

		return provider[0].toUpperCase() + provider.slice(1);
	}

	function providerLogo(provider: string): string {
		return providerLogos[provider] || '';
	}

	function identityProvider(platform: string): string {
		return platform === 'youtube' ? 'google' : platform;
	}

	function platformName(platform: string): string {
		return platform === 'youtube' ? 'YouTube' : platform[0].toUpperCase() + platform.slice(1);
	}

	function activeConnections(item: Workspace): string {
		const platforms = item.runtime_status.direct_platforms.map(platformName);
		if (item.discord_enabled) {
			platforms.push('Discord');
		}
		return [...new Set(platforms)].join(', ') || 'none';
	}

	function findIdentity(provider: string): Identity | undefined {
		return me.identities.find((identity) => identity.provider === provider);
	}

	async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
		const response = await fetch(api + path, {
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {})
			},
			...options
		});

		const body: unknown = await response.json().catch(() => ({}));

		if (!response.ok) {
			const message =
				typeof body === 'object' && body !== null && 'error' in body
					? String(body.error)
					: `Request failed (${response.status})`;
			throw new Error(message);
		}

		return body as T;
	}

	async function initialRequest<T>(path: string): Promise<T> {
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
			me = await initialRequest<AccountState>('/dashboard/api/me');

			if (me.authenticated) {
				const [workspaceResult, guildResult] = await Promise.allSettled([
					initialRequest<{ workspaces: Workspace[] }>('/dashboard/api/workspaces'),
					findIdentity('discord')
						? initialRequest<{ guilds: DiscordGuild[] }>('/dashboard/api/discord/guilds')
						: Promise.resolve({ guilds: [] })
				]);

				if (workspaceResult.status === 'fulfilled') {
					workspaces = workspaceResult.value.workspaces;
					try {
						await loadWorkspaceChannels(workspaces);
					} catch (caughtError) {
						error =
							caughtError instanceof Error
								? caughtError.message
								: 'Could not load Discord channels';
					}
				} else {
					error =
						workspaceResult.reason instanceof Error
							? workspaceResult.reason.message
							: 'Could not load bridges';
				}

				if (guildResult.status === 'fulfilled') {
					discordGuilds = guildResult.value.guilds;
				} else if (!error) {
					error =
						guildResult.reason instanceof Error
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
			error = caughtError instanceof Error ? caughtError.message : 'Could not reach StreamBridge';
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
		const data = await request<{ channels: DiscordChannel[] }>(
			`/dashboard/api/discord/guilds/${guildId}/channels`
		);
		channelsByGuild = {
			...channelsByGuild,
			[guildId]: data.channels
		};
	}

	function discordChannels(item: Workspace): DiscordChannel[] {
		return item.discord_guild_id ? channelsByGuild[item.discord_guild_id] || [] : [];
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

	async function disconnect(provider: string): Promise<void> {
		const name = providerName(provider);
		if (
			!confirm(
				`Disconnect ${name} from StreamBridge? Its saved authorization and direct relay assignment will be removed.`
			)
		) {
			return;
		}

		accountMessage = '';
		accountError = '';
		disconnectingProvider = provider;

		try {
			await request(`/dashboard/api/identities/${provider}`, {
				method: 'DELETE'
			});
			await load();
			accountMessage = `${name} disconnected`;
		} catch (caughtError) {
			accountError =
				caughtError instanceof Error ? caughtError.message : `Could not disconnect ${name}`;
		} finally {
			disconnectingProvider = '';
		}
	}

	async function save(item: Workspace): Promise<void> {
		saved = '';
		saveError = '';
		saveTarget = item;

		try {
			if (!item.id) {
				throw new Error('Your bridge has not finished loading');
			}

			await request(`/dashboard/api/workspaces/${item.id}`, {
				method: 'PATCH',
				body: JSON.stringify(item)
			});

			saved = 'Bridge saved';
            setTimeout(() => {
                if (saved === 'Bridge saved') {
                    saved = '';
                }
            }, 10000);
		} catch (caughtError) {
			saveError = caughtError instanceof Error ? caughtError.message : 'Could not save workspace';
		}
	}

	function setConnection(
		item: Workspace,
		provider: string,
		identity: Identity,
		enabled: boolean
	): void {
		const existing = item.connections.find((connection) => connection.provider === provider);

		item.connections = [
			...item.connections.filter((connection) => connection.provider !== provider),
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
    <link rel="canonical" href="https://streambridge.gozarproductions.com/dashboard" />
</svelte:head>

<div class="page">
	<div class="page-title">
		<div class="eyebrow">Control center</div>

		<h1>StreamBridge dashboard</h1>

		<p class="muted">
			Link the accounts you use, then create a bridge for a Discord server or a standalone stream.
		</p>
	</div>

	{#if error}
		<div class="notice error">
			{error}
		</div>
	{/if}

	{#if loading && !error}
		<div class="panel">Loading your bridge…</div>
	{:else if !me.authenticated}
		<section class="panel">
			<h2>Sign in to continue</h2>

			<p class="muted">
				These providers only establish who you are. StreamBridge never receives your password.
			</p>

			<div class="card-grid">
				{#each providers as provider (provider)}
					<button class="button secondary" onclick={() => auth(provider)}>
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
						Authorize each platform once. Linked accounts can sign you in and can be assigned to any
						bridge you manage.
					</p>
				</div>

				<button class="button secondary small" onclick={logout}> Sign out </button>
			</div>

			<div class="card-grid">
				{#each providers as provider (provider)}
					{@const identity = findIdentity(provider)}

					<div class="panel account">
						{#if identity?.avatar_url}
							<img class="avatar" src={identity.avatar_url} alt="" />
						{:else}
							<div class="avatar provider-logo-container">
                                <img
                                    class="provider-logo"
                                    src={providerLogo(provider)}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </div>
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
								<button class="button small" onclick={() => auth(provider, 'link')}> Link </button>
							{:else}
								<span aria-label="Linked">✓</span>
								<button
									class="button secondary small"
									type="button"
									disabled={Boolean(disconnectingProvider)}
									onclick={() => disconnect(provider)}
								>
									{disconnectingProvider === provider ? 'Disconnecting…' : 'Disconnect'}
								</button>
							{/if}

							{#if provider === 'discord'}
								<a
									class="button secondary small"
									href={discordInviteUrl}
									target="_blank"
									rel="noreferrer"
								>
									Invite bot
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			{#if accountMessage}
				<div class="notice success" role="status">{accountMessage}</div>
			{/if}

			{#if accountError}
				<div class="notice error" role="alert">{accountError}</div>
			{/if}
		</section>

		<section class="workspace">
			<div class="workspace-header">
				<div>
					<h2>Your bridge</h2>

					<p class="muted">
						Configure chat relay for your connected streaming accounts, with or without Discord.
					</p>
				</div>
			</div>

			{#each workspaces as item (item.id)}
				<form
					class="panel workspace"
					onsubmit={(event) => {
						event.preventDefault();
						const targetsInput = event.currentTarget.elements.namedItem('ssn_targets');
						if (targetsInput instanceof HTMLInputElement) {
							setSsnTargets(item, targetsInput.value);
						}
						save(item);
					}}
				>
					<div class="workspace-header">
						<div>
							<h2>Bridge status</h2>

							<div class="muted">
								SSN: {item.runtime_status.ssn} · Direct:
								{activeConnections(item)}
							</div>
						</div>

						<label class="check">
							<input type="checkbox" bind:checked={item.enabled} />

							Running
						</label>
					</div>

					<div class="configuration-sections">
						<section class="configuration-section">
							<div class="configuration-heading">
								<h3>Social Stream Ninja Connection</h3>

								<p class="muted">
									Connect this bridge to Social Stream Ninja and choose which SSN platforms receive
									relayed messages.
								</p>
							</div>

							<div class="form-grid">
								<div class="full field">
									<div>
										Social Stream Ninja session ID

										<span class="muted">Optional</span>
									</div>

									<div class="input-with-action">
										<input
											type={showSsnSessionId ? 'text' : 'password'}
											bind:value={item.ssn_session_id}
											autocomplete="off"
											spellcheck="false"
										/>

										<button
											class="icon-button"
											type="button"
											aria-label={showSsnSessionId ? 'Hide session ID' : 'Show session ID'}
											title={showSsnSessionId ? 'Hide session ID' : 'Show session ID'}
											onclick={() => (showSsnSessionId = !showSsnSessionId)}
										>
											{#if showSsnSessionId}
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9.5 5.1 9.5 5.1a13.2 13.2 0 0 1-3 3.5M6.6 6.7A15.8 15.8 0 0 0 2.5 12s4 5 9.5 5a10 10 0 0 0 3.3-.6" />
												</svg>
											{:else}
												<svg viewBox="0 0 24 24" aria-hidden="true">
													<path d="M2.5 12S6.5 7 12 7s9.5 5 9.5 5-4 5-9.5 5-9.5-5-9.5-5Z" />
													<circle cx="12" cy="12" r="2.5" />
												</svg>
											{/if}
										</button>
									</div>

									<span class="muted"> Leave blank and save to disconnect SSN. </span>
								</div>

								<label class="full">
									SSN platforms

									<input
										name="ssn_targets"
										value={item.ssn_targets.join(', ')}
										onblur={(event) => setSsnTargets(item, event.currentTarget.value)}
										placeholder="twitch, youtube, kick, tiktok, ..."
										spellcheck="false"
									/>

									<span class="muted">
										Enter any SSN platform identifiers, separated by commas. This is not limited to
										StreamBridge's direct platforms. See the
                                        <a
                                            href="https://socialstream.ninja/docs/supported-sites.html"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            supported SSN platforms
                                        </a>.
									</span>
								</label>
							</div>
						</section>

						<section class="configuration-section">
							<div class="configuration-heading">
								<h3>Direct Connection</h3>

								<p class="muted">
									Configure the connections StreamBridge uses when relaying directly between
									platforms.
								</p>
							</div>

							<div class="form-grid">
								<div class="full">
									<span class="field-label">Direct platform connections</span>

									<p class="muted">
										Link an account above, then choose which accounts this bridge may use when SSN
										is unavailable. Changes take effect when you press Save bridge.
									</p>

									<div class="checks">
										{#each directPlatforms as platform (platform)}
											{@const identity = findIdentity(identityProvider(platform))}

											{@const connected = item.connections.find(
												(connection) => connection.provider === platform
											)}

											<label class="check">
												<input
													type="checkbox"
													disabled={!identity}
													checked={Boolean(connected?.enabled)}
													onchange={(event) => {
														if (identity) {
															setConnection(item, platform, identity, event.currentTarget.checked);
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

								<label class="full">
									Direct relay message

									<textarea rows="2" bind:value={item.relay_template} required></textarea>

									<span class="muted">
										Must include {'{name}'},
										{'{platform}'}, and {'{message}'}.
									</span>
								</label>

								{#if item.discord_enabled}
									<label>
										Discord server

										<select
											required
											value={item.discord_guild_id || ''}
											onchange={(event) => {
												item.discord_guild_id = event.currentTarget.value || null;
												item.discord_channel_id = null;
												if (item.discord_guild_id) {
													loadDiscordChannels(item.discord_guild_id);
												}
											}}
										>
											<option value=""> Select a Discord server </option>

											{#each discordGuilds as guild (guild.id)}
												<option value={guild.id}>
													{guild.name}
												</option>
											{/each}
										</select>
									</label>

									{#if item.discord_guild_id}
										<label>
											Discord relay channel

											<select bind:value={item.discord_channel_id} required>
												<option value=""> Select a channel </option>

												{#each discordChannels(item) as channel (channel.id)}
													<option value={channel.id}>
														#{channel.name} ({channel.type})
													</option>
												{/each}
											</select>

											<span class="muted">
												The same text channel or voice-channel side chat is used in both directions.
											</span>
										</label>

										<div class="checks full">
											<label class="check">
												<input type="checkbox" bind:checked={item.discord_forward_enabled} />

												Forward messages from Discord
											</label>

											<label class="check">
												<input type="checkbox" bind:checked={item.discord_receive_enabled} />

												Forward messages to Discord
											</label>
										</div>
									{/if}

									<label class="check full">
										<input type="checkbox" bind:checked={item.transport_announcements} />

										Announce switches between SSN and direct relay in configured Discord channels
									</label>
								{/if}
							</div>
						</section>
					</div>

					<div class="workspace-actions">
						<button class="button" type="submit"> Save bridge </button>
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
	.configuration-sections {
		display: grid;
		gap: 22px;
	}

	.configuration-section {
		padding: 22px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.025);
	}

	.configuration-heading {
		margin-bottom: 18px;
	}

	.configuration-heading h3,
	.configuration-heading p {
		margin-top: 0;
	}

	.configuration-heading p {
		margin-bottom: 0;
	}

	.workspace-actions {
		display: flex;
		justify-content: flex-start;
		gap: 12px;
		margin-top: 22px;
	}

	.field-label {
		color: #cfd0d6;
		font-size: 13px;
		font-weight: 600;
	}
</style>
