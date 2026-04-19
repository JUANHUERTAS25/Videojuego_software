# Backend Leaderboard (Django + SQLite)

## Estructura
- Proyecto Django: `backend_project`
- App: `leaderboard`
- Base de datos: SQLite (`db.sqlite3`)

## Modelo
- `Score`
  - `nickname` (unique)
  - `score` (int)
  - `player_id` (string)
  - `date` (auto_now)

## Endpoints
- `POST /api/scores/save/`
  - Payload JSON:
    - `nickname`: string
    - `score`: int
    - `player_id`: string (UUID o ID persistente del navegador)
- `GET /api/scores/top5/`
  - Retorna `top5` en JSON ordenado por puntaje descendente.

## Reglas aplicadas en backend
1. Si nickname existe y `player_id` coincide:
   - Actualiza solo si el nuevo score es mayor.
2. Si nickname existe y `player_id` no coincide:
   - Retorna 403 (nombre en uso por otro jugador).
3. Si nickname no existe:
   - Crea registro con nickname + player_id + score.

## Ejecucion
1. Crear entorno e instalar dependencias:
   - `pip install -r requirements.txt`
2. Migrar base de datos:
   - `python manage.py migrate`
3. Ejecutar servidor:
   - `python manage.py runserver`

## Frontend
Hay un ejemplo listo en `frontend_integration_example.js` con:
- Generacion/persistencia de `player_id` en `localStorage`
- `fetch` POST para guardar puntaje
- `fetch` GET para consultar top 5
