export type ServiceIcon =
  | "home"
  | "transport"
  | "citizen"
  | "education"
  | "environment"
  | "social";

export type ServiceCategory = {
  slug: string;
  label: string;
  description: string;
  icon: ServiceIcon;
};

export type MunicipalService = {
  slug: string;
  title: string;
  categorySlug: string;
  processingTime: string;
  fee: string;
  office: string;
  summary: string;
  steps: string[];
  requiredDocs: string[];
  mandatory: string;
  validity: string;
  hours: string;
  contact: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "maison-propriete",
    label: "Maison - Propriété",
    description: "Urbanisme, propriété foncière et démarches de construction.",
    icon: "home",
  },
  {
    slug: "transport-mobilite",
    label: "Transport et mobilité",
    description: "Titres de transport, circulation et mobilité urbaine.",
    icon: "transport",
  },
  {
    slug: "citoyennete",
    label: "Citoyenneté",
    description: "État civil, autorisations administratives et réglementation.",
    icon: "citizen",
  },
  {
    slug: "education-jeunesse",
    label: "Éducation et jeunesse",
    description: "Services culturels, sports et accompagnement des jeunes.",
    icon: "education",
  },
  {
    slug: "environnement",
    label: "Environnement",
    description: "Salubrité publique, collecte et gestion environnementale.",
    icon: "environment",
  },
  {
    slug: "sante-social",
    label: "Santé et social",
    description: "Appui social, prise en charge d'urgence et aide locale.",
    icon: "social",
  },
];

