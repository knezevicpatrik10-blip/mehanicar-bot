require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,   // Privileged intent – 
        GatewayIntentBits.GuildMembers,     // Privileged intent – 
        GatewayIntentBits.GuildModeration,  // Za ban/unban 
        GatewayIntentBits.GuildVoiceStates, // Za VC tracking
    ]
});

// ═══════════════════════════════════════════════════════════════════════════════
const RANK_HIERARCHY = [
    '1485364494350815246', 
    '1485364494350815244', 
    '1485364494350815243', 
    '1485364494325645508', 
];
// ═══════════════════════════════════════════════════════════════════════════════
const IMAGE_ONLY_CHANNEL = ['1485364495650918438','1486088080837312666']; 
const TEXT_ONLY_CHANNEL  = '1485364495650918437';    
const OPOMENA_CHANNEL    = '1485364495269368000';    
const LOG_CHANNEL        = '1485738784170704979';    
const VOICE_LOG_CHANNEL  = '1487227227161497701';    
const BLACKLIST_CHANNEL  = '1487814599565774899';    
const TICKET_LOG_CHANNEL = '1488603717400789184';
const TICKET_PARENT_CATEGORY = null;
const ZNACKE_CHANNEL = '1491839471312834700';
const ALLOWED_MOD_ROLES  = [
    '1485364494359068815','1485364494350815250','1485364494350815249','1485364494359068818', // PERMISIJE NE DIRAJ JEDINO AKO TARE KAZE!
];
// ═══════════════════════════════════════════════════════════════════════════════

const EMOJI_REGEX  = /\p{Extended_Pictographic}|<a?:[a-zA-Z0-9_]+:[0-9]+>/u;
const GIF_REGEX    = /(tenor\.com|giphy\.com|\.gif)/i;

// ─── MongoDB ────────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB spojen'))
    .catch(e  => console.error('❌ MongoDB:', e.message));

const Data = mongoose.model('Data', new mongoose.Schema({
    key:   { type: String, unique: true, required: true },
    value: mongoose.Schema.Types.Mixed
}));

function dbSave(key, value) {
    Data.findOneAndUpdate({ key }, { value }, { upsert: true }).catch(() => {});
}
async function loadAllData() {
    const docs = await Data.find({}).catch(() => []);
    for (const d of docs) {
        if (d.key === 'warnings')   warnings   = d.value || {};
        if (d.key === 'blacklist')  blacklist  = d.value || {};
        if (d.key === 'vcStats')    vcStats    = d.value || {};
        if (d.key === 'tableState') tableState = d.value || { messageId: null };
        if (d.key === 'blState')    blState    = d.value || { messageId: null };
        if (d.key === 'tickets')    tickets    = d.value || {};
        if (d.key === 'panelState')  panelState  = d.value || { messageId: null, channelId: null, disabled: [] };
        if (d.key === 'znacke')       znacke       = d.value || {};
        if (d.key === 'znackeState')  znackeState  = d.value || { messageId: null };
    }
    console.log('✅ Podaci učitani iz MongoDB');
}

// ─── VC Tracking setup ────────────────────────────────────────────────────────────────────
const VC_STATS_CHANNEL  = '1485622323355586590';
const AFK_VOICE_CHANNEL = '1485998086395396136';
const AFK_TIMEOUT_MS    = 10 * 60 * 1000;
const vcStartTimes      = new Map();
const afkTimers         = new Map();
let   vcStats    = {};
let   warnings   = {};
let   blacklist  = {};
let   tableState = { messageId: null };
let   blState    = { messageId: null };
let   tickets    = {};
let   panelState  = { messageId: null, channelId: null, disabled: [] };
let   znacke      = {};
let   znackeState = { messageId: null };

function savePanelState()  { dbSave('panelState',  panelState);  }
function saveZnacke()      { dbSave('znacke',      znacke);      }
function saveZnackeState() { dbSave('znackeState', znackeState); }
function saveVcStats()    { dbSave('vcStats',    vcStats);    }
function saveWarnings()   { dbSave('warnings',   warnings);   }
function saveBlacklist()  { dbSave('blacklist',  blacklist);  }
function saveBlState()    { dbSave('blState',    blState);    }
function saveTickets()    { dbSave('tickets',    tickets);    }

const TICKET_TYPES = {
    tiket_popravka: 'POPRAVKA ORUZIJA',
    tiket_zalbe: 'TIKET ZALBE',
    tiket_poso: 'TIKET ZA POSO',
    tiket_kupovina: 'KUPOVINA ORUZIJA',
};

const TICKET_ZALBE_ROLES = [
    '1485364494350815243',
    '1485364494350815244',
    '1485364494350815245',
    '1485364494350815246',
    '1485364494350815247',
    '1485364494350815242',
    '1485364494350815250',
];

const TICKET_FIELDS = {
    tiket_popravka: [
        { name: 'Vase Ime',       value: '\u200b', inline: false },
        { name: 'Sta Popravljate', value: '\u200b', inline: false },
        { name: 'Koja Kolicina',   value: '\u200b', inline: false },
    ],
    tiket_zalbe: [
        { name: 'Vase Ime na Licnoj', value: '\u200b', inline: false },
        { name: 'Vas Broj',           value: '\u200b', inline: false },
        { name: 'Na Koga se Zalite',  value: '\u200b', inline: false },
    ],
    tiket_poso: [
        { name: 'Koliko godina imate',                    value: '\u200b', inline: false },
        { name: 'Dali ste bili negdje zaposleni prije',   value: '\u200b', inline: false },
        { name: 'Koliko Sati Mozete Provest Igrajuci',    value: '\u200b', inline: false },
    ],
    tiket_kupovina: [
        { name: 'Vase Ime',         value: '\u200b', inline: false },
        { name: 'Koliko zelite',    value: '\u200b', inline: false },
        { name: 'Sta zelite kupiti', value: '\u200b', inline: false },
    ],
};

