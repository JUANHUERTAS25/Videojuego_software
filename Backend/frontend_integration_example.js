// UUID sencillo + persistencia en localStorage + envio de score.
const PLAYER_ID_KEY = 'jellyshoot_player_id';

function getOrCreatePlayerId() {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    // Usa crypto.randomUUID si existe; fallback simple si no.
    playerId = (crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'pid-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

async function saveScoreToBackend(nickname, score) {
  const payload = {
    nickname,
    score,
    player_id: getOrCreatePlayerId(),
  };

  const response = await fetch('http://127.0.0.1:8000/api/scores/save/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al guardar puntaje');
  }
  return data;
}

async function fetchTop5() {
  const response = await fetch('http://127.0.0.1:8000/api/scores/top5/');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al consultar top 5');
  }
  return data.top5;
}

// Ejemplo de uso al terminar partida:
// await saveScoreToBackend(playerNickname, finalScore);
// const top = await fetchTop5();
// renderLeaderboard(top);
