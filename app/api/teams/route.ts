import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        players: true,
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);

    return NextResponse.json(
      { error: "Erreur serveur API teams" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.captainPhone) {
      return NextResponse.json(
        { error: "Le nom de l'équipe et le numéro du chef sont obligatoires." },
        { status: 400 }
      );
    }

    if (body.players.length < 11) {
      return NextResponse.json(
        { error: "Il faut au minimum 11 joueurs." },
        { status: 400 }
      );
    }

    const existingTeam = await prisma.team.findUnique({
      where: {
        name: body.name,
      },
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
          create: body.players,
        },
      },
      include: {
        players: true,
      },
    });

    return NextResponse.json(team);
  } catch (error) {
    console.error("POST /api/teams error:", error);

    return NextResponse.json(
      { error: "Erreur serveur lors de la création." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const ADMIN_PASSWORD = "BaAssiyah18";

    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Accès refusé : mot de passe incorrect." },
        { status: 403 }
      );
    }

    await prisma.player.deleteMany({
      where: {
        teamId: Number(body.id),
      },
    });

    await prisma.team.delete({
      where: {
        id: Number(body.id),
      },
    });

    return NextResponse.json({ message: "Équipe supprimée" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Impossible de supprimer cette équipe." },
      { status: 500 }
    );
  }
}