// ─── Znacke helpers ─────────────────────────────────────────────────────
async function updateZnackeTable() {
    const ch = await client.channels.fetch(ZNACKE_CHANNEL).catch(() => null);
    if (!ch) return;
    const entries = Object.entries(znacke).sort(([a], [b]) => a.localeCompare(b));
    const claimed = entries.length;
    const lines = entries.map(([num, d]) => `\`${num}\` <@${d.userId}>`);
    const desc = lines.length > 0 ? lines.join('\n') : '*Još niko nije upisao znacku.*';
    const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('TABLICA ZNAČKI')
        .setDescription(desc.slice(0, 4000))
        .setFooter({ text: `Upisano: ${claimed}/601 | Slobodno: ${601 - claimed}` })
        .setTimestamp();
    if (znackeState.messageId) {
        const msg = await ch.messages.fetch(znackeState.messageId).catch(() => null);
        if (msg) { await msg.edit({ embeds: [embed] }).catch(() => {}); return; }
    }
    const msg = await ch.send({ embeds: [embed] }).catch(() => null);
    if (msg) { znackeState.messageId = msg.id; saveZnackeState(); }
}

// ─── Panel helpers ─────────────────────────────────────────────────────
const PANEL_BUTTONS = [
    { id: 'tiket_popravka', label: ' Popravka Oružija', style: ButtonStyle.Primary },
    { id: 'tiket_zalbe',    label: ' Žalbe',            style: ButtonStyle.Secondary },
    { id: 'tiket_poso',     label: ' Tiket za Poso',   style: ButtonStyle.Success },
    { id: 'tiket_kupovina', label: ' Kupovina Oružija', style: ButtonStyle.Danger },
];

function buildPanelRow(disabled = []) {
    return new ActionRowBuilder().addComponents(
        PANEL_BUTTONS.map(b =>
            new ButtonBuilder()
                .setCustomId(b.id)
                .setLabel(b.label)
                .setStyle(b.style)
                .setDisabled(disabled.includes(b.id))
        )
    );
}

async function updatePanelMessage() {
    if (!panelState.messageId || !panelState.channelId) return;
    const ch = await client.channels.fetch(panelState.channelId).catch(() => null);
    if (!ch) return;
    const msg = await ch.messages.fetch(panelState.messageId).catch(() => null);
    if (!msg) return;
    await msg.edit({ components: [buildPanelRow(panelState.disabled)] }).catch(() => {});
}

async function findOrCreateCategory(guild, name) {
    const existing = guild.channels.cache.find(
        c => c.type === ChannelType.GuildCategory && c.name === name
    );
    if (existing) return existing;
    return guild.channels.create({ name, type: ChannelType.GuildCategory }).catch(() => null);
}

async function createTicket(interaction, typeKey) {
    const typeName = TICKET_TYPES[typeKey];
    const guild = interaction.guild;
    const user = interaction.user;

    // Provjera role za zalbe
    if (typeKey === 'tiket_zalbe') {
        const hasZalbeRole = interaction.member.roles.cache.some(r => TICKET_ZALBE_ROLES.includes(r.id));
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!hasZalbeRole && !isAdmin) {
            return interaction.reply({ content: '❌ Nemate permisiju za otvaranje ovog tiketa.', flags: MessageFlags.Ephemeral });
        }
    }

    const existingAll = Object.entries(tickets).filter(([, t]) => t.guildId === guild.id && t.userId === user.id);
    if (existingAll.length >= 3) {
        const links = existingAll.map(([id]) => `<#${id}>`).join(', ');
        return interaction.reply({ content: `❌ Već imaš 3 otvorena tiketa: ${links}`, flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const permissionOverwrites = [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles'] },
        ...ALLOWED_MOD_ROLES.map(roleId => ({
            id: roleId,
            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages'],
        })),
    ];

    const channelOptions = {
        name: `tiket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18)}`,
        type: ChannelType.GuildText,
        permissionOverwrites,
    };
    const categoryNames = {
        tiket_popravka: 'POPRAVKA ORUZIJA',
        tiket_zalbe:    'ZALBE',
        tiket_poso:     'TIKET ZA POSO',
        tiket_kupovina: 'KUPOVINA ORUZIJA',
    };
    const cat = await findOrCreateCategory(guild, categoryNames[typeKey]);
    if (cat) channelOptions.parent = cat.id;

    const channel = await guild.channels.create(channelOptions).catch(() => null);
    if (!channel) {
        return interaction.editReply('❌ Ne mogu kreirati tiket kanal.');
    }

    tickets[channel.id] = {
        guildId: guild.id,
        userId: user.id,
        type: typeName,
        createdAt: new Date().toISOString(),
        openedByTag: user.tag,
    };
    saveTickets();

    const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('zatvori_tiket')
            .setLabel('Zatvori tiket')
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        content: `${user}`,
        embeds: [
            new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(typeName)
                .addFields(...TICKET_FIELDS[typeKey])
                .setFooter({ text: 'Upiši odgovore u chat ispod. Osoblje će te kontaktirati uskoro.' })
                .setTimestamp(),
        ],
        components: [closeRow],
    }).catch(() => {});

    return interaction.editReply(`✅ Tiket otvoren: ${channel}`);
}

