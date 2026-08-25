/**
 * vivier.js — LE MONDE : QUI EXISTE, OU, ET A QUEL NIVEAU.
 *
 * Module natif JS, tenu par invariants (banc 18). AUCUN fichier gele ni
 * porte n'est modifie : generator.js et carriere.js sont utilises tels
 * quels, dans un flux RNG prive.
 *
 * ===================================================================
 * /!\ LES TROIS DECISIONS DE CHARPENTE (Mael, 09/08)
 * ===================================================================
 * 1. LES VOLUMES : AFC 50 par division, toutes les autres orgs 30, et
 *    VINGT FOIS PLUS d'amateurs que de pros. Mesure : 4 500 pros en
 *    fiches moteur completes = 9 Mo et ~1 s — trop pour un telephone en
 *    permanence, et 90 000 amateurs en fiches completes = 59 Mo — mort.
 *    D'ou les deux etages de fiche ci-dessous.
 * 2. FICHE LEGERE + HYDRATATION DETERMINISTE : le monde ne stocke que
 *    l'identite, l'histoire et le bilan. La fiche moteur complete se
 *    REFABRIQUE a la demande, sur un flux RNG prive seme par
 *    (graine du monde, id de l'homme) : le meme homme donne toujours la
 *    meme fiche, a n'importe quelle date, sur n'importe quelle machine.
 *    /!\ SANS CA, LA SAUVEGARDE ET LE REPLAY DIVERGENT.
 * 3. TOUT CE QUE LE JOUEUR TOUCHE DEVIENT PERSISTANT : un amateur du
 *    monde est une fonction du temps parce que personne ne s'occupe de
 *    lui. Des qu'il est recrute, il est hydrate UNE fois puis vit en
 *    fiche complete, mise a jour par la salle — il ne redevient jamais
 *    une fonction. (La bascule elle-meme vivra dans le module de salle.)
 *
 * ===================================================================
 * /!\ LA HIERARCHIE EST EMERGENTE, PAS DECRETEE
 * ===================================================================
 * On ne genere pas "des hommes forts pour l'AFC" : on genere une
 * population par pays (chacun avec son histoire via carriere.js), puis
 * LES ORGANISATIONS RECRUTENT LES MEILLEURS, dans l'ordre de leur rang —
 * l'AFC se sert en premier dans le monde entier, la continentale dans
 * son continent, les nationales chez elles. Le niveau moyen decroit du
 * sommet vers les nationales parce que la selection le produit, pas
 * parce qu'une table le dit.
 *
 * /!\ LA TENDANCE NATIONALE PONDERE, ELLE N'INTERDIT JAMAIS (Mael) :
 * du lutteur en France existe, juste plus rare. AUCUNE CASE A ZERO.
 */

const { Alea, alea } = require("./alea.js");
const G = require("./generator.js");
const CA = require("./carriere.js");
const CL = require("./classement.js");
const E = require("./engine.js");

