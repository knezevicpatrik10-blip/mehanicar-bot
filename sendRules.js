require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const RULES_CHANNEL = '1485364495269368004';

client.once('ready', async () => {
    console.log('✅ Konektovan kao', client.user.tag);

    const ch = await client.channels.fetch(RULES_CHANNEL).catch(() => null);
    if (!ch) { console.error('❌ Kanal nije pronađen.'); process.exit(1); }

    const embed = new EmbedBuilder()
        .setColor(0x1F8B4C)
        .setTitle('PRAVILA POLICIJE')
        .setDescription('Svi policijski službenici su obavezni poštovati sledeća pravila.\n\u200b')
        .addFields(
            { name: '1. Hijerarhija', value: 'Svaki policijski službenik mora poštovati hijerarhiju službe. Zabranjeno je odbijati naredbe većeg čina i zabranjena je aktivnost preko njega. Najveći čin u gradu u tom trenutku je glavni i to mora da se poštuje.', inline: false },
            { name: '2. Propis o tajnosti podataka', value: 'Svaka informacija koja se dobije tokom službe se ne sme deliti dalje.', inline: false },
            { name: '3. Dostojanstvo građana', value: 'Dostojanstvo i čast građana se ni u jednom trenutku ne sme pregaziti. Građanina ne smete vređati, psovati ili ponižavati.', inline: false },
            { name: '4. Pravo na ličnu slobodu i bezbednost', value: 'Policija ni u jednom trenutku ne puca prva. Sme otvoriti paljbu kada se oseća ugroženo za svoj život ili kada je građanin u problemu (otmica).', inline: false },
            { name: '5. Kazneni postupak', value: 'Policija ima pravo pisati kazne građaninu shodno prekršenom zakonu. Ne sme dodavati ili skratiti kazne tokom postupka. Kazne se ne lupaju samo na F6 nego preko RP-a (`/notepad2` ili `/tablet2`).', inline: false },
            { name: '6. Oprema', value: 'Prilikom izlaska na teren policija mora imati osnovnu opremu: Pištolj, Tazer, Pendrek, Lampu. Ne sme nositi veliki kalibar u patroli. Načelnik i Zamjenik Načelnika mogu imati veliki kalibar i dozvoliti drugima samo ako stoji u gepeku i vadi se po potrebi. Za dodatnu opremu mora se tražiti odobrenje višeg čina.', inline: false },
            { name: '7. Ilegalne stvari i aktivnosti', value: 'Policija kod sebe ne sme imati ilegalne stvari. One se predaju većem činu. Zabranjeno je konzumirati narkotike i određene stvari u svoju korist.', inline: false },
            { name: '8. Pregovaranje', value: 'Za bilo kakvu situaciju — otmica, pljačka, sudski pregovori ili undercover akcija — pregovaranje predvodi najviši čin policije koji je u gradu u tom trenutku.', inline: false },
            { name: '9. Legitimacija', value: 'Kada građanin zatraži legitimaciju, policijski službenik je obavezan da je pokaže i ne sme odbiti ili negirati to pravo građanina.', inline: false },
            { name: '10. Side job i undercover', value: 'Policija ne sme raditi side jobove (Pilicar, Rudar, Kosac...) i ne sme ići u undercover akcije bez odobrenja Načelnika.', inline: false },
            { name: '11. Patrola', value: 'Policiji je zabranjeno da ide sama u patrolu — moraju biti najmanje 2 člana.', inline: false },
            { name: '12. Warzona', value: 'Policija ne sme da se uputi na warzonu sa manje od 5 članova.', inline: false },
            { name: '13. Toxic ponašanje', value: 'Policajac ne sme da bude toxic.', inline: false },
            { name: '14. Svađe među kolegama', value: 'Svađe među kolegama ne sme biti. Problem se rešava smireno u kancelariji sa Zamjenikom.', inline: false },
            { name: '15. Legalne stvari građana', value: 'Policiji je zabranjeno oduzimati legalne stvari od građana (pare, hrana, voda...).', inline: false },
            { name: 'PRAVILA NA PLJAČKU', value: 'Organizovano se upućujete prema pljački. Obavezno svi povezani na radio (Radio Policije 1). Pregovaranje vodi Načelnik ili sledeći najveći čin. Taoc se pita da li je dobro i ima li potrebe za doktorom, hranom ili vodom. Kad krene pljačka jedna patrola pretražuje objekat pa se uključuje u potjeru. Na radio maksimalna tišina i fokus. U jedan auto moraju biti dvoje: vozač i suvozač ako nema helikoptera. Policija mora maksimalno da ispoštuje uslove pljačkaša. Vehicle ramming je zabranjen. PIT je dozvoljen nakon 10 minuta i samo ispod 100 km/h. Tejzanje guma je dozvoljeno nakon 10 minuta ako to nije uslov pljačke.', inline: false },
            { name: 'PATROLA I ZAUSTAVLJANJE', value: 'Prilikom zaustavljanja potrebno je da se predstavite građaninu (Ime, Prezime, Čin, Broj Značke), objasnite razlog zaustavljanja i šta je prekršio. Prilikom rutinske kontrole policija ne mora svaki put da pretraži građanina. Svako zaustavljeno lice se legitimiše i popunjava se baza u kanalu `evidencija-gradjana`.', inline: false },
            { name: 'Razlog za pretraživanje građanina', value: 'Maska, zatamnjena stakla, oružje manjeg ili većeg kalibra na vidnom mestu, nepoštovanje službenog lica, ili ako službenik ima sumnju da lice nešto krije/poseduje.', inline: false },
            { name: 'Razlog za pretraživanje automobila', value: 'Zatamnjena stakla, maska, dosije i neplaćene kazne, ili ako postoji sumnja i adekvatan dokaz da je auto učestvovalo u nekoj ilegalnoj aktivnosti.', inline: false },
            { name: 'PRAVO UHAPŠENOG LICA', value: 'Uhapšeno lice ima pravo na advokata i razgovor pre ispitivanja. Ima pravo na doktora ako je povređeno. Lice sme biti u ćeliji najviše 30 minuta. Predmeti se privremeno oduzimaju i nakon završetka procesa vraćaju. Ima pravo da se brani ćutanjem i nije dužno da odgovara na pitanja policije. Ima pravo da traži legitimaciju svakog policijskog službenika oko sebe prilikom hapšenja.', inline: false }
        )
        .setFooter({ text: 'Pravila su obavezna za sve članove policije' })
        .setTimestamp();

    await ch.send({ content: '@everyone', embeds: [embed] });
    console.log('✅ Pravila poslana!');
    process.exit(0);
});

client.login(process.env.BOT_TOKEN);
