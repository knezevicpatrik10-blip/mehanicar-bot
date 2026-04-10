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
        .setTitle('P R A V I L A  O R G A N I Z A C I J E')
        .setDescription(
            '> Svako kršenje ovih pravila dovodi do **opomene**, **otkaza** ili **kicka** iz organizacije.\n' +
            '> Pravila se ažuriraju — pratite ih redovno.\n\u200b'
        )
        .addFields(
            { name: '1. Pravila grada i pljački', value: 'Obavezno pročitati i naučiti **pravila grada** i **pravila pljački** na Asterixu.', inline: false },
            { name: '2. Poštovanje igrača', value: 'Poštovati svakog igrača — pa i one s kojima se **OOC** ne slažete.', inline: false },
            { name: '3. PIT manevar', value: 'Zabranjeno raditi **PIT** većom brzinom od **150 km/h**.', inline: false },
            { name: '4. Zabrana tejzanja u autu', value: '**Tejzanje ljudi u autu je zabranjeno.**', inline: false },
            { name: '5. Limit kazni', value: 'Zabranjeno pisati **više od 5 kazni**.', inline: false },
            { name: '6. Obavezni tejzer', value: 'Svako od vas mora nositi **tejzer** — nebitno šta radili.', inline: false },
            { name: '7. Odijelo za akciju', value: 'Na racije, pljačke ili bilo koju veću akciju nosite odijelo **„akcija"**.', inline: false },
            { name: '8. Odijelo za patrolu', value: 'U patrolu nosite odijelo **„Patrola"**.', inline: false },
            { name: '9. Limit potrošnog materijala', value: 'Zabranjeno nositi više od **2 komada** Hrane, Vode i Antistresa.', inline: false },
            { name: '10. Zadržavanje lica u stanici', value: 'U slučaju da lice dovedete u stanicu radi ispitivanja, smijete ga zadržati **maksimalno 20 minuta**.', inline: false },
            { name: '11. RP fail', value: 'Bilo koji veći RP fail = **jedna opomena**.', inline: false },
            { name: '12. Puške i naoružanje', value: 'Ne pitaj „mogu nosit pušku". Ja nagrađujem one koji znaju koristiti i one koji zasluže — poštovanjem ovih pravila.', inline: false },
            { name: '13. Reakcija na obavještenja', value: 'Na svako obavještenje na Discordu **obavezna reakcija u roku od 24h** — u suprotnom ide opomena.', inline: false },
            { name: '14. Zabrana prekidanja', value: 'Dok vodim akciju ili vas opremam — **nemoj me niko prekidati dok pričam**. To je instant otkaz.', inline: false },
            { name: '15. Svađa sa kolegama', value: 'Bilo koji toxic ili svađa sa kolegama = **otkaz obojici**, nebitno ko je kriv. Ja sam tu da riješim problem — ne vi međusobno.', inline: false },
            { name: '16. Heli — rola Heli main', value: 'Heli **bez moje dozvole ne smijete vaditi** ako nemate rolu **Heli main**.', inline: false },
            { name: '17. Zamjenici šefa', value: '<@464425339658043402> i <@649228430264500225> — njihova riječ vrijedi kao i moja. Hoću da se poštuju kao i bilo ko višeg čina od vas.', inline: false },
            { name: '18. Discord VC — OBAVEZNO', value: '**VC na Discordu je obavezan.** Koga uhvatim in-game a nije na Discordu = **instant otkaz**.', inline: false },
            { name: '19. Admin situacija', value: 'Sljedeci ko ode sa admin situacije = **otkaz odmah**. **Nema respawn u admin situaciji.**', inline: false },
            { name: '20. Zvanje admina tokom RP-a', value: '**NEMA zvat admina dok je RP u toku!**', inline: false },
            { name: '21. Traffic stop — limit kazni', value: 'Na traffic stopu maksimalno **3 kazne** do **15.000**.', inline: false },
            { name: '22. Heli — dozvola direktora', value: 'Zabranjeno koristiti heli **bez dozvole direktora**.', inline: false },
            {
                name: '\u200b',
                value: 'Za sad je to to. Pravila ćemo ostala manje bitna dodavati.\n\nAko imate **prijedlog** za pravila ili općenito — otvorite ticket **prijedlozi** i tagujte me.\n\nAko vam se nešto ne sviđa — otvorite ticket, ja sam uvijek otvoren za razgovor.',
                inline: false
            }
        )
        .setFooter({ text: 'Pravila su obavezna za sve članove' })
        .setTimestamp();

    await ch.send({ content: '@everyone', embeds: [embed] });
    console.log('✅ Pravila poslana!');
    process.exit(0);
});

client.login(process.env.BOT_TOKEN);