/* ================================================================== */
/* LES DOUZE PAYS (liste validee par Mael, 09/08).                    */
/* tradition : poids dans la population amateur mondiale.              */
/* archetypes : PONDERATIONS, jamais zero.                            */
/* ================================================================== */
const PAYS = [
  { cle: "USA", nom: "États-Unis", tradition: 0.19, candidats: 130,
    archetypes: { lutteur_controle: 30, boxeur_pressure: 20, polyvalent: 18,
                  brawler: 14, grappler_soumission: 10, kickboxeur_distance: 8 },
    prenoms: ["Tyler","Brandon","Cody","Marcus","Devin","Austin","Chase","Jared","Malik","Logan",
              "Trevor","Wyatt","Deshawn","Caleb","Hunter","Blake","Darius","Colt","Emmett","Ray",
      "Jaxon", "Tyrell", "Deandre", "Bryce", "Cooper", "Gage", "Maddox", "Trent", "Zane", "Colton", "Dashawn", "Elijah", "Grant", "Holden", "Isaiah", "Jerome", "Kendall", "Lamar", "Micah", "Nolan", "Owen", "Preston", "Quentin", "Reggie", "Silas", "Tanner", "Ulysses", "Vernon", "Weston", "Xavier"],
    noms: ["Whitfield","Barrow","Callahan","Mercer","Boyd","Hutchins","Draper","Stanton","Vance","Redd",
           "Marsh","Gaines","Talbot","Rourke","Pruitt","Landry","Beckett","Hollis","Sexton","Crowe",
      "Callahan", "Whitfield", "Draper", "Ellison", "Foster", "Galloway", "Hargrove", "Ingram", "Jefferson", "Kirkland", "Lockhart", "Mercer", "Nolans", "Ostrander", "Pruitt", "Quimby", "Radcliffe", "Sherwood", "Tillman", "Underwood", "Vance", "Wexler", "Yancey", "Ackerman", "Bledsoe", "Cantrell", "Denson", "Eastman", "Fairbanks", "Gentry", "Holloway", "Irwin", "Jessup", "Kessler", "Lattimore", "McCray"] },
  { cle: "BRA", nom: "Brésil", tradition: 0.15, candidats: 100,
    archetypes: { grappler_soumission: 32, brawler: 16, polyvalent: 16,
                  boxeur_pressure: 14, kickboxeur_distance: 12, lutteur_controle: 10 },
    prenoms: ["Caio","Murilo","Otávio","Vinícius","Douglas","Éverton","Jonas","Alan","Breno","Ítalo",
              "Wallace","Renan","Maicon","Davi","Luan","Estevão","Nícolas","Wesley","Aldair","Rui",
      "Thiago", "Caio", "Vinícius", "Otávio", "Renan", "Iago", "Wallace", "Emerson", "Cauã", "Davi", "Enzo", "Fábio", "Gilberto", "Heitor", "Ítalo", "Jonas", "Kléber", "Leandro", "Maurício", "Nélson", "Orlando", "Peterson", "Quincas", "Rogério", "Sandro", "Tales", "Ubiratan", "Valdir", "Wesley", "Yuri"],
    noms: ["Sarmento","Peixoto","Camargo","Furtado","Bittencourt","Salgado","Meireles","Dutra","Vilela","Quaresma",
           "Barreto","Mascarenhas","Serra","Prado","Antunes","Pontes","Rezende","Aragão","Lacerda","Vasques",
      "Cavalcanti", "Drummond", "Evangelista", "Figueiredo", "Guimarães", "Holanda", "Itaparica", "Junqueira", "Kubinski", "Lacerda", "Meirelles", "Nogueira", "Ottoni", "Pacheco", "Quaresma", "Rezende", "Sarmento", "Trindade", "Uchoa", "Vasconcelos", "Wanderley", "Xisto", "Ypiranga", "Zagatto", "Amorim", "Bittencourt", "Camargo", "Dutra", "Espinosa", "Furtado", "Godoy", "Hilário", "Iglésias", "Juliano", "Klein", "Louzada"] },
  { cle: "FRA", nom: "France", tradition: 0.12, candidats: 95,
    archetypes: { kickboxeur_distance: 26, boxeur_pressure: 22, polyvalent: 20,
                  grappler_soumission: 12, brawler: 12, lutteur_controle: 8 },
    prenoms: ["Julien","Théo","Mathis","Karim","Yanis","Bastien","Romain","Loïc","Antoine","Damien",
              "Sofiane","Kevin","Florian","Hugo","Mehdi","Quentin","Alexis","Jordan","Nabil","Corentin",
      "Bastien", "Corentin", "Dorian", "Erwan", "Florian", "Gaëtan", "Hadrien", "Ilan", "Jordan", "Killian", "Loïc", "Mathis", "Nolan", "Océrian", "Pierrick", "Quentin", "Rayan", "Steven", "Théo", "Ugo", "Valentin", "Wassim", "Xavier", "Yanis", "Zacharie", "Adama", "Bilal", "Clément", "Driss", "Elias"],
    noms: ["Lefort","Marchal","Perrin","Bouvier","Delacroix","Garnier","Toussaint","Chapelle","Renard","Berthier",
           "Belkacem","Aubry","Vasseur","Lambert","Meunier","Girard","Fontaine","Bensaïd","Rocher","Clément",
      "Aubertin", "Beaulieu", "Charbonnier", "Delacroix", "Escoffier", "Fauvel", "Grimaud", "Hébert", "Imbert", "Jacquemin", "Kervella", "Lachapelle", "Marchetti", "Navarro", "Ozanne", "Perrault", "Quiniou", "Rambert", "Sauvage", "Tanguy", "Urbain", "Vasseur", "Wagner", "Ybert", "Zeller", "Arnoux", "Baillard", "Cazenave", "Dartois", "Estève", "Fombonne", "Guéranger", "Hautier", "Izard", "Jourdain", "Kaddour"] },
  { cle: "RUS", nom: "Russie", tradition: 0.12, candidats: 85,
    archetypes: { lutteur_controle: 34, grappler_soumission: 18, polyvalent: 16,
                  boxeur_pressure: 12, brawler: 12, kickboxeur_distance: 8 },
    prenoms: ["Artem","Nikita","Ruslan","Timur","Aslan","Denis","Kirill","Zaur","Georgi","Anzor",
              "Vadim","Rustam","Ilya","Marat","Stepan","Kazbek","Oleg","Damir","Semyon","Batyr",
      "Arsen", "Bogdan", "Damir", "Eldar", "Fyodor", "Gennadi", "Ibragim", "Kamil", "Lev", "Magomed", "Nariman", "Oleg", "Pyotr", "Rashid", "Shamil", "Timur", "Umar", "Vadim", "Yaroslav", "Zaur", "Artyom", "Boris", "Denis", "Eduard", "Georgi", "Ilya", "Kirill", "Leonid", "Maxim", "Nikita"],
    noms: ["Vetrov","Sokolov","Merkulov","Tagirov","Sharipov","Gromov","Ozerov","Kuznetsov","Dudarov","Zhilin",
           "Rezanov","Lomakin","Karpov","Isaev","Mutaev","Fedin","Cherkasov","Alibekov","Nazarov","Uvarov",
      "Abdulaev", "Baisangurov", "Chagaev", "Dudaev", "Emelyanov", "Fedotov", "Gadzhiev", "Ibragimov", "Kadulov", "Lebedev", "Makhatov", "Nurmagaev", "Ovechnikov", "Primakov", "Rasulov", "Saitov", "Tsarukov", "Umarov", "Vakhitov", "Yandiev", "Zhamaldaev", "Alkhasov", "Batyrov", "Chimatov", "Dagaev", "Evlonov", "Gamzatov", "Israilov", "Khabilov", "Lomakin", "Musaev", "Nazarov", "Osmaev", "Pirogov", "Ramazanov", "Suleymanov"] },
  { cle: "UK", nom: "Royaume-Uni", tradition: 0.08, candidats: 60,
    archetypes: { boxeur_pressure: 28, brawler: 20, polyvalent: 18,
                  kickboxeur_distance: 14, grappler_soumission: 12, lutteur_controle: 8 },
    prenoms: ["Callum","Lewis","Owen","Harvey","Reece","Kieran","Declan","Ellis","Jayden","Cameron",
              "Rhys","Finlay","Aaron","Bradley","Dominic","Freddie","Tyrell","Sean","Ashton","Curtis",
      "Alfie", "Bradley", "Callum", "Declan", "Ellis", "Finley", "Gareth", "Harvey", "Idris", "Jenson", "Kieran", "Lewis", "Mason", "Nathaniel", "Ollie", "Paddy", "Reece", "Shane", "Tommy", "Warren", "Aaron", "Billy", "Ciaran", "Dylan", "Ewan", "Freddie", "Glen", "Harrison", "Ian", "Jude"],
    noms: ["Whitmore","Ashworth","Gallagher","Pemberton","Hargreaves","Boyle","Tanner","Radcliffe","Osei","Duffy",
           "Winter","Stroud","Kearsley","Hobbs","Farrow","Mccrae","Bexley","Nash","Quigley","Sowerby",
      "Ashworth", "Barrington", "Chadwick", "Doherty", "Ellsworth", "Fairclough", "Garrity", "Hemsworth", "Illingworth", "Jardine", "Kavanagh", "Lonsdale", "Middleton", "Naismith", "Ormsby", "Pemberton", "Quigley", "Ramsbottom", "Sinclair", "Thackeray", "Upton", "Vickers", "Wainwright", "Yardley", "Ainsworth", "Beckwith", "Cartwright", "Dunmore", "Eccleston", "Farnsworth", "Grimshaw", "Hathaway", "Ingleby", "Jephson", "Kingsley", "Lythgoe"] },
  { cle: "POL", nom: "Pologne", tradition: 0.07, candidats: 55,
    archetypes: { lutteur_controle: 22, boxeur_pressure: 20, brawler: 18,
                  polyvalent: 16, kickboxeur_distance: 14, grappler_soumission: 10 },
    prenoms: ["Kacper","Szymon","Bartek","Dawid","Marek","Tomasz","Piotr","Krystian","Adrian","Michał",
              "Damian","Rafał","Łukasz","Sebastian","Paweł","Igor","Norbert","Wojtek","Filip","Emil",
      "Andrzej", "Bartosz", "Czesław", "Damian", "Emil", "Filip", "Grzegorz", "Henryk", "Igor", "Jacek", "Kacper", "Łukasz", "Marcin", "Norbert", "Oskar", "Patryk", "Radosław", "Sebastian", "Tadeusz", "Wiktor", "Adrian", "Bogusław", "Cezary", "Dawid", "Ernest", "Franciszek", "Gustaw", "Hubert", "Ireneusz", "Janusz"],
    noms: ["Zawadzki","Sokolowski","Wrona","Majewski","Kaczmarek","Pilarski","Gorski","Lis","Nowicki","Szulc",
           "Domagała","Cieślak","Bednarz","Urban","Mazur","Krupa","Ostrowski","Wilczek","Sadowski","Pawlak",
      "Adamczyk", "Baranowski", "Cieślak", "Dąbrowski", "Fijałkowski", "Górecki", "Herman", "Iwaniuk", "Jabłoński", "Kaczmarek", "Lewandowicz", "Majewski", "Nowicki", "Olszewski", "Pawlak", "Rutkowski", "Sikorski", "Tomaszewski", "Urbański", "Wieczorek", "Zalewski", "Andrzejewski", "Białas", "Chmielewski", "Domagała", "Frączek", "Głowacki", "Jastrzębski", "Kubiak", "Lisowski", "Michalak", "Niedźwiedź", "Ostrowski", "Piotrowski", "Sobczak", "Wysocki"] },
  { cle: "JPN", nom: "Japon", tradition: 0.06, candidats: 50,
    archetypes: { grappler_soumission: 26, kickboxeur_distance: 22, polyvalent: 18,
                  boxeur_pressure: 14, brawler: 10, lutteur_controle: 10 },
    prenoms: ["Ren","Kaito","Sho","Daiki","Yuto","Haruki","Riku","Sota","Kazuki","Taiga",
              "Hayato","Kenta","Ryo","Itsuki","Tsubasa","Minato","Asahi","Kohei","Shun","Naoki",
      "Daiki", "Haruto", "Itsuki", "Kaito", "Minato", "Ren", "Sota", "Yamato", "Asahi", "Hinata", "Kazuki", "Riku", "Shota", "Takumi", "Yuma", "Aoi", "Hayato", "Koki", "Ryusei", "Taiga", "Yusei", "Daichi", "Hiroto", "Kenta", "Ryota", "Shuji", "Tatsuya", "Yudai", "Genki", "Naoki"],
    noms: ["Fujimura","Sakaguchi","Hirano","Kuroda","Ishikawa","Yasuda","Onishi","Takara","Nishioka","Shibata",
           "Hoshino","Kanemoto","Uehara","Morikawa","Segawa","Tsuruta","Chiba","Okabe","Iwata","Nogami",
      "Akiyama", "Fujimoto", "Hasegawa", "Ishikawa", "Kobayashi", "Matsumoto", "Nakagawa", "Okamoto", "Sakamoto", "Takahashi", "Uehara", "Watanabe", "Yamashita", "Endo", "Fukuda", "Hirano", "Inoue", "Kondo", "Maeda", "Nishimura", "Ogawa", "Shimizu", "Taniguchi", "Ueda", "Yoshida", "Arai", "Fujii", "Hoshino", "Imai", "Kudo", "Miyazaki", "Noguchi", "Otsuka", "Sasaki", "Tsuchiya", "Yokoyama"] },
  { cle: "MEX", nom: "Mexique", tradition: 0.06, candidats: 50,
    archetypes: { boxeur_pressure: 34, brawler: 20, polyvalent: 14,
                  kickboxeur_distance: 12, grappler_soumission: 12, lutteur_controle: 8 },
    prenoms: ["Ángel","Iván","Osvaldo","Uriel","Jesús","Ramiro","Édgar","Gerardo","Emiliano","Diego",
              "Ulises","Rodrigo","Braulio","Marco","Adán","Isaac","Néstor","Joel","Cristian","Saúl",
      "Alejandro", "Braulio", "César", "Diego", "Emiliano", "Fernando", "Gerardo", "Hugo", "Iván", "Joaquín", "Kevin", "Lorenzo", "Mauricio", "Nicolás", "Octavio", "Pablo", "Ramiro", "Santiago", "Tomás", "Ulises", "Vicente", "Xavier", "Yahir", "Adrián", "Bruno", "Cristóbal", "Damián", "Esteban", "Federico", "Gonzalo"],
    noms: ["Zúñiga","Carbajal","Orozco","Salcedo","Rentería","Palacios","Godínez","Anguiano","Ceballos","Uribe",
           "Montoya","Solís","Barraza","Quintana","Escamilla","Padilla","Valdivia","Rosales","Camacho","Lugo",
      "Alvarado", "Barajas", "Cervantes", "Domínguez", "Escobedo", "Fuentes", "Galindo", "Huerta", "Ibarra", "Juárez", "Lozano", "Mendoza", "Nájera", "Ochoa", "Palacios", "Quintero", "Rosales", "Salazar", "Terrazas", "Urías", "Valenzuela", "Zaragoza", "Aguirre", "Bustamante", "Cisneros", "Delgado", "Espinoza", "Figueroa", "Guerrero", "Hinojosa", "Jaramillo", "Lugo", "Montoya", "Navarrete", "Orozco", "Padilla"] },
  { cle: "CAN", nom: "Canada", tradition: 0.05, candidats: 45,
    archetypes: { polyvalent: 24, lutteur_controle: 20, boxeur_pressure: 18,
                  kickboxeur_distance: 14, grappler_soumission: 14, brawler: 10 },
    prenoms: ["Liam","Noah","Ethan","Carter","Mason","Tristan","Xavier","Émile","Olivier","Zachary",
              "Brayden","Nolan","Marc-André","Félix","Dawson","Cole","Hudson","Keegan","Mathieu","Jaxon",
      "Aiden", "Brody", "Carter", "Dawson", "Ethan", "Fraser", "Gavin", "Hudson", "Isaac", "Jasper", "Kellan", "Landon", "Malcolm", "Nathan", "Orion", "Parker", "Quinton", "Ryder", "Spencer", "Tristan", "Wyatt", "Angus", "Beckett", "Cormac", "Declan", "Emmett", "Finnegan", "Grayson", "Hamish", "Ivor"],
    noms: ["Tremblais","Gagnon","Bouchard","Thistle","Mackay","Doiron","Carruthers","Lachance","Pelletier","Byrne",
           "Standish","Corbett","Hebert","Malone","Fortin","Dube","Kowal","Ashby","Lavoie","Merritt",
      "Abernathy", "Boudreau", "Cormillet", "Desjardins", "Ellingham", "Fontaine", "Gagnon", "Harrington", "Isserlis", "Jorgensen", "Kavanaugh", "Lachance", "MacIntyre", "Naismith", "Ouellet", "Pelletier", "Quesnel", "Robicheau", "Sutherland", "Tremblais", "Underhill", "Villeneuve", "Whitlock", "Yorke", "Arsenault", "Bouchard", "Chartrand", "Duquette", "Falkner", "Girard", "Hensley", "Kirkpatrick", "Lavoie", "McAllister", "Ostrowski", "Poirieux"] },
  { cle: "AUS", nom: "Australie", tradition: 0.04, candidats: 42,
    archetypes: { boxeur_pressure: 24, brawler: 22, polyvalent: 18,
                  kickboxeur_distance: 14, lutteur_controle: 12, grappler_soumission: 10 },
    prenoms: ["Jack","Lachlan","Cooper","Flynn","Ryder","Bailey","Harrison","Toby","Mitchell","Angus",
              "Jai","Darcy","Beau","Heath","Brodie","Callan","Fletcher","Ned","Tate","Rory",
      "Angus", "Banjo", "Cooper", "Darcy", "Eli", "Flynn", "Gus", "Heath", "Ivan", "Jarrah", "Koby", "Lachlan", "Mitchell", "Ned", "Oscar", "Patrick", "Quade", "Riley", "Sonny", "Toby", "Wade", "Archie", "Baxter", "Clancy", "Dustin", "Errol", "Fletcher", "Griffin", "Harley", "Jett"],
    noms: ["Sheedy","Braddock","Colley","Mackenzie","Thorne","Riddell","Gallard","Hoskins","Pratt","Duffield",
           "Kearns","Somerville","Blackwood","Tindall","Oakes","Rennie","Struthers","Cavanagh","Pemble","Winch",
      "Ainsworth", "Blackwood", "Cartwright", "Donaldson", "Everingham", "Fitzgibbon", "Gallagher", "Hetherington", "Inglis", "Jamieson", "Kirkwood", "Lindsay", "McAllister", "Nesbitt", "Oakford", "Prendergast", "Quirk", "Ravenscroft", "Sheedy", "Thornbury", "Vandenberg", "Wetherall", "Yates", "Ashcroft", "Bancroft", "Cummins", "Driscoll", "Eastwood", "Farnham", "Girdlestone", "Hollingsworth", "Kennerly", "Loughlin", "Merriweather", "Northcott", "Pemberton"] },
  { cle: "SWE", nom: "Suède", tradition: 0.03, candidats: 40,
    archetypes: { lutteur_controle: 24, grappler_soumission: 20, polyvalent: 18,
                  boxeur_pressure: 14, kickboxeur_distance: 14, brawler: 10 },
    prenoms: ["Elias","Oskar","Viktor","Hampus","Melker","Nils","Arvid","Filip","Ludvig","Anton",
              "Casper","Emil","Joel","Simon","Alfred","Vilgot","Sixten","Malte","Hugo","Axel",
      "Albin", "Björn", "Casper", "Dante", "Elias", "Filip", "Gustav", "Hampus", "Isak", "Joel", "Kalle", "Ludvig", "Melker", "Nils", "Oskar", "Pontus", "Rasmus", "Sixten", "Teodor", "Valter", "Wilhelm", "Axel", "Birger", "Casimir", "Ebbe", "Folke", "Göran", "Hjalmar", "Ingvar", "Jesper"],
    noms: ["Lindqvist","Bergström","Åkesson","Holmgren","Sandell","Norrby","Eklund","Dahlberg","Fransson","Hellström",
           "Sjögren","Wallmark","Nyström","Cederholm","Lundin","Rosell","Tornberg","Almgren","Byström","Petersson",
      "Ahlström", "Bergqvist", "Cederberg", "Dahlgren", "Ekström", "Forsberg", "Gunnarsson", "Hellström", "Isaksson", "Johanström", "Kjellberg", "Lindqvist", "Månsson", "Norström", "Öberg", "Palmgren", "Qvist", "Rosenberg", "Sandström", "Thorvaldsson", "Ulvander", "Vikström", "Wallin", "Åkesson", "Blomqvist", "Carlström", "Dufva", "Engström", "Fagerström", "Grönberg", "Hedlund", "Isberg", "Järvinen", "Krantz", "Lundgren", "Malmström"] },
  { cle: "NLD", nom: "Pays-Bas", tradition: 0.03, candidats: 40,
    archetypes: { kickboxeur_distance: 40, boxeur_pressure: 16, polyvalent: 14,
                  brawler: 14, lutteur_controle: 8, grappler_soumission: 8 },
    prenoms: ["Daan","Sven","Thijs","Bram","Jesse","Ruben","Niels","Koen","Wouter","Lars",
              "Timo","Joris","Milan","Stijn","Floris","Jelle","Bas","Gijs","Teun","Pim",
      "Bram", "Daan", "Finn", "Gijs", "Hidde", "Jelle", "Koen", "Lars", "Milan", "Niels", "Olivier", "Pim", "Ruben", "Sem", "Thijs", "Vince", "Wouter", "Bas", "Cas", "Dirk", "Erik", "Floris", "Gerben", "Hugo", "Ivo", "Joost", "Kees", "Luuk", "Maarten", "Niek"],
    noms: ["Van der Meer","Bakker","De Wit","Vermeulen","Hoekstra","Van Dijk","Smeets","Kuipers","Blom","Roos",
           "Van Leeuwen","Dekker","Mulder","Schouten","Verhagen","Ten Brink","Willemse","Peeters","Zandstra","Koning",
      "Aalbers", "Blankenberg", "Cuypers", "Dijkstra", "Eversdijk", "Fokkema", "Groeneveld", "Hoekstra", "IJsselstein", "Janssen", "Kuipers", "Lammers", "Meulendijk", "Nijhuis", "Oosterhuis", "Poortvliet", "Quist", "Ravensbergen", "Schouten", "Terpstra", "Uitdenbogaard", "Verhoeder", "Westerveld", "Zijlstra", "Appelmans", "Bosman", "Coenen", "Dekkers", "Elzinga", "Feenstra", "Goedhart", "Hendriks", "Immink", "Jonkman", "Krol", "Leeuwenburg"] },
];
const PAYS_PAR_CLE = {}; PAYS.forEach((p, i) => { p.idx = i; PAYS_PAR_CLE[p.cle] = p; });