export const municipalServices: MunicipalService[] = [
  {
    slug: "titre-taxi-particulier",
    title: "Titre de Taxi - Particulier",
    categorySlug: "transport-mobilite",
    processingTime: "24h",
    fee: "9 400 FCFA",
    office: "Direction du transport urbain",
    summary: "Autorisation de mise en service d'une voiture de place.",
    steps: [
      "Constitution du dossier complet et dépôt à la direction du transport urbain.",
      "Vérification technique et administrative puis attribution d'un numéro de portière.",
      "Paiement des frais et retrait du titre de taxi.",
    ],
    requiredDocs: [
      "Copie de la carte grise",
      "Copie de la pièce d'identité du propriétaire",
      "Attestation d'assurance en cours de validité",
      "Contrôle technique valide",
    ],
    mandatory: "Oui",
    validity: "12 mois, renouvelable avec quittance mensuelle de 4 500 FCFA.",
    hours: "Lundi à jeudi: 08h00-17h30 | Vendredi: 08h00-13h00",
    contact: "+227 20 73 42 11",
  },
  {
    slug: "permis-construire-residentiel",
    title: "Permis de construire résidentiel",
    categorySlug: "maison-propriete",
    processingTime: "10 jours ouvrables",
    fee: "25 000 FCFA",
    office: "Direction de l'urbanisme et de l'habitat",
    summary: "Autorisation préalable pour la construction d'une habitation.",
    steps: [
      "Dépôt du plan visé et de la demande au guichet urbanisme.",
      "Inspection de terrain et vérification de conformité du projet.",
      "Validation technique et délivrance du permis.",
    ],
    requiredDocs: [
      "Titre foncier ou acte de cession",
      "Plan architectural signé",
      "Copie de la pièce d'identité du demandeur",
      "Quittance de paiement des droits",
    ],
    mandatory: "Oui",
    validity: "24 mois à partir de la date de signature.",
    hours: "Lundi à jeudi: 08h00-17h30 | Vendredi: 08h00-13h00",
    contact: "+227 20 72 55 08",
  },
  {
    slug: "acte-naissance-securise",
    title: "Acte de naissance sécurisé",
    categorySlug: "citoyennete",
    processingTime: "30 minutes",
    fee: "500 FCFA",
    office: "Centre principal d'état civil",
    summary: "Délivrance ou duplicata d'acte de naissance sécurisé.",
    steps: [
      "Présenter la référence d'enregistrement ou l'ancien acte.",
      "Vérification du registre et génération du document sécurisé.",
      "Retrait immédiat au guichet.",
    ],
    requiredDocs: [
      "Ancien acte (si disponible)",
      "Pièce d'identité du déclarant",
      "Informations de filiation",
    ],
    mandatory: "Oui",
    validity: "Permanent.",
    hours: "Lundi à jeudi: 08h00-17h00 | Vendredi: 08h00-12h30",
    contact: "+227 20 72 66 12",
  },
  {
    slug: "autorisation-occupation-voie-temporaire",
    title: "Autorisation d'occupation temporaire de voie",
    categorySlug: "citoyennete",
    processingTime: "72h",
    fee: "15 000 FCFA",
    office: "Direction de la réglementation urbaine",
    summary: "Occupation temporaire de l'espace public pour activité ponctuelle.",
    steps: [
      "Dépôt de la demande avec localisation exacte.",
      "Évaluation de l'impact sur la circulation et la sécurité.",
      "Émission de l'autorisation et du calendrier d'occupation.",
    ],
    requiredDocs: [
      "Demande signée",
      "Plan de localisation",
      "Pièce d'identité ou RCCM",
      "Quittance municipale",
    ],
    mandatory: "Oui",
    validity: "Valable sur la période autorisée (maximum 30 jours).",
    hours: "Lundi à jeudi: 08h00-17h30 | Vendredi: 08h00-13h00",
    contact: "+227 20 73 11 44",
  },
  {
    slug: "abonnement-collecte-dechets",
    title: "Abonnement collecte des déchets",
    categorySlug: "environnement",
    processingTime: "48h",
    fee: "3 000 FCFA / mois",
    office: "Direction de la salubrité publique",
    summary: "Mise en place d'un service régulier de collecte au domicile.",
    steps: [
      "Inscription du ménage auprès du service de salubrité.",
      "Attribution du circuit de collecte selon le quartier.",
      "Activation de l'abonnement et suivi mensuel.",
    ],
    requiredDocs: [
      "Pièce d'identité",
      "Adresse complète du domicile",
      "Contact téléphonique",
    ],
    mandatory: "Oui, pour les zones couvertes",
    validity: "Renouvellement mensuel.",
    hours: "Lundi à jeudi: 08h00-16h30 | Vendredi: 08h00-12h30",
    contact: "+227 20 74 10 21",
  },
  {
    slug: "carte-jeune-culture-sport",
    title: "Carte Jeune Culture & Sport",
    categorySlug: "education-jeunesse",
    processingTime: "2 jours",
    fee: "2 500 FCFA",
    office: "Direction jeunesse, culture et sports",
    summary: "Accès aux bibliothèques, centres culturels et équipements sportifs municipaux.",
    steps: [
      "Dépôt de la demande et photo d'identité.",
      "Validation du profil et génération de la carte.",
      "Retrait de la carte au centre municipal.",
    ],
    requiredDocs: [
      "Pièce d'identité ou carte scolaire",
      "Photo d'identité récente",
      "Autorisation parentale pour mineur",
    ],
    mandatory: "Non",
    validity: "12 mois.",
    hours: "Lundi à jeudi: 08h00-17h00 | Vendredi: 08h00-13h00",
    contact: "+227 20 73 30 09",
  },
  {
    slug: "aide-sociale-urgence",
    title: "Aide sociale d'urgence",
    categorySlug: "sante-social",
    processingTime: "24h à 72h",
    fee: "Gratuit",
    office: "Service action sociale municipale",
    summary: "Prise en charge rapide des situations sociales urgentes.",
    steps: [
      "Signalement du cas au guichet social communal.",
      "Évaluation sociale par l'équipe municipale.",
      "Orientation vers l'appui adapté et suivi du dossier.",
    ],
    requiredDocs: [
      "Pièce d'identité",
      "Justificatif de résidence",
      "Rapport ou attestation de situation",
    ],
    mandatory: "Non",
    validity: "Selon décision d'accompagnement.",
    hours: "Lundi à jeudi: 08h00-17h00 | Vendredi: 08h00-13h00",
    contact: "+227 20 74 33 77",
  },
];

export function getCategoryBySlug(categorySlug: string) {
  return serviceCategories.find((category) => category.slug === categorySlug) ?? null;
}

export function getServicesByCategory(categorySlug: string) {
  return municipalServices.filter((service) => service.categorySlug === categorySlug);
}

export function getServiceBySlugs(categorySlug: string, serviceSlug: string) {
  return (
    municipalServices.find(
      (service) => service.categorySlug === categorySlug && service.slug === serviceSlug,
    ) ?? null
  );
}

export function getServicePath(service: Pick<MunicipalService, "categorySlug" | "slug">) {
  return `/naneye-yarda/services/${service.categorySlug}/${service.slug}`;
}

export function getCategoryPath(category: Pick<ServiceCategory, "slug">) {
  return `/naneye-yarda/services/${category.slug}`;
}