async function closeTicket(interaction) {
    const channel = interaction.channel;
    const ticket = tickets[channel.id];
    if (!ticket) {
        return interaction.reply({ content: '❌ Ovo nije tiket kanal.', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply();

    let allMessages = [];
    let before;
    while (true) {
        const options = { limit: 100 };
        if (before) options.before = before;
        const batch = await channel.messages.fetch(options).catch(() => null);
        if (!batch || batch.size === 0) break;
        allMessages = allMessages.concat([...batch.values()]);
        before = batch.last().id;
        if (batch.size < 100) break;
    }

    allMessages.reverse();
    const transcriptText =
        `Tiket tip: ${ticket.type}\n` +
        `Otvorio: ${ticket.openedByTag}\n` +
        `Zatvorio: ${interaction.user.tag}\n` +
        `Otvoren: ${ticket.createdAt}\n` +
        `${'='.repeat(60)}\n` +
        allMessages.map(msg => {
            const attachments = msg.attachments.size ? ` [Prilozi: ${msg.attachments.map(a => a.url).join(', ')}]` : '';
            return `[${new Date(msg.createdTimestamp).toLocaleString('hr-HR')}] ${msg.author.tag}: ${msg.content || ''}${attachments}`;
        }).join('\n');

    const transcriptBuffer = Buffer.from(transcriptText, 'utf8');
    const transcriptFile = { attachment: transcriptBuffer, name: `transcript-${channel.name}.txt` };

    const opener = await client.users.fetch(ticket.userId).catch(() => null);
    if (opener) {
        await opener.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('📄 Transcript tiketa')
                    .setDescription(`Tvoj tiket **${ticket.type}** je zatvorio **${interaction.user.tag}**.`)
                    .setTimestamp(),
            ],
            files: [transcriptFile],
        }).catch(() => {});
    }

    const logCh = await client.channels.fetch(TICKET_LOG_CHANNEL).catch(() => null);
    if (logCh) {
        await logCh.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(0xE74C3C)
                    .setTitle('🎫 Tiket zatvoren')
                    .addFields(
                        { name: 'Tip', value: ticket.type, inline: true },
                        { name: 'Otvorio', value: `<@${ticket.userId}>`, inline: true },
                        { name: 'Zatvorio', value: `${interaction.user}`, inline: true },
                    )
                    .setTimestamp(),
            ],
            files: [transcriptFile],
        }).catch(() => {});
    }

    delete tickets[channel.id];
    saveTickets();

    await interaction.editReply('✅ Tiket se zatvara za 5 sekundi...');
    setTimeout(() => channel.delete().catch(() => {}), 5000);
}
async function updateBlacklistTable() {
    if (BLACKLIST_CHANNEL === 'ZAMIJENI_SA_ID_KANALA') return;
    const ch = await client.channels.fetch(BLACKLIST_CHANNEL).catch(()=>null);
    if (!ch) return;
    const embed = new EmbedBuilder().setColor(0xE74C3C).setTitle('🚫 Blacklista').setTimestamp().setFooter({ text:'Zadnje ažurirano' });
    const entries = Object.entries(blacklist);
    embed.setDescription(entries.length === 0
        ? '✅ Blacklista je prazna.'
        : entries.map(([uid,d],i) => `**${i+1}.** <@${uid}> — ${d.reason} \`${new Date(d.timestamp).toLocaleDateString('hr-HR')}\` | Dodao: **${d.addedBy}**`).join('\n')
    );
    if (blState.messageId) {
        try { const m = await ch.messages.fetch(blState.messageId); await m.edit({ embeds:[embed] }); return; } catch {}
    }
    const m = await ch.send({ embeds:[embed] }).catch(()=>null);
    if (m) { blState.messageId = m.id; saveBlState(); }
}

function saveTableState() { dbSave('tableState', tableState); }

async function updateWarningsTable() {
    const ch = await client.channels.fetch(OPOMENA_CHANNEL).catch(() => null);
    if (!ch) return;

    const entries = Object.entries(warnings)
        .filter(([, list]) => list.length > 0)
        .sort((a, b) => b[1].length - a[1].length);

    const embed = new EmbedBuilder()
        .setColor(0xFF6B00)
        .setTitle('📋 Tablica Opomena')
        .setTimestamp()
        .setFooter({ text: 'Zadnje ažurirano' });

    if (entries.length === 0) {
        embed.setDescription('✅ Niko trenutno nema opomena.');
    } else {
        const rows = entries.map(([userId, list], i) => {
            const last = list[list.length - 1];
            const date = new Date(last.timestamp).toLocaleDateString('hr-HR');
            const mod = last.moderator?.split('#')[0] ?? last.moderator;
            return `**${i + 1}.** <@${userId}> — **${list.length}** ⚠️ | Zadnja: ${last.reason} \`${date}\` | Dao: **${mod}**`;
        }).join('\n');
        embed.setDescription(rows);
    }

    // Pokušaj editovat postojeću poruku
    if (tableState.messageId) {
        try {
            const msg = await ch.messages.fetch(tableState.messageId);
            await msg.edit({ embeds: [embed] });
            return;
        } catch { /* poruka ne postoji, kreiraj novu */ }
    }

    // Kreiraj novu poruku i zapamći ID
    const msg = await ch.send({ embeds: [embed] }).catch(() => null);
    if (msg) {
        tableState.messageId = msg.id;
        saveTableState();
    }
}

function scheduleDailyReset() {
    const now    = new Date();
    const next6  = new Date();
    next6.setHours(6, 0, 0, 0);
    if (now >= next6) next6.setDate(next6.getDate() + 1);

    const msLeft = next6 - now;
    console.log(`⏰ Sljedeci VC reset za ${Math.round(msLeft / 60000)} minuta.`);

    setTimeout(async () => {
        const ch = await client.channels.fetch(VC_STATS_CHANNEL).catch(() => null);

        // ── Pošalji summary prije reseta
        if (ch && Object.keys(vcStats).length > 0) {
            const sorted = Object.entries(vcStats)
                .sort((a, b) => b[1] - a[1]);

            const rows = sorted
                .map(([userId, ms], i) => `**${i + 1}.** <@${userId}> — ${formatDuration(ms)}`)
                .join('\n');

            await ch.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle(' Dnevni VC Izvještaj')
                        .setDescription(rows)
                        .setFooter({ text: 'Reset u 06:00 — statistike su vraćene na 0 minuta' })
                        .setTimestamp()
                ]
            }).catch(() => {});
        }

        vcStats = {};
        saveVcStats();
        vcStartTimes.clear();
        console.log('✅ VC statistike resetovane (06:00)');

        if (ch) {
            await ch.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('🔄 VC Statistike resetovane')
                        .setDescription('Dnevni reset u **06:00**. Sve statistike su vraćene na 0.')
                        .setTimestamp()
                ]
            }).catch(() => {});
        }
        scheduleDailyReset();
    }, msLeft);
}
function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
}


// ─────────────────────────────────────────────────────

client.on('clientReady', async () => {
    console.log(`✅ Bot spreman: ${client.user.tag}`);
    client.user.setActivity('BENY CARTEL ON TOP <3', { type: 3 });
    await loadAllData();
    scheduleDailyReset();
});

