"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [teams, setTeams] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [players, setPlayers] = useState([{ name: "", age: "" }]);
  const [message, setMessage] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [adminPassword, setAdminPassword] = useState("");

  async function loadTeams() {
    const res = await fetch("/api/teams");
    const data = await res.json();

    console.log("teams API:", data);

    if (Array.isArray(data)) {
      setTeams(data);
      setMessage("");
    } else {
      setTeams([]);
      setMessage(data.error || "Erreur lors du chargement des équipes.");
    }
  }

  useEffect(() => {
    loadTeams();
  }, []);

  function addPlayer() {
    if (players.length >= 15) return;
    setPlayers([...players, { name: "", age: "" }]);
  }

  function removePlayer(index: number) {
    if (players.length <= 1) return;
    setPlayers(players.filter((_, i) => i !== index));
  }

  function resetForm() {
    setName("");
    setCaptainPhone("");
    setPlayers([{ name: "", age: "" }]);
    setMessage("");
  }

  function updatePlayer(i: number, field: string, value: string) {
    if (field === "name" && /[0-9]/.test(value)) return;

    const copy = [...players];
    copy[i] = { ...copy[i], [field]: value };
    setPlayers(copy);
  }

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/teams", {
      method: "POST",
      body: JSON.stringify({
        name,
        captainPhone,
        players: players.map((p) => ({
          name: p.name,
          age: Number(p.age),
        })),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.captainPhone) {
        setMessage(
          `Cette équipe est déjà composée. Contact : ${data.captainPhone}`
        );
      } else {
        setMessage(data.error);
      }
      return;
    }

    resetForm();
    loadTeams();
  }

  async function deleteTeam(id: number) {
  const res = await fetch("/api/teams", {
    method: "DELETE",
    body: JSON.stringify({
      id,
      password: adminPassword,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  setSelectedTeam(null);
  setAdminPassword("");
  loadTeams();
}

  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/afficheCan.jpeg')" }}
    >
      <div className="min-h-screen bg-black/50 backdrop-blur-sm text-white p-8">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-black text-yellow-400 mb-2">
            Tournoi CAN ⚽
          </h1>

          <p className="text-zinc-300 mb-8">
            Inscris ton équipe et prépare la compétition.
          </p>

          <form
            onSubmit={createTeam}
            className="bg-white/10 border border-yellow-500/30 rounded-2xl p-6 shadow-xl mb-6"
          >
            <h2 className="text-2xl font-bold mb-4">Créer une équipe</h2>

            <input
              className="w-full rounded-lg px-4 py-3 mb-3 bg-black/40 border border-yellow-400/40 text-white placeholder:text-zinc-300 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/40"
              placeholder="Nom de l'équipe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full rounded-lg px-4 py-3 mb-3 bg-black/40 border border-yellow-400/40 text-white placeholder:text-zinc-300 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/40"
              placeholder="Numéro du chef d'équipe"
              value={captainPhone}
              onChange={(e) => setCaptainPhone(e.target.value)}
            />

            <p className="text-sm text-zinc-300 mb-3">
              Joueurs : {players.length}/15 — minimum 11 joueurs requis.
            </p>

            {players.map((p, i) => (
              <div key={i} className="grid grid-cols-3 gap-3 mb-3">
                <input
                  className="rounded-lg px-4 py-3 bg-black/40 border border-yellow-400/40 text-white placeholder:text-zinc-300 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/40"
                  placeholder="Nom du joueur"
                  value={p.name}
                  onChange={(e) => updatePlayer(i, "name", e.target.value)}
                />

                <input
                  type="number"
                  min="14"
                  max="15"
                  className="rounded-lg px-4 py-3 bg-black/40 border border-yellow-400/40 text-white placeholder:text-zinc-300 focus:border-yellow-300 focus:ring-2 focus:ring-yellow-400/40"
                  placeholder="Âge"
                  value={p.age}
                  onChange={(e) => updatePlayer(i, "age", e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => removePlayer(i)}
                  disabled={players.length <= 1}
                  className="bg-red-500/20 border border-red-500/40 text-red-200 rounded-lg cursor-pointer hover:bg-red-500/30 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Supprimer
                </button>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={addPlayer}
                disabled={players.length >= 15}
                className="bg-white/10 border border-white/20 px-5 py-3 rounded-lg cursor-pointer hover:bg-white/20 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Ajouter joueur
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-zinc-700 px-5 py-3 rounded-lg cursor-pointer hover:bg-zinc-600 transition duration-200"
              >
                Réinitialiser
              </button>

              <button
                type="submit"
                className="bg-yellow-400 text-black font-bold px-5 py-3 rounded-lg cursor-pointer hover:bg-yellow-300 transition duration-200"
              >
                Créer équipe
              </button>
            </div>
          </form>

          {message && (
            <p className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
              {message}
            </p>
          )}

          <h2 className="text-3xl font-bold mb-4">Équipes inscrites</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTeam(t)}
                className="text-left bg-white/10 border border-white/10 rounded-xl p-4 cursor-pointer hover:border-yellow-400/60 hover:bg-white/15 transition duration-200"
              >
                <strong className="text-yellow-400 text-xl">{t.name}</strong>
                <p className="text-zinc-300">{t.players.length} joueur(s)</p>
                <p className="text-sm text-zinc-400 mt-2">
                  Cliquer pour voir les joueurs
                </p>
              </button>
            ))}
          </div>

          {selectedTeam && (
            <div className="bg-black/50 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {selectedTeam.name}
                </h2>

                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg cursor-pointer hover:bg-white/20 transition duration-200"
                >
                  Fermer
                </button>
              </div>

              <p className="text-zinc-300 mb-4">
                Chef d'équipe : {selectedTeam.captainPhone}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {selectedTeam.players.map((player: any) => (
                  <div
                    key={player.id}
                    className="bg-white/10 border border-white/10 rounded-lg p-3"
                  >
                    <p className="font-bold">{player.name}</p>
                    <p className="text-zinc-300">{player.age} ans</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm text-zinc-300 mb-2">
                  Zone admin — seul l'administrateur peut supprimer une équipe.
                </p>

                <div className="flex flex-wrap gap-3">
                  <input
                    type="password"
                    placeholder="Mot de passe admin"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-black/40 border border-red-500/40 px-4 py-2 rounded-lg text-white placeholder:text-zinc-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/30"
                  />

                  <button
                    type="button"
                    onClick={() => deleteTeam(selectedTeam.id)}
                    className="bg-red-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-red-500 transition duration-200"
                  >
                    Supprimer l'équipe
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-8 text-center">
          <p className="text-red-400 font-bold text-lg">
            Problème lors de l'inscription ?
          </p>

          <p className="text-red-300 mt-2">
            Cliquez sur le numéro pour envoyer un message :
          </p>

          <a
            href="tel:0749071393"
            className="block mt-3 text-red-200 text-2xl font-black hover:text-red-300 transition cursor-pointer"
          >
            07 49 07 13 93
          </a>
        </div>
      </div>
    </main>
  );
}