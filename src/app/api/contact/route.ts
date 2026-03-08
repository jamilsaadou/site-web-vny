import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FULLNAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 300;
const MAX_MESSAGE_LENGTH = 5000;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    fullName?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  const fullName = body.fullName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!fullName || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Tous les champs sont obligatoires." },
      { status: 400 },
    );
  }

  if (
    fullName.length > MAX_FULLNAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    subject.length > MAX_SUBJECT_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { error: "Un ou plusieurs champs dépassent la longueur maximale autorisée." },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Le message doit contenir au moins 10 caractères." },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        error:
          "Base de données non configurée. Ajoutez DATABASE_URL dans le fichier .env pour activer l'envoi.",
      },
      { status: 503 },
    );
  }

  try {
    await prisma.contactMessage.create({
      data: {
        fullName,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json(
      { message: "Votre message a bien été reçu par la mairie." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible d'enregistrer le message pour le moment." },
      { status: 500 },
    );
  }
}