// ─── DOBRODOŠLICA ─────────────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
    const ch = await client.channels.fetch('1485364494958985326').catch(() => null);
    if (!ch) return;

    await ch.send({
        embeds: [
            new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('🎉 Dobrodošli!')
                .setDescription(
                    `Dobrodošli ${member} u server!\n\n` +
                    `U slučaju da imate neko pitanje, molbu ili želju otvorite ticket \u27a3 https://discord.com/channels/1485364494325645502/1485364495269368006`
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setImage('https://i.ibb.co/qhnv4bY/kurac2.png')
                .setTimestamp()
        ]
    }).catch(() => {});
});

// ─── GOODBYE ───────────────────────────────────────────────────────────
client.on('guildMemberRemove', async (member) => {
    const ch = await client.channels.fetch('1485742357298020404').catch(() => null);
    if (!ch) return;

    await ch.send({
        embeds: [
            new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('🚪 Korisnik je otišao')
                .setDescription(`**${member.user.tag}** je napustio server.`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
        ]
    }).catch(() => {});
});

// ─── FILTERI KANALA ─────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;
    const member = message.member;
    if (!member) return;

    // ── Kanal samo za slike ──────────────────────────────────────────────────
    if (IMAGE_ONLY_CHANNEL.includes(message.channel.id)) {
        const hasImage = message.attachments.some(a =>
            a.contentType?.startsWith('image/') || a.contentType?.startsWith('video/')
        );
        if (!hasImage) {
            await message.delete().catch(() => {});
        }
        return;
    }

    // ── Kanal samo za tekst poruke ───────────────────────────────────────────
    if (TEXT_ONLY_CHANNEL !== 'ZAMIJENI_SA_ID_CHANELA' && message.channel.id === TEXT_ONLY_CHANNEL) {
        const hasAttachment = message.attachments.size > 0;
        const hasEmoji      = EMOJI_REGEX.test(message.content);
        const hasGif        = GIF_REGEX.test(message.content);
        const hasSticker    = message.stickers.size > 0;

        if (hasAttachment || hasEmoji || hasGif || hasSticker) {
            await message.delete().catch(() => {});
        }
    }

});

// ─── VC TRACKING ─────────────────────────────────────────────────────────────
client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) return;

    const userId     = member.id;
    const now        = Date.now();
    const joinedVC   = !oldState.channel && newState.channel;
    const leftVC     = oldState.channel && !newState.channel;
    const switchedVC = oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id;
    const isInAFK    = newState.channel?.id === AFK_VOICE_CHANNEL;
    const wasInAFK   = oldState.channel?.id === AFK_VOICE_CHANNEL;

    // ── AFK timer helpers ────────────────────────────────────────────────────
    function clearAfkTimer() {
        const t = afkTimers.get(userId);
        if (t) { clearTimeout(t); afkTimers.delete(userId); }
    }
    function startAfkTimer() {
        clearAfkTimer();
        const timer = setTimeout(async () => {
            afkTimers.delete(userId);
            // Spremi akumulirano vrijeme prije premještanja u AFK
            const start = vcStartTimes.get(userId);
            if (start) {
                vcStats[userId] = (vcStats[userId] || 0) + (Date.now() - start);
                saveVcStats();
                vcStartTimes.delete(userId);
            }
            await member.voice.setChannel(AFK_VOICE_CHANNEL).catch(() => {});

            // Log u log kanal
            const logCh = await client.channels.fetch(LOG_CHANNEL).catch(() => null);
            if (logCh) {
                await logCh.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x95A5A6)
                            .setTitle('💤 Korisnik premješten u AFK')
                            .setThumbnail(member.user.displayAvatarURL())
                            .addFields(
                                { name: 'Korisnik', value: `${member} (${member.user.tag})`, inline: true },
                                { name: 'Razlog',   value: 'AFK više od 10 minuta',          inline: true }
                            )
                            .setTimestamp()
                    ]
                }).catch(() => {});
            }
        }, AFK_TIMEOUT_MS);
        afkTimers.set(userId, timer);
    }
    function isDeaf(state) { return state.selfDeaf || state.deaf; }

    // ── Pridružio se VC-u ────────────────────────────────────────────────────
    if (joinedVC) {
        if (!isInAFK) {
            vcStartTimes.set(userId, now);
            if (isDeaf(newState)) startAfkTimer();
        }
        return;
    }

    // ── Napustio VC ──────────────────────────────────────────────────────────
    if (leftVC) {
        clearAfkTimer();
        if (!wasInAFK) {
            const startTime = vcStartTimes.get(userId);
            if (startTime) {
                const sessionMs = now - startTime;
                vcStats[userId] = (vcStats[userId] || 0) + sessionMs;
                saveVcStats();
                const ch = await client.channels.fetch(VC_STATS_CHANNEL).catch(() => null);
                if (ch) {
                    await ch.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x5865F2)
                                .setTitle('🎙️ VC Sesija završena')
                                .setThumbnail(member.user.displayAvatarURL())
                                .addFields(
                                    { name: 'Korisnik',   value: `${member}`,                    inline: true },
                                    { name: 'Ova sesija', value: formatDuration(sessionMs),       inline: true },
                                    { name: 'Ukupno',     value: formatDuration(vcStats[userId]), inline: true }
                                )
                                .setTimestamp()
                        ]
                    }).catch(() => {});
                }
            }
        }
        vcStartTimes.delete(userId);
        return;
    }

    // ── Prebacio se u drugi kanal ────────────────────────────────────────────
    if (switchedVC) {
        clearAfkTimer();
        // Spremi vrijeme iz prethodnog kanala (samo ako nije bio u AFK)
        if (!wasInAFK) {
            const startTime = vcStartTimes.get(userId);
            if (startTime) {
                vcStats[userId] = (vcStats[userId] || 0) + (now - startTime);
                saveVcStats();
            }
        }
        // Počni pratit u novom kanalu (samo ako nije AFK)
        if (!isInAFK) {
            vcStartTimes.set(userId, now);
            if (isDeaf(newState)) startAfkTimer();
        } else {
            vcStartTimes.delete(userId);
        }
        return;
    }

    // ── Promjena stanja (mute/deafen) u istom kanalu ─────────────────────────
    if (newState.channel && !isInAFK) {
        if (!isDeaf(oldState) && isDeaf(newState))  startAfkTimer();
        else if (isDeaf(oldState) && !isDeaf(newState)) clearAfkTimer();
    }
});

