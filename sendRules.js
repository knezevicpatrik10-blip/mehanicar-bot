require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const RULES_CHANNEL = '1485364495269368004';

client.once('ready', async () => {
    console.log('✅ Konektovan kao', client.user.tag);

    const ch = await client.channels.fetch(RULES_CHANNEL).catch(() => null);
    if (!ch) { console.error('❌ Kanal nije pronađen.'); process.exit(1); }

    const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('📜  P R A V I L A  O R G A N I Z A C I J E')
        .setDescription(
            '> Svako kršenje ovih pravila dovodi do **minusa** te osobe ili **kicka** iz organizacije.\n' +
            '> Pravila se iz dana u dan dodaju — pratite ih redovno.\n\u200b'
        )
        .addFields(
            {
                name: '  1. Zabrana psovanja',
                value: 'U organizaciji je **strogo zabranjeno** psovanje — majke, familije, bilo čega apsolutno. Vrijedi i u bazi i u VC-u.',
                inline: false
            },
            {
                name: '  2. Zabrana trolanja i toksičnosti',
                value: 'Zabranjen je **bilo kakav vid trolanja i toksičnog ponašanja** — nije bitno jesi li u bazi ili na lokaciji.',
                inline: false
            },
            {
                name: '  3. Zabrana krađe — provjere gepeka',
                value: '**Krađa je zabranjena.** Provjere gepeka od sad će biti **redovne**.',
                inline: false
            },
            {
                name: '  4. Slušanje viših činova',
                value: 'Kada vam **viši čin** nešto kaže — **morate to uraditi**. Bez prigovora.',
                inline: false
            },
            {
                name: '  5. Red u bazi',
                value: 'Kada smo svi u bazi — **nema trčanja tamo-vamo**. Stane se u vrstu i tišina. Ima nas 30+, nije lako održavati sve.',
                inline: false
            },
            {
                name: '  6. Zabrana dranja u VC-u',
                value: '**Dranje u VC-u je strogo zabranjeno.**',
                inline: false
            },
            {
                name: '  7. Privatna vozila — zabranjeno ulaziti u gepek',
                value: 'Kada neko otvara **svoju privatnu vozilu** — **ne smijete ulaziti u gepek** bez dozvole vlasnika.',
                inline: false
            },
            {
                name: '  8. Tare otvara kombije — svi van mehaničarske',
                value: 'Kada **Tare otvara kombije** radi prebacivanja i sl. — **svi apsolutno svi van mehaničarske**.',
                inline: false
            },
            {
                name: '  9. Smrt u bazi — zabrana lootanja',
                value: 'Kada neko padne u bazi — **nema lootanja**. **Clipuje se** i šalje jednom od šefova.',
                inline: false
            },
            {
                name: '  10. Smrt na akciji — lootanje samo u iznimnim slučajevima',
                value: 'Kada na akciji padne jedan od naših — **nema lootanja**.\n*Iznimka:* ako je pucanje još u toku i moraš mu uzeti pušku, metke, pancir...',
                inline: false
            },
            {
                name: '  11. Pravilo za Heli ',
                value: 'Heli smije vozit određene osobe sa rollom HELI MAIN ili HELI VOZAC nitko drugi a te osobe su (Patrik,David)',
                inline: false
            },
        )
        .setFooter({ text: 'Mehanicar Organizacija  •  Pravila su obavezna za sve članove' })
        .setTimestamp();

    await ch.send({ content: '@everyone', embeds: [embed] });
    console.log('✅ Pravila poslana!');
    process.exit(0);
});

client.login(process.env.BOT_TOKEN);