/* ================================================================== */
/* LES ONZE ORGANISATIONS NATIONALES (une par pays, la France a deja  */
/* HEX). Noms DERIVES — meme garde-fou juridique que les cinq          */
/* premieres : je propose, je ne certifie pas. AVANT PUBLICATION :     */
/* INPI et EUIPO.                                                      */
/* La portee suit le marche : une nationale americaine porte plus loin */
/* qu'une suedoise. La bourse est celle d'HEX mise a l'echelle.        */
/* ================================================================== */
const NATIONALES = {
  USA_N: { nom: "Frontier FC",     pays: "USA", portee: 45 },
  BRA_N: { nom: "Bandeira FC",     pays: "BRA", portee: 42 },
  RUS_N: { nom: "Taïga FC",        pays: "RUS", portee: 40 },
  UK_N:  { nom: "Albion FC",       pays: "UK",  portee: 36 },
  JPN_N: { nom: "Kachidoki FC",    pays: "JPN", portee: 35 },
  POL_N: { nom: "Husaria FC",      pays: "POL", portee: 34 },
  MEX_N: { nom: "Jaguar Combate",  pays: "MEX", portee: 33 },
  CAN_N: { nom: "Boréal FC",       pays: "CAN", portee: 32 },
  AUS_N: { nom: "Outback FC",      pays: "AUS", portee: 32 },
  SWE_N: { nom: "Norrland FC",     pays: "SWE", portee: 30 },
  NLD_N: { nom: "Lowlands FL",     pays: "NLD", portee: 30 },
};