// ─── BUTTON INTERAKCIJE ──────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    const id = interaction.customId;

    if (id === 'zatvori_tiket') {
        return closeTicket(interaction);
    }

    if (TICKET_TYPES[id]) {
        return createTicket(interaction, id);
    }
});

// ─── SLASH KOMANDE ────────────────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guild, user: mod } = interaction;
    console.log(`📩 Primljena komanda: /${commandName} od ${mod.tag}`);

    // ── Provjera role ────────────────────────────────────────────────────────
    const isAdmin   = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    const hasRole   = interaction.member.roles.cache.some(r => ALLOWED_MOD_ROLES.includes(r.id));
    const firstRole = ALLOWED_MOD_ROLES[0];

    // Samo rola iz ALLOWED_MOD_ROLES smije koristiti komande
    if (firstRole !== 'ZAMIJENI_SA_ID_ROLE' && !hasRole) {
        try {
            return await interaction.reply({
                content: '❌ Nemaš permisiju za korištenje bot komandi.',
                flags: MessageFlags.Ephemeral
            });
        } catch { return; }
    }

    // ── /blacklista ────────────────────────────────────────────────────────────
    if (commandName === 'blacklista') {
        const sub    = interaction.options.getSubcommand();
        const target = interaction.options.getUser('korisnik');

        if (sub === 'dodaj') {
            const reason = interaction.options.getString('razlog');
            if (blacklist[target.id]) return interaction.reply({ content:`❌ ${target.tag} je već na blacklisti.`, flags:MessageFlags.Ephemeral });
            blacklist[target.id] = { tag:target.tag, reason, addedBy:mod.tag, timestamp:new Date().toISOString() };
            saveBlacklist();
            await updateBlacklistTable();
            const logCh = await client.channels.fetch(LOG_CHANNEL).catch(()=>null);
            if (logCh) logCh.send({ embeds:[new EmbedBuilder().setColor(0xE74C3C).setTitle('🚫 Dodan na Blacklistu')
                .setThumbnail(target.displayAvatarURL({ dynamic:true }))
                .addFields({ name:'Korisnik', value:`${target} (${target.tag})`, inline:true }, { name:'Moderator', value:`${mod}`, inline:true }, { name:'Razlog', value:reason })
                .setTimestamp()] }).catch(()=>{});
            try { return await interaction.reply({ embeds:[new EmbedBuilder().setColor(0xE74C3C).setTitle('✅ Dodan na Blacklistu')
                .addFields({ name:'Korisnik', value:`${target}`, inline:true }, { name:'Razlog', value:reason }).setTimestamp()], flags:MessageFlags.Ephemeral }); } catch { return; }
        }

        if (sub === 'ukloni') {
            if (!blacklist[target.id]) return interaction.reply({ content:`❌ ${target.tag} nije na blacklisti.`, flags:MessageFlags.Ephemeral });
            delete blacklist[target.id];
            saveBlacklist();
            await updateBlacklistTable();
            try { return await interaction.reply({ embeds:[new EmbedBuilder().setColor(0x2ECC71).setTitle('✅ Uklonjen s Blackliste')
                .addFields({ name:'Korisnik', value:`${target}`, inline:true }).setTimestamp()], flags:MessageFlags.Ephemeral }); } catch { return; }
        }
    }

    // ── /glasanje ────────────────────────────────────────────────────────────
    if (commandName === 'glasanje') {
        const pitanje = interaction.options.getString('pitanje');
        const opcije  = ['opcija1','opcija2','opcija3','opcija4']
            .map(k => interaction.options.getString(k)).filter(Boolean);
        const emojis  = ['🔵','🟡','🟢','🔴'];
        const opis    = opcije.length === 0
            ? '✅ **Da**\n❌ **Ne**'
            : opcije.map((o,i) => `${emojis[i]} **${o}**`).join('\n');
        const embed = new EmbedBuilder().setColor(0xF1C40F)
            .setTitle('📊 ' + pitanje).setDescription(opis)
            .setFooter({ text: `Glasanje pokrenuo: ${mod.tag}` }).setTimestamp();
        let msg;
        try { msg = await interaction.reply({ embeds:[embed], fetchReply:true }); } catch { return; }
        if (opcije.length === 0) {
            await msg.react('✅').catch(()=>{}); await msg.react('❌').catch(()=>{});
        } else {
            for (let i=0;i<opcije.length;i++) await msg.react(emojis[i]).catch(()=>{});
        }
        return;
    }

    // ── /poruka ────────────────────────────────────────────────────────────────────
    if (commandName === 'poruka') {
        const tekst = interaction.options.getString('tekst');
        await interaction.channel.send(tekst).catch(() => {});
        try { return await interaction.reply({ content: '✅ Poruka poslana!', flags: MessageFlags.Ephemeral }); }
        catch { return; }
    }

    // ── /close ─────────────────────────────────────────────────────
    if (commandName === 'close') {
        return closeTicket(interaction);
    }

    // ── /clear se obrađuje posebno (ephemeral) da ne briše vlastitu thinking poruku
    if (commandName === 'clear') {
        const broj    = interaction.options.getInteger('broj');
        const deleted = await interaction.channel.bulkDelete(broj, true).catch(() => null);
        try {
            if (!deleted) {
                return await interaction.reply({ content: '❌ Ne mogu brisati poruke (možda su starije od 14 dana).', flags: MessageFlags.Ephemeral });
            }
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x3498DB)
                        .setTitle('🗑️ Poruke obrisane')
                        .setDescription(`Obrisano **${deleted.size}** poruka.`)
                        .setTimestamp()
                ],
                flags: MessageFlags.Ephemeral
            });
        } catch { return; }
    }

    try {
        await interaction.deferReply();
    } catch {
        return;
    }

    try {
        // ── /ban ─────────────────────────────────────────────────────────────
        if (commandName === 'ban') {
            const target = interaction.options.getUser('korisnik');
            const reason = interaction.options.getString('razlog') ?? 'Nema razloga';
            const member = await guild.members.fetch(target.id).catch(() => null);

            if (member && !member.bannable)
                return interaction.editReply('❌ Ne mogu banovati ovog korisnika (viši rank od mene).');

            await guild.members.ban(target, { reason });
            return interaction.editReply({
                embeds: [modEmbed('🔨 Korisnik banovan', 0xE74C3C, target, mod, reason)]
            });
        }

        // ── /kick ────────────────────────────────────────────────────────────
        if (commandName === 'kick') {
            const target = interaction.options.getUser('korisnik');
            const reason = interaction.options.getString('razlog') ?? 'Nema razloga';
            const member = await guild.members.fetch(target.id).catch(() => null);

            if (!member)
                return interaction.editReply('❌ Korisnik nije na serveru.');
            if (!member.kickable)
                return interaction.editReply('❌ Ne mogu kickovati ovog korisnika (viši rank od mene).');

            await member.kick(reason);
            return interaction.editReply({
                embeds: [modEmbed('👢 Korisnik kickovan', 0xE67E22, target, mod, reason)]
            });
        }

        // ── /timeout ─────────────────────────────────────────────────────────
        if (commandName === 'timeout') {
            const target  = interaction.options.getUser('korisnik');
            const minutes = interaction.options.getInteger('trajanje');
            const reason  = interaction.options.getString('razlog') ?? 'Nema razloga';
            const member  = await guild.members.fetch(target.id).catch(() => null);

            if (!member)
                return interaction.editReply('❌ Korisnik nije na serveru.');

            await member.timeout(minutes * 60 * 1000, reason);

            const embed = modEmbed('⏱️ Timeout dodijeljen', 0xF1C40F, target, mod, reason);
            embed.addFields({ name: 'Trajanje', value: `${minutes} minuta`, inline: true });
            return interaction.editReply({ embeds: [embed] });
        }

        // ── /untimeout ───────────────────────────────────────────────────────
        if (commandName === 'untimeout') {
            const target = interaction.options.getUser('korisnik');
            const member = await guild.members.fetch(target.id).catch(() => null);

            if (!member)
                return interaction.editReply('❌ Korisnik nije na serveru.');

            await member.timeout(null);
            return interaction.editReply({
                embeds: [modEmbed('✅ Timeout uklonjen', 0x2ECC71, target, mod)]
            });
        }

        // ── /unban ───────────────────────────────────────────────────────────
        if (commandName === 'unban') {
            const userId = interaction.options.getString('korisnik_id').trim();
            const ban    = await guild.bans.fetch(userId).catch(() => null);

            if (!ban)
                return interaction.editReply('❌ Korisnik nije pronađen u ban listi.');

            await guild.members.unban(userId);
            return interaction.editReply({
                embeds: [modEmbed('✅ Korisnik odbanovan', 0x2ECC71, ban.user, mod)]
            });
        }

        // ── /daj-rolu ────────────────────────────────────────────────────────
        if (commandName === 'daj-rolu') {
            const target = interaction.options.getUser('korisnik');
            const role   = interaction.options.getRole('rola');
            const member = await guild.members.fetch(target.id).catch(() => null);

            if (!member)
                return interaction.editReply('❌ Korisnik nije na serveru.');

            await member.roles.add(role);
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(role.color || 0x5865F2)
                        .setTitle('✅ Rola dodijeljena')
                        .addFields(
                            { name: 'Korisnik',  value: `${target}`, inline: true },
                            { name: 'Rola',      value: `${role}`,   inline: true },
                            { name: 'Moderator', value: `${mod}`,    inline: true }
                        )
                        .setTimestamp()
                ]
            });
        }

        // ── /opomena ─────────────────────────────────────────────────────────
        if (commandName === 'opomena') {
            const target = interaction.options.getUser('korisnik');
            const reason = interaction.options.getString('razlog');

            if (!warnings[target.id]) warnings[target.id] = [];
            warnings[target.id].push({
                reason,
                moderator: mod.tag,
                timestamp: new Date().toISOString()
            });
            saveWarnings();

            const count = warnings[target.id].length;

            // ── Rank-down na svake 3 opomene ────────────────────────────────
            let rankDownMsg = null;
            console.log(`[OPOMENA] ${target.tag} ima ${count} opomena. Rank-down check: ${count % 3 === 0}`);
            if (count % 3 === 0) {
                const guildMember = await guild.members.fetch(target.id).catch(() => null);
                console.log(`[RANK-DOWN] Fetchan member: ${guildMember ? 'DA' : 'NE'}`);
                if (guildMember) {
                    const memberRoles = [...guildMember.roles.cache.keys()];
                    console.log(`[RANK-DOWN] Role membera: ${memberRoles.join(', ')}`);
                    console.log(`[RANK-DOWN] Hijerarhija: ${RANK_HIERARCHY.join(', ')}`);
                    const currentIdx = RANK_HIERARCHY.findIndex(id => guildMember.roles.cache.has(id));
                    console.log(`[RANK-DOWN] Trenutni index u hijerarhiji: ${currentIdx}`);
                    if (currentIdx !== -1 && currentIdx < RANK_HIERARCHY.length - 1) {
                        const oldRoleId = RANK_HIERARCHY[currentIdx];
                        const newRoleId = RANK_HIERARCHY[currentIdx + 1];
                        await guildMember.roles.remove(oldRoleId).catch(e => console.error('[RANK-DOWN] Greška skidanja role:', e.message));
                        await guildMember.roles.add(newRoleId).catch(e => console.error('[RANK-DOWN] Greška dodavanja role:', e.message));
                        const oldRole = guild.roles.cache.get(oldRoleId);
                        const newRole = guild.roles.cache.get(newRoleId);
                        rankDownMsg = `📉 **Rank-down:** ${oldRole?.name ?? oldRoleId} → ${newRole?.name ?? newRoleId}`;
                        console.log(`[RANK-DOWN] Uspješno: ${rankDownMsg}`);
                    } else {
                        console.log(`[RANK-DOWN] Nema rank-downa: index=${currentIdx}, max=${RANK_HIERARCHY.length - 1}`);
                    }
                }
            }

            await updateWarningsTable();

            // Log u log kanal
            const logCh = await client.channels.fetch(LOG_CHANNEL).catch(() => null);
            if (logCh) {
                await logCh.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF6B00)
                            .setTitle(`⚠️ Opomena #${count} dodijeljena`)
                            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                            .addFields(
                                { name: 'Korisnik',       value: `${target} (${target.tag})`, inline: true },
                                { name: 'Moderator',      value: `${mod}`,                   inline: true },
                                { name: 'Ukupno',         value: `${count}`,                 inline: true },
                                { name: 'Razlog',         value: reason },
                                ...(rankDownMsg ? [{ name: 'Rank-down', value: rankDownMsg }] : [])
                            )
                            .setTimestamp()
                    ]
                }).catch(() => {});
            }

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF6B00)
                        .setTitle('⚠️ Opomena zapisana')
                        .addFields(
                            { name: 'Korisnik',       value: `${target}`, inline: true },
                            { name: 'Opomena #',      value: `${count}`,  inline: true },
                            { name: 'Razlog',         value: reason }
                        )
                        .setTimestamp()
                ]
            });
        }

        // ── /provjera ───────────────────────────────────────────────────────
        if (commandName === 'provjera') {
            const target = interaction.options.getUser('korisnik');
            const list   = warnings[target.id] ?? [];
            const count  = list.length;

            const embed = new EmbedBuilder()
                .setColor(count === 0 ? 0x2ECC71 : count < 3 ? 0xF1C40F : 0xE74C3C)
                .setTitle(`📋 Opomene: ${target.tag}`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                .addFields({ name: 'Ukupno opomena', value: `${count}`, inline: true })
                .setTimestamp();

            if (count > 0) {
                const history = list
                    .map((w, i) => `**#${i + 1}** ${w.reason} \`${new Date(w.timestamp).toLocaleDateString('hr-HR')}\` — ${w.moderator}`)
                    .join('\n');
                embed.addFields({ name: 'Povijest', value: history.slice(0, 1024) });
            }

            return interaction.editReply({ embeds: [embed] });
        }

        // ── /skini-opomenu ───────────────────────────────────────────────
        if (commandName === 'skini-opomenu') {
            const target = interaction.options.getUser('korisnik');

            if (!warnings[target.id] || warnings[target.id].length === 0)
                return interaction.editReply(`❌ ${target} nema nijednu opomenu.`);

            const removed   = warnings[target.id].pop();
            saveWarnings();
            const remaining = warnings[target.id].length;

            await updateWarningsTable();

            // Log u log kanal ko je skino opomenu
            const ch = await client.channels.fetch(LOG_CHANNEL).catch(() => null);
            if (ch) {
                await ch.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x2ECC71)
                            .setTitle('❌ Opomena uklonjena')
                            .addFields(
                                { name: 'Korisnik',          value: `${target}`,         inline: true },
                                { name: 'Moderator',         value: `${mod}`,            inline: true },
                                { name: 'Preostalo opomena', value: `${remaining}`,      inline: true },
                                { name: 'Skinuta opomena',   value: removed.reason }
                            )
                            .setTimestamp()
                    ]
                }).catch(() => {});
            }

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x2ECC71)
                        .setTitle('✅ Opomena skinuta')
                        .addFields(
                            { name: 'Korisnik',          value: `${target}`,    inline: true },
                            { name: 'Preostalo opomena', value: `${remaining}`, inline: true },
                            { name: 'Skinuta opomena',   value: removed.reason }
                        )
                        .setTimestamp()
                ]
            });
        }


        // ── /move-all ──────────────────────────────────────────────────
        if (commandName === 'move-all') {
            const fromChannel = interaction.options.getChannel('iz');
            const toChannel   = interaction.options.getChannel('u');
            if (fromChannel.members.size === 0)
                return interaction.editReply('❌ Nema članova u tom kanalu.');
            const members = [...fromChannel.members.values()];
            const moved   = members.length;
            await Promise.allSettled(members.map(m => m.voice.setChannel(toChannel).catch(() => {})));
            const vlCh = await client.channels.fetch(VOICE_LOG_CHANNEL).catch(() => null);
            if (vlCh) vlCh.send({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('🔀 Move All').addFields(
                { name: 'Moderator', value: `${mod}`, inline: true },
                { name: 'Iz', value: fromChannel.name, inline: true },
                { name: 'U', value: toChannel.name, inline: true }
            ).setTimestamp()] }).catch(() => {});
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle('🔀 Premješteni')
                .addFields({ name: 'Iz', value: fromChannel.name, inline: true }, { name: 'U', value: toChannel.name, inline: true }, { name: 'Premješteno', value: `${moved} članova`, inline: true })
                .setTimestamp()] });
        }

        // ── /disconnect-all ──────────────────────────────────────────────────
        if (commandName === 'disconnect-all') {
            const channel = interaction.options.getChannel('kanal');
            if (channel.members.size === 0)
                return interaction.editReply('❌ Nema članova u tom kanalu.');
            const count = channel.members.size;
            await Promise.allSettled([...channel.members.values()].map(m => m.voice.disconnect().catch(() => {})));
            const vlCh = await client.channels.fetch(VOICE_LOG_CHANNEL).catch(() => null);
            if (vlCh) vlCh.send({ embeds: [new EmbedBuilder().setColor(0xE74C3C).setTitle('🔌 Disconnect All').addFields(
                { name: 'Moderator', value: `${mod}`, inline: true },
                { name: 'Kanal', value: channel.name, inline: true },
                { name: 'Disconnectano', value: `${count} članova`, inline: true }
            ).setTimestamp()] }).catch(() => {});
            return interaction.editReply({ embeds: [new EmbedBuilder().setColor(0xE74C3C).setTitle('🔌 Disconnectani')
                .addFields({ name: 'Kanal', value: channel.name, inline: true }, { name: 'Disconnectano', value: `${count} članova`, inline: true })
                .setTimestamp()] });
        }

        // ── /panel-tiketa
        if (commandName === 'panel-tiketa') {
            panelState = { messageId: null, channelId: null, disabled: [] };
            const sent = await interaction.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865F2)
                        .setTitle(' TIKETI')
                        .setDescription(
                            'Odaberi kategoriju tiketa klikom na dugme ispod.\n\n' +
                            ' **Popravka Oružija** — Za popravku oružija\n' +
                            ' **Žalbe** — Za žalbe na radnike\n' +
                            ' **Tiket za Poso** — Za prijave na posao\n' +
                            ' **Kupovina Oružija** — Za kupovinu oružija'
                        )
                        .setFooter({ text: 'Mozes samo jedan tiket imat otvoren majmune!.' })
                        .setTimestamp(),
                ],
                components: [buildPanelRow([])],
            });
            panelState.messageId = sent.id;
            panelState.channelId = sent.channelId;
            savePanelState();
            return interaction.reply({ content: '✅ Panel tiketa postavljen!', flags: MessageFlags.Ephemeral });
        }

        // ── /dajznacku ───────────────────────────────────────────────
        if (commandName === 'dajznacku') {
            const target   = interaction.options.getUser('korisnik');
            const numInput = interaction.options.getString('broj').trim();
            const numInt   = parseInt(numInput);
            if (isNaN(numInt) || numInt < 0 || numInt > 600)
                return interaction.editReply('❌ Broj mora biti između 000 i 600.');
            const num = String(numInt).padStart(3, '0');
            if (znacke[num])
                return interaction.editReply(`❌ Značka **${num}** je već zauzeta od **${znacke[num].ime}**.`);
            const gMember = await guild.members.fetch(target.id).catch(() => null);
            const baseName = gMember
                ? gMember.displayName.replace(/^\[\d{3}\]\s*/, '')
                : target.username;
            const ime = baseName;
            znacke[num] = { ime, userId: target.id, timestamp: new Date().toISOString() };
            saveZnacke();
            if (gMember) await gMember.setNickname(`[${num}] ${baseName}`).catch(() => {});
            await updateZnackeTable();
            return interaction.editReply(`✅ ${target} je dobio značku **${num}** i nickname je ažuriran.`);
        }

        // ── /tablica-znacki ────────────────────────────────────
        if (commandName === 'tablica-znacki') {
            znackeState = { messageId: null };
            saveZnackeState();
            await updateZnackeTable();
            return interaction.editReply('✅ Tablica znački je postavljena.');
        }

        // ── /skini-znacku ──────────────────────────────────────────────
        if (commandName === 'skini-znacku') {
            const numInput = interaction.options.getString('broj').trim();
            const num = String(parseInt(numInput)).padStart(3, '0');
            if (!znacke[num]) return interaction.editReply(`❌ Značka **${num}** nije pronađena.`);
            const old = znacke[num];
            const gMember = await guild.members.fetch(old.userId).catch(() => null);
            if (gMember) {
                const cleanNick = gMember.displayName.replace(/^\[\d{3}\]\s*/, '');
                await gMember.setNickname(cleanNick === gMember.user.username ? null : cleanNick).catch(() => {});
            }
            delete znacke[num];
            saveZnacke();
            await updateZnackeTable();
            return interaction.editReply(`✅ Značka **${num}** (${old.ime}) je skinuta i nickname je uređen.`);
        }

        // ── /zatvori (onemogući dugme na panelu)
        if (commandName === 'zatvori') {
            const tip = interaction.options.getString('tip');
            if (!panelState.messageId) return interaction.editReply('❌ Panel nije postavljen. Prvo pokreni /panel-tiketa.');
            if (!panelState.disabled.includes(tip)) panelState.disabled.push(tip);
            savePanelState();
            await updatePanelMessage();
            return interaction.editReply(`✅ Dugme **${tip}** je onemogućeno na panelu.`);
        }

        // ── /otvori (ponovo aktiviraj dugme na panelu) ────────────────────────
        if (commandName === 'otvori') {
            const tip = interaction.options.getString('tip');
            if (!panelState.messageId) return interaction.editReply('❌ Panel nije postavljen. Prvo pokreni /panel-tiketa.');
            panelState.disabled = panelState.disabled.filter(d => d !== tip);
            savePanelState();
            await updatePanelMessage();
            return interaction.editReply(`✅ Dugme **${tip}** je ponovo aktivirano na panelu.`);
        }

        // ── /skini-sve-role ──────────────────────────────────────────────────
        if (commandName === 'skini-sve-role') {
            const target = interaction.options.getUser('korisnik');
            const member = await guild.members.fetch(target.id).catch(() => null);

            if (!member)
                return interaction.editReply('❌ Korisnik nije na serveru.');

            // Filtriramo @everyone (ne može se skinuti)
            const roles = member.roles.cache.filter(r => r.id !== guild.id);
            await member.roles.remove(roles);

            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xE74C3C)
                        .setTitle('🗑️ Sve role skinute')
                        .addFields(
                            { name: 'Korisnik',     value: `${target}`,    inline: true },
                            { name: 'Moderator',    value: `${mod}`,       inline: true },
                            { name: 'Skinuto rola', value: `${roles.size}`, inline: true }
                        )
                        .setTimestamp()
                ]
            });
        }

    } catch (err) {
        console.error(`Greška u /${commandName}:`, err);
        interaction.editReply({ content: `❌ Greška: ${err.message}` }).catch(() => {});
    }
});

// ─── Helper: standardni embed za mod akcije ───────────────────────────────────
function modEmbed(title, color, target, mod, reason = null) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .addFields(
            { name: 'Korisnik',  value: `${target}`, inline: true },
            { name: 'Moderator', value: `${mod}`,    inline: true }
        )
        .setTimestamp();

    if (reason) embed.addFields({ name: 'Razlog', value: reason });
    return embed;
}

// Spriječi crash od unhandled errora
client.on('error', err => console.error('Client greška:', err));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

client.login(process.env.BOT_TOKEN);
