import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.highlight.deleteMany({});
  await prisma.tournamentPlacement.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.team.deleteMany({});

  console.log("Creating teams...");
  const apex = await prisma.team.create({
    data: {
      name: "Apex Esports",
      tag: "APX",
      region: "North America",
      logoUrl: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=100&auto=format&fit=crop&q=60",
    },
  });

  const viper = await prisma.team.create({
    data: {
      name: "Viper Clan",
      tag: "VPR",
      region: "Southeast Asia",
      logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100&auto=format&fit=crop&q=60",
    },
  });

  const nebula = await prisma.team.create({
    data: {
      name: "Nebula Gaming",
      tag: "NEB",
      region: "Europe",
      logoUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&auto=format&fit=crop&q=60",
    },
  });

  const zeus = await prisma.team.create({
    data: {
      name: "Zeus Esports",
      tag: "ZUS",
      region: "South Asia",
      logoUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format&fit=crop&q=60",
    },
  });

  const phantom = await prisma.team.create({
    data: {
      name: "Phantom Esports",
      tag: "PHN",
      region: "Middle East",
      logoUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100&auto=format&fit=crop&q=60",
    },
  });

  const teams = { APX: apex, VPR: viper, NEB: nebula, ZUS: zeus, PHN: phantom };

  console.log("Creating players with Ultimate Royale metrics and contact handles...");

  const playersData = [
    {
      ign: "Xenon",
      characterId: "5123984712",
      region: "North America",
      bio: "Veteran IGL known for clinical rotations and zone predictions. Leading APX since 2024.",
      status: "Signed",
      role: "IGL",
      device: "iPad Pro 11-inch (M4)",
      controlSetup: "5-finger claw, gyroscope always-on",
      kdRatio: 4.85,
      headshotPct: 24.2,
      winRate: 22.8,
      matchesPlayed: 450,
      urRank: "Legend",
      urPoints: 2200,
      twitter: "twitter.com/xenon_pubg",
      discord: "xenon#1111",
      instagram: "instagram.com/xenon_pubg",
      teamTag: "APX" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Apex Esports", placement: 3 },
        { date: "2025-07", tournamentName: "PUBG Mobile World Invitational (PMWI)", teamRepresented: "Apex Esports", placement: 2 },
        { date: "2025-04", tournamentName: "PMPL North America Spring", teamRepresented: "Apex Esports", placement: 1 },
      ],
      highlights: [
        { title: "PMGC 2025 1v4 Squad Wipe vs Nova", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { title: "Xenon's Galaxy Brain Rotations Guide", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Valerie",
      characterId: "5820491842",
      region: "Southeast Asia",
      bio: "Unstoppable front-line entry fragger. Holds the record for most close-range clutches in PMPL SEA.",
      status: "Signed",
      role: "Entry Fragger",
      device: "iPhone 15 Pro Max",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 7.12,
      headshotPct: 32.8,
      winRate: 28.5,
      matchesPlayed: 520,
      urRank: "Legend",
      urPoints: 2450,
      twitter: "twitter.com/valerie_frags",
      discord: "valerie#2222",
      facebook: "facebook.com/valerie.esports",
      teamTag: "VPR" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Viper Clan", placement: 1 },
        { date: "2025-08", tournamentName: "PMPL SEA Championship Autumn", teamRepresented: "Viper Clan", placement: 1 },
        { date: "2025-05", tournamentName: "PMPL SEA Championship Spring", teamRepresented: "Viper Clan", placement: 4 },
      ],
      highlights: [
        { title: "Valerie PMGC MVP Highlights", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { title: "Insane 200m M416 + 6x Spray Clutch", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Specter",
      characterId: "5910283911",
      region: "Europe",
      bio: "Elite support and backup sniper. Currently a free agent seeking a competitive tier-1 roster.",
      status: "Looking For Team",
      role: "Sniper",
      device: "ROG Phone 8 Pro",
      controlSetup: "4-finger claw, gyroscope ads-only",
      kdRatio: 5.40,
      headshotPct: 39.5,
      winRate: 18.2,
      matchesPlayed: 380,
      urRank: "Peerless",
      urPoints: 1980,
      twitter: "twitter.com/specter_awm",
      discord: "specter#3333",
      placements: [
        { date: "2024-12", tournamentName: "PMPL European Championship", teamRepresented: "Free Agent Alliance", placement: 5 },
        { date: "2024-06", tournamentName: "PMSL EMEA Spring", teamRepresented: "G2 Esports (Loan)", placement: 2 },
      ],
      highlights: [
        { title: "Specter - The AWM Demon Compilation", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Tectonic",
      characterId: "5349182049",
      region: "Europe",
      bio: "Support extraordinaire. Famous for utilities usage and keeping the squad alive in impossible zone shifts.",
      status: "Signed",
      role: "Support",
      device: "iPad Pro 12.9-inch",
      controlSetup: "6-finger claw, gyroscope always-on",
      kdRatio: 3.90,
      headshotPct: 19.8,
      winRate: 25.0,
      matchesPlayed: 600,
      urRank: "Supreme",
      urPoints: 1650,
      discord: "tectonic#4444",
      instagram: "instagram.com/tectonic_support",
      teamTag: "NEB" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Nebula Gaming", placement: 5 },
        { date: "2025-06", tournamentName: "PMPL European Championship Summer", teamRepresented: "Nebula Gaming", placement: 1 },
      ],
      highlights: [
        { title: "Tectonic's PMGC Grenade Masterclass", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Vortex",
      characterId: "5201948391",
      region: "South Asia",
      bio: "Aggressive entry player with lightning reflex speed. Looking for a local or international signed offer.",
      status: "Looking For Team",
      role: "Entry Fragger",
      device: "iPhone 15 Pro",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 6.80,
      headshotPct: 29.1,
      winRate: 20.4,
      matchesPlayed: 410,
      urRank: "Peerless",
      urPoints: 1820,
      twitter: "twitter.com/vortex_entry",
      discord: "vortex#5555",
      placements: [
        { date: "2025-03", tournamentName: "PMPL South Asia Spring", teamRepresented: "Underdogs Esports", placement: 3 },
      ],
      highlights: [
        { title: "Vortex - 30 Kills Solo vs Squads Handcam", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Siren",
      characterId: "5492019483",
      region: "Southeast Asia",
      bio: "Calm, composed support player. Specializes in vehicle management and back-cover smoke setups.",
      status: "Looking For Team",
      role: "Support",
      device: "iPhone 15 Pro Max",
      controlSetup: "4-finger claw, gyroscope off",
      kdRatio: 3.25,
      headshotPct: 16.5,
      winRate: 15.6,
      matchesPlayed: 320,
      urRank: "Exceed",
      urPoints: 1420,
      facebook: "facebook.com/siren.support",
      discord: "siren#6666",
      placements: [
        { date: "2024-09", tournamentName: "PMPL SEA Championship Autumn", teamRepresented: "Rising Stars", placement: 8 },
      ],
      highlights: [
        { title: "Siren - IQ 200 Clutch Smoke Plays", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "NovaStrike",
      characterId: "5109384729",
      region: "South Asia",
      bio: "Zeus Esports' veteran captain. Master of split pushes and micro-management.",
      status: "Signed",
      role: "IGL",
      device: "iPad Pro 11-inch",
      controlSetup: "5-finger claw, gyroscope always-on",
      kdRatio: 4.52,
      headshotPct: 21.0,
      winRate: 26.4,
      matchesPlayed: 480,
      urRank: "Legend",
      urPoints: 2180,
      twitter: "twitter.com/novastrike_igl",
      discord: "novastrike#7777",
      teamTag: "ZUS" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Zeus Esports", placement: 2 },
        { date: "2025-07", tournamentName: "PUBG Mobile World Invitational (PMWI)", teamRepresented: "Zeus Esports", placement: 4 },
        { date: "2025-03", tournamentName: "PMPL South Asia Spring", teamRepresented: "Zeus Esports", placement: 1 },
      ],
      highlights: [
        { title: "NovaStrike - Leading Zeus to PMGC Silver", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Frostbite",
      characterId: "5602938174",
      region: "North America",
      bio: "Precision sniper who dominates long-range engagements. Looking for a tier-1 competitive team.",
      status: "Looking For Team",
      role: "Sniper",
      device: "iPhone 14 Pro Max",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 5.95,
      headshotPct: 41.2,
      winRate: 19.8,
      matchesPlayed: 350,
      urRank: "Peerless",
      urPoints: 1890,
      twitter: "twitter.com/frostbite_pubg",
      discord: "frostbite#8888",
      placements: [
        { date: "2025-02", tournamentName: "PMPL North America Spring Qualifiers", teamRepresented: "Team Frost", placement: 2 },
      ],
      highlights: [
        { title: "Frostbite - AWM Headshot Compilation", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Reaper",
      characterId: "5892019485",
      region: "Middle East",
      bio: "Fierce fragger with the highest close-range duel winrate in Phantom Esports.",
      status: "Signed",
      role: "Entry Fragger",
      device: "ROG Phone 7 Ultimate",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 6.95,
      headshotPct: 30.2,
      winRate: 23.1,
      matchesPlayed: 490,
      urRank: "Legend",
      urPoints: 2310,
      instagram: "instagram.com/reaper_combat",
      discord: "reaper#9999",
      teamTag: "PHN" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Phantom Esports", placement: 6 },
        { date: "2025-06", tournamentName: "PMPL Middle East & Africa Autumn", teamRepresented: "Phantom Esports", placement: 1 },
      ],
      highlights: [
        { title: "Reaper - PMGC Close Combat Highlights", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Eclipse",
      characterId: "5720194827",
      region: "Middle East",
      bio: "Ex-Phantom co-leader. Strategic mind with excellent communication and roster-management skills.",
      status: "Looking For Team",
      role: "IGL",
      device: "iPhone 15 Pro",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 4.10,
      headshotPct: 22.4,
      winRate: 21.0,
      matchesPlayed: 440,
      urRank: "Peerless",
      urPoints: 1780,
      twitter: "twitter.com/eclipse_igl",
      discord: "eclipse#1010",
      placements: [
        { date: "2024-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Phantom Esports", placement: 8 },
        { date: "2024-05", tournamentName: "PMPL Middle East Spring", teamRepresented: "Phantom Esports", placement: 2 },
      ],
      highlights: [
        { title: "Eclipse - 200 IQ Rotations & Calls", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Phoenix",
      characterId: "5990283918",
      region: "Southeast Asia",
      bio: "Unbelievable utility DMR specialist. Holds long-range angles for Viper Clan.",
      status: "Signed",
      role: "Sniper",
      device: "iPad Air (M2)",
      controlSetup: "5-finger claw, gyroscope always-on",
      kdRatio: 5.65,
      headshotPct: 38.0,
      winRate: 27.2,
      matchesPlayed: 460,
      urRank: "Legend",
      urPoints: 2120,
      twitter: "twitter.com/phoenix_snipe",
      discord: "phoenix#2020",
      teamTag: "VPR" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Viper Clan", placement: 1 },
        { date: "2025-08", tournamentName: "PMPL SEA Championship Autumn", teamRepresented: "Viper Clan", placement: 1 },
      ],
      highlights: [
        { title: "Phoenix - DMR Tap Fire Extravaganza", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Havoc",
      characterId: "5221948395",
      region: "North America",
      bio: "Apex Esports' physical front-line fragger. Aggressive, pushes boundaries, and creates space.",
      status: "Signed",
      role: "Entry Fragger",
      device: "iPhone 15 Pro Max",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 6.25,
      headshotPct: 27.5,
      winRate: 21.5,
      matchesPlayed: 430,
      urRank: "Legend",
      urPoints: 2250,
      instagram: "instagram.com/havoc_frags",
      discord: "havoc#3030",
      teamTag: "APX" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Apex Esports", placement: 3 },
        { date: "2025-04", tournamentName: "PMPL North America Spring", teamRepresented: "Apex Esports", placement: 1 },
      ],
      highlights: [
        { title: "Havoc - PMGC Clutch Frags Showcase", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Sentinel",
      characterId: "5334918202",
      region: "Europe",
      bio: "Nebula Gaming's sniper. Holds angles with bolt-action rifles that make opposing teams turn around.",
      status: "Signed",
      role: "Sniper",
      device: "iPad Pro 11-inch",
      controlSetup: "5-finger claw, gyroscope always-on",
      kdRatio: 6.10,
      headshotPct: 42.0,
      winRate: 24.5,
      matchesPlayed: 470,
      urRank: "Legend",
      urPoints: 2190,
      twitter: "twitter.com/sentinel_awm",
      discord: "sentinel#4040",
      teamTag: "NEB" as keyof typeof teams,
      placements: [
        { date: "2025-11", tournamentName: "PUBG Mobile Global Championship (PMGC)", teamRepresented: "Nebula Gaming", placement: 5 },
        { date: "2025-06", tournamentName: "PMPL European Championship Summer", teamRepresented: "Nebula Gaming", placement: 1 },
      ],
      highlights: [
        { title: "Sentinel - PMGC 1-Shot 1-Kill Compilation", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Blaze",
      characterId: "5551948399",
      region: "South Asia",
      bio: "Hyper-aggressive sub fragger looking for a signed spot on a team heading into PMGC 2026.",
      status: "Looking For Team",
      role: "Entry Fragger",
      device: "ROG Phone 8",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 6.42,
      headshotPct: 28.9,
      winRate: 19.5,
      matchesPlayed: 390,
      urRank: "Peerless",
      urPoints: 1950,
      twitter: "twitter.com/blaze_pubgm",
      discord: "blaze#5050",
      placements: [
        { date: "2025-08", tournamentName: "PMPL South Asia Autumn", teamRepresented: "Underdogs Esports", placement: 4 },
      ],
      highlights: [
        { title: "Blaze - Best Clutches & Reflexes 2025", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
    {
      ign: "Mirage",
      characterId: "5662019489",
      region: "North America",
      bio: "Highly adaptable support and backup driver. Excellent under pressure, always plays for the placement points.",
      status: "Looking For Team",
      role: "Support",
      device: "iPhone 15 Pro",
      controlSetup: "4-finger claw, gyroscope always-on",
      kdRatio: 3.45,
      headshotPct: 17.8,
      winRate: 17.2,
      matchesPlayed: 310,
      urRank: "Supreme",
      urPoints: 1550,
      instagram: "instagram.com/mirage_support",
      discord: "mirage#6060",
      placements: [
        { date: "2024-10", tournamentName: "PMPL North America Autumn", teamRepresented: "Team Outlaws", placement: 6 },
      ],
      highlights: [
        { title: "Mirage - Clutch Vehicle Decoy Plays", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ],
    },
  ];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const p of playersData) {
    const { placements, highlights, teamTag, ...playerDetails } = p;
    
    // Find team if teamTag is provided
    let teamId = null;
    if (teamTag && teams[teamTag]) {
      teamId = teams[teamTag].id;
    }

    const createdPlayer = await prisma.player.create({
      data: {
        ...playerDetails,
        email: `${playerDetails.ign.toLowerCase()}@esports.com`,
        password: hashedPassword,
        teamId,
      },
    });

    console.log(`Created player: ${createdPlayer.ign} (ID: ${createdPlayer.id})`);

    // Create Placements
    if (placements && placements.length > 0) {
      for (const pl of placements) {
        await prisma.tournamentPlacement.create({
          data: {
            ...pl,
            playerId: createdPlayer.id,
          },
        });
      }
    }

    // Create Highlights
    if (highlights && highlights.length > 0) {
      for (const hl of highlights) {
        await prisma.highlight.create({
          data: {
            ...hl,
            playerId: createdPlayer.id,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
