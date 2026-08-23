import{$ as e,P as t,Q as n,R as r,S as i,X as a,Y as o,h as s,v as c,w as l}from"../chunks/BZsPUVZv.js";import"../chunks/xihTtKlq.js";import{t as u}from"../chunks/B6Znjcr-.js";var d=`# StreamBridge Privacy Policy\r
\r
**Last updated:** August 23, 2026\r
\r
This Privacy Policy explains how StreamBridge (“StreamBridge,” “we,” “us,” or “the Bot”), operated by **Gozar Productions LLC**, accesses, processes, stores, shares, and deletes information when it is added to a Discord server or connected to Twitch, YouTube, Kick, or Social Stream Ninja.\r
\r
Contact us with privacy questions or deletion requests at **contact@gozarproductions.com**.\r
\r
## 1. Scope\r
\r
This Privacy Policy applies to:\r
\r
- The StreamBridge Discord bot\r
- The StreamBridge website and account dashboard\r
- StreamBridge’s OAuth authorization pages and callback endpoints\r
- Direct Twitch, YouTube, and Kick integrations\r
- Optional Social Stream Ninja integrations\r
- Messages processed or relayed by StreamBridge\r
\r
It does not govern Discord, Twitch, Google, YouTube, Kick, Social Stream Ninja, Cloudflare, or any other third-party service. Those services process information according to their own privacy policies.\r
\r
## 2. How StreamBridge works\r
\r
StreamBridge relays chat messages between an optionally configured Discord channel and enabled streaming platforms. A bridge can also operate without Discord.\r
\r
Depending on a dashboard user’s or server administrator’s configuration, StreamBridge may:\r
\r
- Relay messages from one streaming platform to other connected platforms\r
- Read messages sent in the specifically configured shared Discord relay channel\r
- Forward those messages to Twitch, YouTube, Kick, or Social Stream Ninja\r
- Receive public livestream chat messages from connected platforms\r
- Repost those messages in a configured Discord channel\r
- Connect to a Social Stream Ninja session\r
- Automatically switch between Social Stream Ninja and direct platform connections\r
- Suppress duplicate messages and relay loops\r
\r
StreamBridge does not use artificial intelligence or language models to analyze messages.\r
\r
## 3. Information StreamBridge accesses and processes\r
\r
### 3.1 Discord server information\r
\r
StreamBridge may access or store:\r
\r
- Discord server IDs\r
- The ID of the shared Discord relay channel, when configured\r
- Discord server names while constructing relay messages\r
- Server-specific relay settings\r
- Whether transport-switch notices are enabled\r
- The direct relay message template selected by a dashboard user or administrator\r
\r
Discord IDs are numeric identifiers assigned by Discord.\r
\r
### 3.2 Discord message information\r
\r
StreamBridge processes Discord messages for relay only when they are sent in the shared channel selected with \`/channel set\` or through the dashboard and forwarding from Discord is enabled.\r
\r
For those messages, StreamBridge may process:\r
\r
- Message ID\r
- Message text\r
- Message timestamp\r
- Author’s Discord user ID\r
- Author’s display name\r
- Author’s display avatar URL\r
- Author’s displayed role color\r
- Custom Discord emote names and image URLs\r
- Resolved user, role, and channel mentions\r
- The URL of the first attached image, when applicable\r
- Discord server name\r
- Source channel ID\r
\r
StreamBridge ignores messages sent by bots and webhooks for forwarding purposes.\r
\r
Message content is processed so it can be relayed to destinations selected by the Discord server’s administrators. StreamBridge does not intentionally write the full Discord message body to its configuration database.\r
\r
A copy of the message may be stored by Discord or by each destination platform after StreamBridge posts it there. Those copies are controlled by the relevant platform and server or channel owner.\r
\r
### 3.3 Streaming-platform chat information\r
\r
For Twitch, YouTube, Kick, and messages received through Social Stream Ninja, StreamBridge may process:\r
\r
- Platform name\r
- Platform message ID\r
- Chatter’s platform user or channel ID\r
- Username or display name\r
- Message text\r
- Profile image URL\r
- Username color, when supplied by the platform\r
- Message timestamp\r
- Broadcaster or channel information\r
- Whether the message appears to be a bot message, reflection, or duplicate\r
\r
This information is used to display and relay the message and to prevent duplicates.\r
\r
StreamBridge does not intentionally create permanent archives of complete livestream chat messages. Copies posted into Discord or other streaming chats remain subject to those platforms’ retention and deletion systems.\r
\r
### 3.4 Social Stream Ninja information\r
\r
When a dashboard user or administrator connects Social Stream Ninja through the dashboard or \`/ssn connect\`, StreamBridge stores:\r
\r
- The Social Stream Ninja session ID\r
- The selected relay-target platforms\r
- Connection and transport state while the Bot is operating\r
\r
The session ID is masked when displayed through \`/status\`.\r
\r
StreamBridge does not require or store the separate password used for password-protected Social Stream Ninja overlay or VDO rooms.\r
\r
Messages routed through Social Stream Ninja may be processed by Social Stream Ninja’s infrastructure according to its own practices.\r
\r
### 3.5 Dashboard accounts, linked identities, and sessions\r
\r
Users may sign in to the StreamBridge dashboard with Discord, Google, Twitch, or Kick and may link additional supported identities to the same StreamBridge account. For each linked identity, StreamBridge stores:\r
\r
- Platform name\r
- Platform account identifier\r
- Display name\r
- Profile image URL, when supplied\r
- Granted OAuth scopes\r
- Encrypted OAuth access and refresh tokens, when supplied by the platform\r
- Creation and update timestamps\r
\r
StreamBridge also stores an internal dashboard-account identifier and the configuration for that account’s single bridge. A bridge may be configured with or without a Discord server.\r
\r
After a successful sign-in, StreamBridge places a random session cookie in the user’s browser. The cookie is HTTP-only, is sent only to the dashboard API, and normally expires after 30 days. StreamBridge stores a SHA-256 hash of the session token, the associated dashboard-account identifier, and session timestamps in its database rather than storing the raw session token.\r
\r
### 3.6 YouTube authorization information\r
\r
When a user authorizes Google/YouTube, StreamBridge stores:\r
\r
- Dashboard account associated with the authorization\r
- Google account subject identifier\r
- Google display name and profile image URL, when supplied\r
- Granted OAuth scopes\r
- Encrypted OAuth access and refresh tokens\r
\r
StreamBridge requests the following Google OAuth scope:\r
\r
\`\`\`text\r
https://www.googleapis.com/auth/youtube.force-ssl\r
\`\`\`\r
\r
This scope can permit broad YouTube account actions. StreamBridge’s current implementation uses it only to:\r
\r
- Identify the authorized YouTube channel\r
- Discover that channel’s active livestream\r
- Read messages from its active live chat\r
- Post relayed messages into its active live chat\r
- Refresh the authorization token as needed\r
\r
StreamBridge does not use this permission to upload, edit, or delete videos; manage playlists; read viewing history; access private messages; or obtain the Google account password.\r
\r
StreamBridge never receives or stores the user’s Google password. Authentication occurs directly on Google’s website.\r
\r
StreamBridge uses YouTube API Services. Its use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including its Limited Use requirements.\r
\r
Use of YouTube features is also subject to the [Google Privacy Policy](https://policies.google.com/privacy), [YouTube Terms of Service](https://www.youtube.com/t/terms), and [YouTube API Services Developer Policies](https://developers.google.com/youtube/terms/developer-policies).\r
\r
### 3.7 Kick authorization information\r
\r
When a user authorizes Kick, StreamBridge stores:\r
\r
- Dashboard account associated with the authorization\r
- Kick broadcaster user ID\r
- Kick broadcaster username\r
- Kick profile image URL, when supplied\r
- Granted OAuth scopes\r
- Encrypted OAuth access and refresh tokens\r
\r
StreamBridge requests these Kick permissions:\r
\r
\`\`\`text\r
user:read\r
chat:write\r
events:subscribe\r
\`\`\`\r
\r
They are used to:\r
\r
- Identify the authorized broadcaster\r
- Subscribe to that broadcaster’s chat-message events\r
- Receive public chat messages\r
- Post relayed messages using the linked Kick account\r
\r
Although Kick may make additional user information available under an authorized scope, StreamBridge’s current implementation stores only the broadcaster ID, username, profile image URL when supplied, granted scopes, and authorization tokens needed for these functions. It does not intentionally store the broadcaster’s email address.\r
\r
StreamBridge never receives or stores the user’s Kick password. Authentication occurs directly on Kick’s website.\r
\r
### 3.8 Twitch information\r
\r
When a user links Twitch through the dashboard, StreamBridge stores the Twitch account ID, display name, profile image URL, granted OAuth scopes, and encrypted access and refresh tokens. A linked Twitch account may be assigned to the single bridge owned by that dashboard account.\r
\r
For Twitch chat, StreamBridge may process:\r
\r
- Channel name\r
- Message ID\r
- Chatter’s Twitch user ID\r
- Login name and display name\r
- Message text\r
- Profile image URL\r
- Username color\r
\r
A short-lived in-memory cache may retain Twitch user IDs or login names and profile-image URLs to reduce repeated API lookups:\r
\r
- Successful avatar lookups may be cached for approximately 24 hours.\r
- Failed avatar lookups may be cached for approximately 5 minutes.\r
- The cache is held in memory and is lost when StreamBridge restarts.\r
- The cache is periodically pruned and bounded in size.\r
\r
StreamBridge uses the linked Twitch identity to read and post chat for an enabled bridge. Other dashboard accounts and Discord servers do not receive that account's OAuth credentials.\r
\r
### 3.9 OAuth state and temporary authorization data\r
\r
Discord, Google/YouTube, Twitch, and Kick dashboard authorization links use random state values to associate an OAuth response with the correct dashboard session.\r
\r
Pending authorization data:\r
\r
- Is stored temporarily in the StreamBridge database\r
- Is associated with a dashboard session when linking another identity\r
- Expires after approximately ten minutes\r
- Is removed after use or expiration\r
- Does not include a user’s platform password\r
\r
Kick authorization also uses a PKCE verifier, which is stored temporarily in the StreamBridge OAuth-state database record until the authorization completes or expires.\r
\r
### 3.10 Duplicate-prevention and delivery history\r
\r
To prevent duplicate deliveries and relay loops, StreamBridge stores limited event and delivery records containing:\r
\r
- Discord server ID\r
- A generated event key\r
- Source platform\r
- Original platform message ID, when available\r
- A SHA-256 fingerprint derived from the platform, user identifier, and normalized message text\r
- Destination identifier\r
- Delivery status\r
- Creation timestamp\r
\r
The fingerprint is a one-way hash rather than a stored copy of the message. However, it is still associated with platform and server records.\r
\r
Duplicate-prevention and delivery records are retained for approximately **30 days** and are removed during scheduled maintenance.\r
\r
StreamBridge also keeps a short-lived, in-memory reflection tracker for messages it recently sent. Those entries normally expire after approximately two minutes and are not written to the database.\r
\r
### 3.11 Logs\r
\r
StreamBridge creates operational logs that may include:\r
\r
- Timestamps\r
- Platform names\r
- Discord server or channel IDs\r
- Connected channel names\r
- Connection and retry events\r
- Command or API errors\r
- Delivery failures\r
\r
StreamBridge is designed not to log OAuth access tokens, refresh tokens, client secrets, Discord bot tokens, or account passwords.\r
\r
Unexpected errors returned by third-party platforms may include limited response details. Log retention depends on the operator’s server configuration and is not currently controlled by StreamBridge itself.\r
\r
## 4. Information StreamBridge does not intentionally collect\r
\r
StreamBridge does not intentionally collect or use:\r
\r
- Discord account passwords\r
- Google account passwords\r
- Twitch account passwords\r
- Kick account passwords\r
- Payment-card information\r
- Precise location\r
- Contact lists\r
- Browsing history\r
- Private Discord messages outside configured server channels\r
- Messages from Discord channels not selected for forwarding\r
- Voice or video content\r
- Biometric information\r
- Data for advertising profiles\r
- Data for training artificial-intelligence models\r
\r
## 5. How information is used\r
\r
StreamBridge uses information only as reasonably necessary to:\r
\r
- Provide cross-platform chat relay\r
- Display streaming messages in Discord\r
- Send Discord messages to configured platforms\r
- Authenticate authorized YouTube and Kick accounts\r
- Find active YouTube livestream chats\r
- Subscribe to Kick chat events\r
- Look up Twitch profile images\r
- Maintain server-specific settings\r
- Detect duplicates and prevent relay loops\r
- Diagnose failures, secure the service, and maintain reliability\r
- Comply with legal obligations and platform rules\r
\r
StreamBridge does not sell personal information or use it for targeted advertising.\r
\r
## 6. How information is shared\r
\r
StreamBridge shares information only as needed to provide the configured relay service.\r
\r
### 6.1 Administrator-selected destinations\r
\r
A message sent in the configured shared Discord relay channel, or in a connected streaming chat, may be sent to:\r
\r
- Twitch\r
- YouTube\r
- Kick\r
- The configured shared Discord relay channel\r
- Social Stream Ninja\r
- Other platforms selected through Social Stream Ninja\r
\r
Relaying necessarily makes the sender’s display name, source platform, message, and potentially avatar visible to users of those destinations.\r
\r
Server administrators are responsible for telling their communities when a channel is connected to StreamBridge.\r
\r
### 6.2 Service providers and infrastructure\r
\r
Information may pass through infrastructure used to operate StreamBridge, including:\r
\r
- Discord\r
- Google and YouTube\r
- Twitch\r
- Kick\r
- Social Stream Ninja\r
- Cloudflare, for secure OAuth callbacks and Kick webhooks\r
- The server or hosting provider running StreamBridge\r
\r
These providers process information according to their own terms and privacy policies.\r
\r
### 6.3 Legal and safety disclosures\r
\r
We may disclose information if reasonably necessary to:\r
\r
- Comply with law, regulation, subpoena, court order, or valid legal process\r
- Protect the safety, rights, or property of users, the public, StreamBridge, or its operator\r
- Investigate abuse, fraud, security incidents, or violations of the Terms of Service\r
- Enforce agreements or platform requirements\r
\r
### 6.4 Business transfers\r
\r
If StreamBridge or its operation is transferred to another owner, information necessary to operate the service may be transferred as part of that transaction. Users will be notified through an appropriate public notice if this materially changes the handling of their information.\r
\r
## 7. Data retention\r
\r
StreamBridge generally retains information as follows:\r
\r
- **Server configuration:** Until changed, cleared, or deleted at an administrator’s request\r
- **Linked platform authorization records:** Until the identity is unlinked, the authorization becomes unusable, or deletion is requested\r
- **Dashboard sessions:** Until logout, deletion, or expiration, normally no more than 30 days\r
- **Duplicate and delivery history:** Approximately 30 days\r
- **Pending OAuth state:** Approximately ten minutes\r
- **Reflection tracking:** Approximately two minutes in memory\r
- **Twitch avatar cache:** Approximately 24 hours for successful lookups or five minutes for failed lookups\r
- **Operational logs:** According to the operator’s server and logging configuration\r
- **Message content:** Processed in transit and not intentionally stored as full message text in StreamBridge’s database\r
\r
Removing StreamBridge from a Discord server does not necessarily delete all stored server configuration automatically. A server owner or authorized administrator should contact **contact@gozarproductions.com** to request complete deletion.\r
\r
Backups, if maintained, may retain deleted records temporarily until they are overwritten through the normal backup cycle.\r
\r
## 8. Security\r
\r
StreamBridge uses reasonable technical measures designed to protect information, including:\r
\r
- Encryption of stored Discord, Google/YouTube, Twitch, and Kick access and refresh tokens using Fernet symmetric encryption\r
- HTTPS for OAuth callbacks\r
- TLS-protected connections to supported platform APIs\r
- Signed-webhook verification for Kick events\r
- PKCE for Kick OAuth authorization\r
- Random, expiring OAuth state values\r
- Server-side OAuth callbacks; platform secrets are never embedded in the static website\r
- Restricted server-side storage for credentials and tokens\r
- Avoidance of secrets in normal application logs\r
\r
No system can guarantee absolute security. Users should immediately contact **contact@gozarproductions.com** if they believe an account or authorization has been compromised.\r
\r
## 9. User and administrator choices\r
\r
Discord server administrators can limit StreamBridge’s access by:\r
\r
- Selecting one shared relay channel and its forwarding directions with \`/channel set\` or the dashboard\r
- Disabling Discord integration with \`/channel remove\` while retaining the saved channel and direction settings\r
- Disconnecting Social Stream Ninja with \`/ssn disconnect\`\r
- Enabling or disabling a linked direct connection with \`/direct enable\`, \`/direct disable\`, or the dashboard\r
- Removing StreamBridge from the Discord server\r
\r
Dashboard users can disconnect a linked identity with the **Disconnect** button. Disconnecting deletes StreamBridge’s stored identity record and encrypted OAuth credentials and removes direct-relay assignments that depend on that identity. Disconnecting Discord disables Discord relay for the bridge but preserves its selected server and channel configuration. To avoid locking a user out, StreamBridge requires another sign-in identity to be linked before the final identity can be disconnected.\r
\r
Disabling a platform connection without disconnecting its identity does not delete the identity or revoke the platform grant. Disconnecting an identity from StreamBridge also does not necessarily revoke the authorization at the provider; users should revoke it through the provider’s account settings when desired.\r
\r
### Revoke Google or YouTube access\r
\r
Users can review or revoke StreamBridge’s Google authorization from their [Google Account connections page](https://myaccount.google.com/connections).\r
\r
### Revoke Kick access\r
\r
Users may revoke access through Kick’s account or connected-application settings when available. They may also contact **contact@gozarproductions.com** for assistance deleting StreamBridge’s stored Kick authorization.\r
\r
### Revoke Discord or Twitch access\r
\r
Users may revoke StreamBridge through Discord’s or Twitch’s authorized-application settings. They may also use the dashboard’s **Disconnect** button to delete StreamBridge’s locally stored identity and authorization credentials, subject to the requirement to retain at least one sign-in method.\r
\r
### Request deletion\r
\r
A Discord server owner, authorized server administrator, or authorized platform-account owner may request access to or deletion of applicable stored information by emailing:\r
\r
**contact@gozarproductions.com**\r
\r
Please include:\r
\r
- The Discord server ID\r
- Your Discord user ID\r
- The connected platform\r
- Enough information to confirm that you are authorized to make the request\r
\r
Do not include passwords, bot tokens, OAuth tokens, or client secrets.\r
\r
We may need to verify the requester’s authority before disclosing or deleting server-level records.\r
\r
## 10. Legal rights\r
\r
Depending on where you live, you may have rights regarding personal information, including the right to:\r
\r
- Request access\r
- Request correction\r
- Request deletion\r
- Object to or restrict certain processing\r
- Withdraw consent\r
- Receive a portable copy of certain information\r
- Lodge a complaint with a data-protection authority\r
\r
To exercise an applicable right, contact **contact@gozarproductions.com**.\r
\r
## 11. Children’s privacy\r
\r
StreamBridge is not directed to children under 13 or under the minimum age required by Discord or a connected platform in their jurisdiction.\r
\r
We do not knowingly collect personal information from children in violation of applicable law. If you believe a child’s information has been processed improperly, contact **contact@gozarproductions.com**.\r
\r
## 12. International processing\r
\r
StreamBridge and its service providers may process information in countries other than the user’s country of residence. Those countries may have different data-protection laws.\r
\r
Where required, the operator will use appropriate safeguards for international transfers.\r
\r
## 13. Third-party services\r
\r
Use of StreamBridge may involve third-party services governed by separate terms and privacy policies, including:\r
\r
- [Discord Privacy Policy](https://discord.com/privacy)\r
- [Google Privacy Policy](https://policies.google.com/privacy)\r
- [YouTube Terms of Service](https://www.youtube.com/t/terms)\r
- [Twitch Privacy Notice](https://www.twitch.tv/p/en/legal/privacy-notice/)\r
- [Kick Privacy Policy](https://kick.com/privacy-policy)\r
- [Social Stream Ninja](https://socialstream.ninja/)\r
\r
StreamBridge does not control these third parties.\r
\r
## 14. Changes to this Privacy Policy\r
\r
We may update this Privacy Policy when StreamBridge’s features, data practices, platform integrations, or legal obligations change.\r
\r
The updated policy will show a new “Last updated” date. If a change materially expands how authorized Google or YouTube data is accessed, used, stored, or shared, affected users may be asked to review or accept the updated policy as required by applicable platform policies.\r
\r
## 15. Contact\r
\r
For privacy questions, requests, or complaints:\r
\r
**Operator:** Gozar Productions LLC</br>\r
**Email:** contact@gozarproductions.com\r
`,f=l(`<meta name="description" content="StreamBridge privacy policy"/> <link rel="canonical" href="https://streambridge.gozarproductions.com/privacy"/>`,1),p=l(`<article class="page legal"></article>`);function m(l,m){a(m,!0);let h=u(d);var g=p();s(`7ke6fz`,e=>{var a=f();n(2),t(()=>{r.title=`Privacy Policy — StreamBridge`}),i(e,a)}),c(g,()=>h,!0),e(g),i(l,g),o()}export{m as component};