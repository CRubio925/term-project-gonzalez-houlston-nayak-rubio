import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { broadcast } from "../types/sse.js";

const router = Router();

interface Game {
  id: number;
  hostId: number;
  hostEmail: string;
  players: number;
  playerIds: number[];
  status: "waiting" | "started";
}

const games: Game[] = [];
let nextGameId = 1;

router.get("/", requireAuth, (_req, res) => {
  res.json(games);
});

router.post("/create", requireAuth, (req, res) => {
  const user = req.session.user;

  if (!user) {
    res.redirect("/auth/login");
    return;
  }

  const game: Game = {
    id: nextGameId++,
    hostId: user.id,
    hostEmail: user.email,
    players: 1,
    playerIds: [user.id],
    status: "waiting",
  };

  games.unshift(game);

  broadcast({
    type: "GAME_CREATED",
    games,
  });

  res.redirect("/auth/lobby");
});

router.post("/:id/join", requireAuth, (req, res) => {
  const user = req.session.user;

  if (!user) {
    res.redirect("/auth/login");
    return;
  }

  const gameId = Number(req.params.id);
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    res.status(404).send("Game not found");
    return;
  }

  if (game.playerIds.includes(user.id)) {
    res.redirect("/auth/lobby");
    return;
  }

  if (game.players >= 2) {
    res.status(400).send("Game is full");
    return;
  }

  game.playerIds.push(user.id);
  game.players = game.playerIds.length;

  if (game.players === 2) {
    game.status = "started";
  }

  broadcast({
    type: "GAME_JOINED",
    games,
  });

  res.redirect(`/games/${String(game.id)}`);
});

router.get("/:id", requireAuth, (req, res) => {
  const gameId = Number(req.params.id);
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    res.status(404).send("Game not found");
    return;
  }

  res.render("game", {
    user: req.session.user,
    game,
  });
});

export default router;
