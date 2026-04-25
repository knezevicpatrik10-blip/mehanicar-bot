require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const commands = [
    // ── BAN ──────────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banuje korisnika sa servera')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji se banuje').setRequired(true))
        .addStringOption(o => o.setName('razlog').setDescription('Razlog bana'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ── KICK ─────────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickuje korisnika sa servera')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji se kickuje').setRequired(true))
        .addStringOption(o => o.setName('razlog').setDescription('Razlog kicka'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    // ── TIMEOUT ──────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Stavlja timeout na korisnika')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji dobiva timeout').setRequired(true))
        .addIntegerOption(o =>
            o.setName('trajanje')
             .setDescription('Trajanje u minutama (max 40320 = 28 dana)')
             .setRequired(true)
             .setMinValue(1)
             .setMaxValue(40320)
        )
        .addStringOption(o => o.setName('razlog').setDescription('Razlog timeoutа'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ── UNTIMEOUT ────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Uklanja timeout korisniku')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik čiji se timeout uklanja').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ── UNBAN ────────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Uklanja ban korisniku — upiši Discord ID korisnika')
        .addStringOption(o => o.setName('korisnik_id').setDescription('Discord ID banovanog korisnika').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ── DAJ ROLU ─────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('daj-rolu')
        .setDescription('Daje rolu korisniku')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji dobiva rolu').setRequired(true))
        .addRoleOption(o => o.setName('rola').setDescription('Rola koja se daje').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ── OPOMENA ───────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('opomena')
        .setDescription('Daje opomenu korisniku i loguje je')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji dobiva opomenu').setRequired(true))
        .addStringOption(o => o.setName('razlog').setDescription('Razlog opomene').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ── PROVJERA OPOMENA ───────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('provjera')
        .setDescription('Prikazuje opomene korisnika')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ── BLACKLISTA ────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('blacklista')
        .setDescription('Upravljanje blacklistom')
        .addSubcommand(s => s.setName('dodaj').setDescription('Dodaje korisnika na blacklistu')
            .addUserOption(o => o.setName('korisnik').setDescription('Korisnik').setRequired(true))
            .addStringOption(o => o.setName('razlog').setDescription('Razlog').setRequired(true)))
        .addSubcommand(s => s.setName('ukloni').setDescription('Uklanja korisnika s blackliste')
            .addUserOption(o => o.setName('korisnik').setDescription('Korisnik').setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    // ── GLASANJE ────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('glasanje')
        .setDescription('Pokreće glasanje s reakcijama')
        .addStringOption(o => o.setName('pitanje').setDescription('Pitanje za glasanje').setRequired(true))
        .addStringOption(o => o.setName('opcija1').setDescription('Opcija 1 (bez opcija = Da/Ne)'))
        .addStringOption(o => o.setName('opcija2').setDescription('Opcija 2'))
        .addStringOption(o => o.setName('opcija3').setDescription('Opcija 3'))
        .addStringOption(o => o.setName('opcija4').setDescription('Opcija 4'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // ── PORUKA ────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('poruka')
        .setDescription('Pita bot da pošalje poruku kao embed u ovaj kanal')
        .addStringOption(o => o.setName('tekst').setDescription('Tekst poruke').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // ── CLEAR ────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Briše zadani broj poruka iz kanala')
        .addIntegerOption(o =>
            o.setName('broj')
             .setDescription('Broj poruka za brisanje (1-100)')
             .setRequired(true)
             .setMinValue(1)
             .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    // ── SKINI OPOMENU ───────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('skini-opomenu')
        .setDescription('Skida zadnju opomenu korisniku')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik kojemu se skida opomena').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    // ── DAJ SVIMA ──────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('dajsvima')
        .setDescription('Daje odabranu rolu svim članovima servera')
        .addRoleOption(o => o.setName('rola').setDescription('Rola koja se daje svima').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    // ── SKINI SVE ROLE ──────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('skini-sve-role')
        .setDescription('Skida sve role korisniku')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik kojemu se skidaju sve role').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),


    // ── VOICE UTILS
    new SlashCommandBuilder()
        .setName('move-all')
        .setDescription('Premješta sve članove iz jednog voice kanala u drugi')
        .addChannelOption(o => o.setName('iz').setDescription('Izvorni voice kanal').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .addChannelOption(o => o.setName('u').setDescription('Odredišni voice kanal').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    new SlashCommandBuilder()
        .setName('disconnect-all')
        .setDescription('Izbacuje sve članove iz odabranog voice kanala')
        .addChannelOption(o => o.setName('kanal').setDescription('Voice kanal iz kojeg se izbacuju').setRequired(true).addChannelTypes(ChannelType.GuildVoice))
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

    // ── TIKETI ──────────────────────────────────────────────────────────────
    new SlashCommandBuilder()
        .setName('panel-tiketa')
        .setDescription('Postavlja panel za otvaranje tiketa u ovaj kanal')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('close')
        .setDescription('Zatvara trenutni tiket i šalje transcript'),

    new SlashCommandBuilder()
        .setName('zatvori')
        .setDescription('Onemogućava odabrano dugme na panelu tiketa')
        .addStringOption(o => o
            .setName('tip')
            .setDescription('Koji tip tiketa onemogućiti')
            .setRequired(true)
            .addChoices(
                { name: 'Popravka Oružija', value: 'tiket_popravka' },
                { name: 'Žalbe',            value: 'tiket_zalbe' },
                { name: 'Tiket za Poso',   value: 'tiket_poso' },
                { name: 'Kupovina Oružija', value: 'tiket_kupovina' },
                { name: 'Prijedlozi',      value: 'tiket_prijedlozi' },
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('dajznacku')
        .setDescription('Dodjeljuje značku korisniku')
        .addUserOption(o => o.setName('korisnik').setDescription('Korisnik koji dobiva značku').setRequired(true))
        .addStringOption(o => o.setName('broj').setDescription('Broj značke (npr. 001)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('tablica-znacki')
        .setDescription('Postavlja/resetuje tablicu znački u kanalu')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('skini-znacku')
        .setDescription('Uklanja zauzetu značku iz tablice')
        .addStringOption(o => o.setName('broj').setDescription('Broj značke (npr. 001)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('otvori')
        .setDescription('Ponovo aktivira onemogućeno dugme na panelu tiketa')
        .addStringOption(o => o
            .setName('tip')
            .setDescription('Koji tip tiketa aktivirati')
            .setRequired(true)
            .addChoices(
                { name: 'Popravka Oružija', value: 'tiket_popravka' },
                { name: 'Žalbe',            value: 'tiket_zalbe' },
                { name: 'Tiket za Poso',   value: 'tiket_poso' },
                { name: 'Kupovina Oružija', value: 'tiket_kupovina' },
                { name: 'Prijedlozi',      value: 'tiket_prijedlozi' },
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('🔄 Registrujem slash komande...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );
        console.log('✅ Komande uspješno registrovane!');
    } catch (err) {
        console.error('❌ Greška:', err);
    }
})();
