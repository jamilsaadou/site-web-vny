import { scryptSync, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const newsRecords = [
  {
    title: "Lancement d'un programme de voirie dans 5 arrondissements",
    slug: "programme-voirie-5-arrondissements",
    excerpt:
      "La Ville de Niamey déploie une nouvelle phase de réhabilitation urbaine pour améliorer la circulation et la sécurité des quartiers.",
    content:
      "La mairie coordonne la réhabilitation de plusieurs axes stratégiques afin de fluidifier la mobilité et renforcer la sécurité des usagers.",
    featuredImage: "/media/municipalite-1.jpg",
    category: "ACTUALITE",
    location: "Niamey Centre",
    seoTitle: "Programme voirie 2026 - Ville de Niamey",
    seoDescription: "Réhabilitation de voirie dans les 5 arrondissements de Niamey.",
    seoKeywords: "niamey, voirie, mairie, travaux urbains",
    publishedAt: new Date("2026-02-28"),
    gallery: [
      { imagePath: "/media/municipalite-1.jpg", caption: "Démarrage des travaux", sortOrder: 1 },
      { imagePath: "/media/municipalite-3.jpg", caption: "Suivi technique", sortOrder: 2 },
    ],
  },
  {
    title: "Naneye Yarda: 2 000 jeunes mobilisés pour la propreté urbaine",
    slug: "naneye-yarda-jeunes-proprete-urbaine",
    excerpt:
      "Des équipes citoyennes renforcent les opérations de nettoyage et de sensibilisation dans les marchés et axes principaux.",
    content:
      "Les opérations hebdomadaires réunissent les services municipaux, les associations de quartier et les volontaires pour une ville plus propre.",
    featuredImage: "/media/municipalite-2.jpg",
    category: "NANEYE_YARDA",
    location: "Rive Droite",
    seoTitle: "Naneye Yarda - Jeunes mobilisés",
    seoDescription: "Participation citoyenne des jeunes pour la salubrité urbaine.",
    seoKeywords: "naneye yarda, propreté, jeunes, niamey",
    publishedAt: new Date("2026-02-25"),
    gallery: [
      { imagePath: "/media/municipalite-2.jpg", caption: "Équipes de terrain", sortOrder: 1 },
      { imagePath: "/media/municipalite-1.jpg", caption: "Action de quartier", sortOrder: 2 },
    ],
  },
  {
    title: "Le centenaire: appel à projets culturels de quartier",
    slug: "centenaire-appel-projets-culturels",
    excerpt:
      "La mairie ouvre un appel à propositions pour valoriser l'histoire de Niamey à travers des expositions, spectacles et archives.",
    content:
      "Ce programme du centenaire finance des initiatives locales mêlant mémoire urbaine, création artistique et participation citoyenne.",
    featuredImage: "/media/centenaire-1.jpg",
    category: "CENTENAIRE",
    location: "Hôtel de Ville",
    seoTitle: "Centenaire de Niamey - Appel à projets",
    seoDescription: "Appel à projets culturels dans le cadre du centenaire de Niamey.",
    seoKeywords: "centenaire, niamey, culture, patrimoine",
    publishedAt: new Date("2026-02-20"),
    gallery: [
      { imagePath: "/media/centenaire-1.jpg", caption: "Programme culturel", sortOrder: 1 },
      { imagePath: "/media/centenaire-2.jpg", caption: "Partenaires institutionnels", sortOrder: 2 },
    ],
  },
];

const eventRecords = [
  {
    title: "Forum municipal Naney Yarda 2026",
    slug: "forum-municipal-naney-yarda-2026",
    detail: "Présentation des priorités de gouvernance municipale, civisme urbain et services de proximité.",
    featuredImage: "/media/centenaire-2.jpg",
    location: "Palais des Congrès de Niamey",
    latitude: 13.5137,
    longitude: 2.1098,
    seoTitle: "Forum municipal Naney Yarda 2026",
    seoDescription: "Forum municipal dédié à la gouvernance et aux services urbains de Niamey.",
    seoKeywords: "forum municipal, naneye yarda, niamey",
    startAt: new Date("2026-04-18T09:00:00+01:00"),
    gallery: [
      { imagePath: "/media/centenaire-2.jpg", caption: "Ouverture du forum", sortOrder: 1 },
      { imagePath: "/media/municipalite-3.jpg", caption: "Participation institutionnelle", sortOrder: 2 },
    ],
  },
  {
    title: "Journée citoyenne de salubrité inter-quartiers",
    slug: "journee-citoyenne-salubrite-inter-quartiers",
    detail: "Mobilisation simultanée des quartiers pour nettoyage, tri et sensibilisation.",
    featuredImage: "/media/municipalite-2.jpg",
    location: "5 arrondissements de Niamey",
    latitude: 13.526,
    longitude: 2.116,
    seoTitle: "Journée citoyenne de salubrité - Niamey",
    seoDescription: "Opération inter-quartiers de salubrité dans la capitale.",
    seoKeywords: "salubrité, citoyenneté, quartiers, niamey",
    startAt: new Date("2026-05-11T06:30:00+01:00"),
    gallery: [
      { imagePath: "/media/municipalite-2.jpg", caption: "Déploiement sur le terrain", sortOrder: 1 },
      { imagePath: "/media/municipalite-1.jpg", caption: "Coordination des équipes", sortOrder: 2 },
    ],
  },
];

const sliderItems = [
  {
    title: "Lancement du centenaire",
    description: "Cérémonie officielle avec les autorités municipales et nationales.",
    imagePath: "/media/centenaire-1.jpg",
    sortOrder: 1,
  },
  {
    title: "Mobilisation institutionnelle",
    description: "Coordination des acteurs pour les activités citoyennes et culturelles.",
    imagePath: "/media/centenaire-2.jpg",
    sortOrder: 2,
  },
  {
    title: "Gestion urbaine moderne",
    description: "Suivi opérationnel des équipements et des priorités communales.",
    imagePath: "/media/municipalite-3.jpg",
    sortOrder: 3,
  },
];

async function seedHomepageConfig() {
  await prisma.homepageConfig.upsert({
    where: { id: "main" },
    update: {
      heroBadge: "Ville de Niamey",
      heroTitle: "Une plateforme moderne pour suivre la vie de votre ville.",
      heroSubtitle:
        "Suivez l'actualité municipale, les actions Naneye Yarda, le programme du centenaire et les services de contact de la mairie dans une interface claire, rapide et animée.",
      seoTitle: "Ville de Niamey - Portail municipal",
      seoDescription:
        "Informations officielles de la Ville de Niamey: actualités, événements, services municipaux et contact.",
      seoKeywords: "ville de niamey, mairie, actualités, services municipaux, centenaire",
    },
    create: {
      id: "main",
      heroBadge: "Ville de Niamey",
      heroTitle: "Une plateforme moderne pour suivre la vie de votre ville.",
      heroSubtitle:
        "Suivez l'actualité municipale, les actions Naneye Yarda, le programme du centenaire et les services de contact de la mairie dans une interface claire, rapide et animée.",
      seoTitle: "Ville de Niamey - Portail municipal",
      seoDescription:
        "Informations officielles de la Ville de Niamey: actualités, événements, services municipaux et contact.",
      seoKeywords: "ville de niamey, mairie, actualités, services municipaux, centenaire",
    },
  });

  await prisma.sliderItem.deleteMany({});
  for (const item of sliderItems) {
    await prisma.sliderItem.create({ data: item });
  }
}

async function seedNews() {
  for (const record of newsRecords) {
    const { gallery, ...newsData } = record;
    const actualite = await prisma.actualite.upsert({
      where: { slug: newsData.slug },
      update: newsData,
      create: newsData,
    });

    await prisma.actualiteGalleryImage.deleteMany({ where: { actualiteId: actualite.id } });
    for (const image of gallery) {
      await prisma.actualiteGalleryImage.create({
        data: {
          actualiteId: actualite.id,
          imagePath: image.imagePath,
          caption: image.caption,
          sortOrder: image.sortOrder,
        },
      });
    }
  }
}

async function seedEvents() {
  for (const record of eventRecords) {
    const { gallery, ...eventData } = record;
    const event = await prisma.event.upsert({
      where: { slug: eventData.slug },
      update: eventData,
      create: eventData,
    });

    await prisma.eventGalleryImage.deleteMany({ where: { eventId: event.id } });
    for (const image of gallery) {
      await prisma.eventGalleryImage.create({
        data: {
          eventId: event.id,
          imagePath: image.imagePath,
          caption: image.caption,
          sortOrder: image.sortOrder,
        },
      });
    }
  }
}

async function seedSuperAdminFromEnv() {
  const email = (process.env.ADMIN_EMAIL ?? "superadmin@niamey.ne").trim().toLowerCase();
  const password = (process.env.ADMIN_PASSWORD ?? "").trim();
  const name = (process.env.ADMIN_NAME ?? "Super Admin Ville de Niamey").trim();

  if (!password) {
    return;
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      fullName: name,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
      isActive: true,
    },
    create: {
      fullName: name,
      email,
      passwordHash: hashPassword(password),
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
}

async function main() {
  await seedHomepageConfig();
  await seedNews();
  await seedEvents();
  await seedSuperAdminFromEnv();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding termine.");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error("Erreur pendant le seed:", error);
    process.exit(1);
  });