/** Injecte les nationales dans la table des orgs de classement.js —
 *  UNE SEULE source de verite pour bourse(), serieRequise(), etc. */
function enregistrerOrgs() {
  for (const [cle, n] of Object.entries(NATIONALES)) {
    if (CL.ORGS[cle]) continue;
    const k = n.portee / 40;                       // HEX = reference
    CL.ORGS[cle] = { nom: n.nom, pays: PAYS_PAR_CLE[n.pays].nom, niveau: "nationale",
      densite: 1.00, serie: 3,
      bourse: [Math.max(1, Math.round(1 * k)), Math.round(7 * k), Math.round(15 * k)],
      portee: n.portee };
  }
}

/* L'ordre de recrutement : le sommet se sert en premier.
   SOK (europeenne) pioche dans son continent, les nationales chez elles. */
const TAILLES = { AFC: 50, GFL: 30, SOK: 30, TRI: 30, HEX: 30 };
const EUROPE = new Set(["FRA", "UK", "POL", "SWE", "NLD", "RUS"]);

/* ================================================================== */
/* LE FLUX PRIVE — la fondation de l'hydratation.                      */
/* On sauve l'etat du flux partage, on seme, on fabrique, on restaure. */
/* /!\ AUCUN TIRAGE DU MONDE NE TOUCHE LE FLUX DES COMBATS. C'est le   */
/* meme esprit que l'invariant de fiches.js (la construction ne        */
/* consomme pas de RNG) : ici elle en consomme, mais LE SIEN.          */
/* ================================================================== */
function avecFlux(graine, fn) {
  const mt = alea.mt.slice(), mti = alea.mti, g = alea.gaussSuivant;
  alea.seed(graine >>> 0);
  const r = fn();
  alea.mt.set(mt); alea.mti = mti; alea.gaussSuivant = g;
  return r;
}

