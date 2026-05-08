import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const countries = [
  "Maroc",
  "Algérie",
  "Tunisie",
  "Sénégal",
  "Côte d’Ivoire",
  "Antilles",
  "Cameroun",
  "Nigeria",
  "Mali",
  "Congo Brazzaville",
  "RD Congo",
  "Guinée",
  "Reste du monde",
  "Reste du monde",
  "France"
];

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: { players: true },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);

    return NextResponse.json(
      {
        error: "Erreur serveur API teams",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(body.name)) {
      return NextResponse.json(
        { error: "Le nom de l'équipe ne doit contenir que des lettres." },
        { status: 400 }
      );
    }

    if (!countries.includes(body.name)) {
      return NextResponse.json(
        { error: "Pays invalide." },
        { status: 400 }
      );
    }

    for (const player of body.players) {
      if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(player.name)) {
        return NextResponse.json(
          { error: "Les noms des joueurs ne doivent contenir que des lettres." },
          { status: 400 }
        );
      }

      if (isNaN(Number(player.age))) {
        return NextResponse.json(
          { error: "L'âge doit être un nombre." },
          { status: 400 }
        );
      }
    }

    if (!body.name || !body.captainPhone) {
      return NextResponse.json(
        { error: "Nom d'équipe et numéro obligatoires." },
        { status: 400 }
      );
    }

    if (!body.players || body.players.length < 11) {
      return NextResponse.json(
        { error: "Il faut au minimum 11 joueurs." },
        { status: 400 }
      );
    }

    if (body.players.length > 15) {
      return NextResponse.json(
        { error: "Il faut maximum 15 joueurs." },
        { status: 400 }
      );
    }

    const existingTeam = await prisma.team.findUnique({
      where: { name: body.name },
    });

    if (existingTeam) {
      return NextResponse.json(
        {
          error: "Cette équipe est déjà composée.",
          captainPhone: existingTeam.captainPhone,
        },
        { status: 409 }
      );
    }

    const team = await prisma.team.create({
      data: {
        name: body.name,
        captainPhone: body.captainPhone,
        players: {
          create: body.players.map((p: any) => ({
            name: p.name,
            age: Number(p.age),
          })),
        },
      },
      include: { players: true },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("POST /api/teams error:", error);

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la création.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    if (!ADMIN_PASSWORD || body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 403 }
      );
    }

    await prisma.player.deleteMany({
      where: { teamId: Number(body.id) },
    });

    await prisma.team.delete({
      where: { id: Number(body.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/teams error:", error);

    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}