require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    const ch = await client.channels.fetch('1488600691835670620').catch(() => null);
    if (!ch) { console.error('Kanal nije pronađen.'); process.exit(1); }

    await ch.send({
        embeds: [
            new EmbedBuilder()
                .setColor(0xE74C3C)
                .setTitle('Obaveze i Dužnosti')
                .addFields(
                    {
                        name: 'VODJA AKCIJA',
                        value:
                            '> Vodiš ljude na akcije, dijeliš loot, postavljaš ljude na lokacijama i sve što se toga tiče.\n' +
                            '> Nakon **svake akcije** taguješ šefa i daješ izvještaj — koliko ste skupili, izgubili itd.',
                        inline: false,
                    },
                    {
                        name: 'Pohvale',
                        value: '> Pišite pohvale za ljude koji su se istakli i pokazali dobre rezultate na akcijama.',
                        inline: false,
                    },
                    {
                        name: 'Zapošljavanje',
                        value:
                            '> Tražite ljude za posao, ispitajte ih i zaposlite (date role).\n' +
                            '> Pratite aktivnost i reakcije na obavještenjima — ko ne reaguje, **pišite opomene**.',
                        inline: false,
                    },
                    {
                        name: 'Ponašanje',
                        value:
                            '> Pripazite na ponašanje članova jer imate ulogu **autoriteta**.\n' +
                            '> Svađe, neprimjereno ponašanje i slično je **vaša obaveza** da riješite.',
                        inline: false,
                    },
                    {
                        name: 'Provjere',
                        value:
                            '> Nasumično vodite ljude i provjeravate gepeke *(anti-cheat)*\n' +
                            '> Provjeravate dal su na Discordu i in-game\n' +
                            '> Provjeravate sve što se može provjeriti\n' +
                            '> Puške i Pištolje **možete oduzeti** ako netko ima **6+ pušaka ili pištolja**',
                        inline: false,
                    },
                    {
                        name: 'ŠEF — Dodatne Obaveze',
                        value:
                            '> Radite sve gore navedeno\n' +
                            '> Provjeravate dal **Zamjenik Šefa** obavlja svoje dužnosti',
                        inline: false,
                    }
                )
                .setFooter({ text: 'Svako kršenje dužnosti = posljedice.' })
                .setTimestamp()
        ]
    });

    console.log('✅ Poruka poslana!');
    process.exit(0);
});

client.login(process.env.BOT_TOKEN);