/** Melange (graine du monde, id) -> graine 32 bits. Melange fort : deux
 *  ids voisins doivent donner des flux sans rapport. */
function melanger(gm, id) {
  let h = (gm ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ id, 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/* Espace d'ids : (division, pays, k) — stable, lisible, refabricable. */
const PAR_CELL = 4096;
const AM_BASE = 1 << 22;                            // les amateurs au-dessus
const idPro = (d, c, k) => (d * 12 + c) * PAR_CELL + k;
const idAmateur = (d, c, k) => AM_BASE + (d * 12 + c) * 8192 + k;

function tirerArchetype(poids) {
  let total = 0; for (const v of Object.values(poids)) total += v;
  let t = alea.random() * total;
  for (const [a, v] of Object.entries(poids)) { t -= v; if (t <= 0) return a; }
  return Object.keys(poids)[0];
}

/* ================================================================== */
/* FABRIQUER UN HOMME — creation et hydratation sont LA MEME fonction. */
/* Tout tirage a lieu dans le flux prive de son id : le refabriquer,   */
/* c'est le retrouver.                                                 */
/* /!\ LE MONDE VIEILLIT GRATUITEMENT (decouverte du 09/08) : la       */
/* boucle de deduction de carriere.js ne consomme AUCUN RNG. Tous les  */
/* tirages (archetype, nom, age de naissance, potentiel, parcours,     */
/* axes) tombent AVANT elle, a l'identique quel que soit anneesEnPlus. */
/* Hydrater a +N annees donne donc, deterministe, le niveau            */
/* D'AUJOURD'HUI — progression des jeunes et declin des vieux compris. */
/* Un an d'inactivite bouge REELLEMENT la fiche : c'est la matiere du  */
/* scouting date.                                                      */
/* ================================================================== */
function fabriquerHomme(gm, id, paysCle, division, jeune, anneesEnPlus = 0) {
  return avecFlux(melanger(gm, id), () => {
    const p = PAYS_PAR_CLE[paysCle];
    const archetype = tirerArchetype(p.archetypes);
    const nom = alea.choice(p.prenoms) + " " + alea.choice(p.noms);
    // /!\ niveau 60 CONSTANT : il ne sert qu'a poser le RELIEF des stats
    // (les ecarts internes d'un domaine). Le NIVEAU reel est deduit par
    // carriere.poser, qui remet chaque domaine a l'echelle de l'histoire.
    const [f] = G.generer_combattant({ niveau: 60, archetype, division, nom });
    const ageNaissance = jeune
      ? 16 + Math.trunc(Math.pow(alea.random(), 1.4) * 14)   // amateurs : 16-29, jeunes d'abord
      : 21 + Math.trunc(Math.pow(alea.random(), 1.5) * 17); // pros : 21-37
    const c = CA.poser(f, { age: ageNaissance + anneesEnPlus });
    f._niv = null;
    const note = Math.round(f.note_generale() * 10) / 10;

    // Le bilan se DEDUIT de l'histoire, comme le niveau : des annees de
    // pratique sortent des combats, et la qualite fait les victoires.
    const anneesPro = jeune ? 0 : Math.max(0, c.annees - 3);
    const nb = jeune
      ? Math.min(10, Math.trunc(c.annees * 1.2 * alea.random()))
      : Math.min(45, Math.trunc(anneesPro * 2.4 * (0.7 + alea.random() * 0.6)));
    const q = Math.max(0, Math.min(1, (note - 40) / 55));
    const pV = 0.32 + 0.55 * q;
    let v = 0, serie = 0;
    for (let i = 0; i < nb; i++) {
      if (alea.random() < pV) { v++; serie++; } else serie = 0;
    }
    const leger = { id, nom, pays: paysCle, division, archetype, note,
                    age: c.age, ageDebut: c.ageDebut, j: jeune ? 1 : 0,
                    bilan: { v, d: nb - v, serie } };
    return { fiche: f, carriere: c, leger };
  });
}

/* ================================================================== */
/* LE MONDE.                                                           */
/* ================================================================== */
/* /!\ LE PAYS D'UNE ETOILE EST UN NOM ("Brésil"), PAS UN CODE. Premiere
   version : slice(0,3) — d'ou "BRÉ", "TCH", "NIG" dans le monde, trois
   codes qui ne correspondaient a rien et sans drapeau possible. */
const CODE_PAYS = {
  "France": "FRA", "Brésil": "BRA", "Bresil": "BRA", "Tchétchénie": "RUS",
  "Tchetchenie": "RUS", "Nigeria": "NGA", "Espagne": "ESP", "Australie": "AUS",
  "USA": "USA", "États-Unis": "USA", "Etats-Unis": "USA", "Mexique": "MEX",
  "Russie": "RUS", "Pays-Bas": "NLD", "Suède": "SWE", "Pologne": "POL",
  "Japon": "JPN", "Canada": "CAN", "Royaume-Uni": "GBR", "Angleterre": "GBR",
};
const codePays = (x) => CODE_PAYS[x] || String(x || "").slice(0, 3).toUpperCase();

/** Installe les huit tetes d'affiche a la tete de leur division. */
function poserEtoiles(pros, rosters, graine) {
  let ET; try{ ET = require("./etoiles.js"); }catch(e){ return; }
  /* /!\ HORS FLUX (banc 9 : "une saison de vie laisse le flux partage
     intact"). etoiles.fabriquer() RESEME le generateur commun : brancher
     les huit deplacait tous les tirages suivants du monde, et le banc
     l'a vu immediatement (2e tirage attendu 0,4157, obtenu 0,7635).
     On sauve l'etat du generateur, on fabrique, on le remet. Le monde
     reste identique a la graine pres — les etoiles ne coutent aucun
     tirage a personne. */
  const { alea } = require("./alea.js");
  const etat = { mt: alea.mt.slice(), mti: alea.mti, g: alea.gaussSuivant };
  const liste = ET.fabriquer(graine * 7 + 13);
  alea.mt.set(etat.mt); alea.mti = etat.mti; alea.gaussSuivant = etat.g;
  for (const e of liste) {
    const org = e.org || "AFC", div = e.division;
    const roster = rosters[org] && rosters[org][div];
    if (!roster || !roster.length) continue;
    /* L'ancien champion cede sa place : il reste au roster, il descend. */
    const ancien = pros.get(roster[0]);
    if (ancien) { ancien.champion = false; ancien.rang = 2; }
    /* /!\ UN ID BIEN FORME : idPro(division, cellule, k) — pas deux
       arguments. Premiere version : NaN pour les huit, donc UN SEUL homme
       survivait dans la Map (toutes les cles NaN sont la meme cle). */
    const id = idPro(0, 11, 8000 + liste.indexOf(e));
    const l = {
      id, nom: e.nom, pays: codePays(e.pays),
      division: div, archetype: e.archetype, note: 94,
      age: 28 + (liste.indexOf(e) % 6), ageDebut: 20, j: 0,
      bilan: { v: 18 + (liste.indexOf(e) % 7), d: 1 + (liste.indexOf(e) % 3), serie: 4 },
      org, rang: 1, champion: true, notoriete: e.notoriete || 85,
      /* /!\ SA FICHE EST CELLE QU'ETOILES A CALIBREE : on la STOCKE, sinon
         l'hydratation la refabriquerait a partir de sa note et le trou
         volontaire disparaitrait. C'est pour ca qu'il porte salle:false
         mais une fiche quand meme. */
      fiche: e.fighter, etoile: true,
      faits: [{ an: 2026, quoi: `Champion ${org} (${div.replace(/_/g, " ")})` }],
    };
    /* Tout le monde recule d'un cran derriere lui. */
    for (let i = 0; i < roster.length; i++) {
      const x = pros.get(roster[i]);
      if (x && x.rang !== null) x.rang = Math.min(15, x.rang + 1) || null;
    }
    pros.set(id, l);
    roster.unshift(id);
  }
}

function monde(graine) {
  enregistrerOrgs();
  const divisions = Object.keys(E.DIVISIONS);
  const pros = new Map();                 // id -> fiche legere
  const prochains = {};                   // cellule "d:pays" -> prochain k libre
  const rosters = {};                     // org -> division -> [ids] (tries par note)
  for (const org of Object.keys(CL.ORGS)) rosters[org] = {};

  for (let d = 0; d < divisions.length; d++) {
    const division = divisions[d];

    // 1. La population candidate, par pays, chacun avec son histoire.
    const parPays = {};
    for (const p of PAYS) {
      const liste = [];
      for (let k = 0; k < p.candidats; k++) {
        const id = idPro(d, p.idx, k);
        liste.push(fabriquerHomme(graine, id, p.cle, division, false).leger);
      }
      liste.sort((a, b) => b.note - a.note);
      parPays[p.cle] = { liste, prochainK: p.candidats };
    }
    const restants = () => PAYS.flatMap(p => parPays[p.cle].liste);

    // 2. Les organisations recrutent, du sommet vers les nationales.
    // /!\ LES ORGS SIGNENT AUSSI SUR L'HORIZON, PAS SEULEMENT SUR LE NIVEAU
    // DU JOUR (Mael, 09/08 : "des vrais pepites de 22 ans, c'est rare mais
    // ca existe"). Un matchmaker prefere un 24 ans a 80 qu'un 35 ans a 82 :
    // le premier a dix ans de cartes a vendre. Sans ce biais, la selection
    // pure au niveau faisait du sommet une maison de retraite (46 % de 33+
    // a l'AFC meme avec le declin physique).
    const attrait = l => l.note + Math.max(0, 29 - l.age) * 0.55;
    const prendre = (org, n, filtre) => {
      let pool = restants().filter(l => !filtre || filtre(l));
      pool.sort((a, b) => attrait(b) - attrait(a));
      // /!\ Si un petit pays a ete vide par les etages du dessus, on
      // complete sa population — ids qui CONTINUENT la cellule, donc
      // toujours refabricables.
      while (pool.length < n && filtre) {
        for (const p of PAYS) {
          if (!filtre({ pays: p.cle })) continue;
          const id = idPro(d, p.idx, parPays[p.cle].prochainK++);
          parPays[p.cle].liste.push(fabriquerHomme(graine, id, p.cle, division, false).leger);
        }
        pool = restants().filter(l => filtre(l));
        pool.sort((a, b) => attrait(b) - attrait(a));
      }
      const pris = pool.slice(0, n);
      const ids = new Set(pris.map(l => l.id));
      for (const p of PAYS)
        parPays[p.cle].liste = parPays[p.cle].liste.filter(l => !ids.has(l.id));
      // Rang initial : les quinze meilleurs, champion en tete. La
      // notoriete de depart suit le rang et la portee de l'organisation.
      const portee = CL.ORGS[org].portee;
      pris.forEach((l, i) => {
        l.org = org;
        l.rang = i < 15 ? i + 1 : null;
        l.champion = i === 0;
        const t = l.rang ? (16 - l.rang) / 15 : 0;
        l.notoriete = Math.round(Math.min(portee, portee * (0.12 + 0.68 * t)) * 10) / 10;
        pros.set(l.id, l);
      });
      rosters[org][division] = pris.map(l => l.id);
    };

    prendre("AFC", TAILLES.AFC, null);
    prendre("GFL", TAILLES.GFL, null);
    prendre("SOK", TAILLES.SOK, l => EUROPE.has(l.pays));
    prendre("TRI", TAILLES.TRI, l => l.pays === "FRA");
    prendre("HEX", TAILLES.HEX, l => l.pays === "FRA");
    for (const [cle, n] of Object.entries(NATIONALES))
      prendre(cle, 30, l => l.pays === n.pays);
    // Les non-recrutes n'existent pas en tant que pros : ils retournent
    // a l'anonymat du monde amateur.
    // /!\ ON RELEVE LE COMPTEUR DE CHAQUE CELLULE : le nouveau sang de la
    // vie du monde (cartes.js) continuera ces ids, donc restera
    // refabricable comme les autres.
    for (const p of PAYS) prochains[d + ":" + p.idx] = parPays[p.cle].prochainK;
  }

  // 3. Les amateurs : PAS GENERES. Vingt fois les pros, repartis par
  // tradition — chacun n'est qu'une fonction (graine, id) qu'on
  // materialise a la demande.
  const totalAmateurs = pros.size * 20;
  const amateurs = {};
  for (const p of PAYS) {
    amateurs[p.cle] = {};
    for (let d = 0; d < divisions.length; d++)
      amateurs[p.cle][divisions[d]] =
        Math.round(totalAmateurs * p.tradition / divisions.length);
  }

  /* /!\ LES HUIT TETES D'AFFICHE ENTRENT DANS LE MONDE (Mael, 10/08).
     etoiles.js existait depuis des semaines — huit champions concus,
     calibres, avec leur trou volontaire et leur banc (banc 15) — ET
     N'ETAIT BRANCHE NULLE PART. Vanel, Bastos, Aslanov n'existaient dans
     aucune partie. Un module complet qui ne fait rien : la famille de
     defaut que le carnet traque depuis le debut.
     Ils PRENNENT LA CEINTURE de leur division a l'AFC : une tete
     d'affiche calibree pour dominer qui traine au rang 9 ne ressemble a
     rien, et le but de ces huit-la est que le sommet du monde ait un
     visage des le premier jour. */
  poserEtoiles(pros, rosters, graine);

  return { graine, divisions, pros, rosters, amateurs, prochains };
}

/** La fiche moteur complete d'un pro — refabriquee, jamais stockee.
 *  /!\ anneesEnPlus : l'age du monde. Hydrater a +2 ans rend l'homme tel
 *  qu'il est DEUX ANS APRES la naissance du monde — jeune qui a muri,
 *  vieux qui a decline. C'est la fiche que le moteur DOIT utiliser pour
 *  un combat joue a cette date (regle 7 : l'ecran, et le scouting,
 *  racontent ce que le moteur a reellement tire). */
function hydrater(m, id, anneesEnPlus = 0) {
  const l = m.pros.get(id);
  if (!l) throw new Error(`vivier.js : id inconnu ${id}`);
  // /!\ UN HOMME DE LA SALLE NE SE REFABRIQUE PAS. Il a une histoire —
  // tes coachs, ton materiel, ton sparring — qu'aucune graine ne peut
  // reproduire. Sans ce garde-fou, hydrater rendait SILENCIEUSEMENT un
  // inconnu a la place d'Okonkwo (defaut trouve au branchement du 09/08).
  // Meme famille que le "defaut silencieux" du carnet : ce qui ne leve
  // pas se decouvre trois seances plus tard.
  if (l.salle) throw new Error(
    `vivier.js : ${l.nom} est un homme de la salle — passer par salle.ficheDe`);
  return fabriquerHomme(m.graine, id, l.pays, l.division, l.j === 1, anneesEnPlus);
}

/** LE NOUVEAU SANG : un jeune du pays passe pro. L'id CONTINUE la cellule
 *  (compteur du monde), donc il se refabrique comme les autres — et il est
 *  tire en mode jeune (16-29 ans) : c'est la montee, pas un journeyman
 *  sorti de nulle part. Le caller (cartes.js) pose org, rang, contrat. */
function nouveauPro(m, paysCle, division, anneesEnPlus = 0) {
  const p = PAYS_PAR_CLE[paysCle];
  if (!p) throw new Error(`vivier.js : pays inconnu ${paysCle}`);
  const d = m.divisions.indexOf(division);
  const cle = d + ":" + p.idx;
  const k = m.prochains[cle]++;
  const id = idPro(d, p.idx, k);
  const h = fabriquerHomme(m.graine, id, paysCle, division, true, anneesEnPlus);
  m.pros.set(id, h.leger);
  return h;
}

/** Un amateur du monde, materialise. k < nb d'amateurs de la cellule. */
function amateur(m, paysCle, division, k) {
  const p = PAYS_PAR_CLE[paysCle];
  if (!p) throw new Error(`vivier.js : pays inconnu ${paysCle}`);
  if (k >= m.amateurs[paysCle][division])
    throw new Error(`vivier.js : amateur ${k} hors de la cellule ${paysCle}/${division}`);
  const d = m.divisions.indexOf(division);
  return fabriquerHomme(m.graine, idAmateur(d, p.idx, k), paysCle, division, true);
}

module.exports = { PAYS, PAYS_PAR_CLE, NATIONALES, TAILLES, EUROPE,
                   enregistrerOrgs, avecFlux, melanger, fabriquerHomme,
                   monde, hydrater, amateur, nouveauPro, idPro, idAmateur };

