# Arquitectura propuesta para el juego

## Problema actual
El archivo `videojuego-javascript.js` mezcla en un solo lugar:
- estado global
- render del canvas
- entrada por teclado
- entidades (jugador, enemigo, disparos)
- colisiones
- pantallas/escenas
- persistencia de puntuaciones

Esto dificulta mantener y extender el proyecto (por ejemplo, pantalla de inicio, jefe final con reglas distintas, menu de pausa, etc.).

## Estructura recomendada

```text
js/
  core/
    config.js
    state.js
    input.js
    loop.js
  entities/
    player.js
    enemy.js
    shot.js
  systems/
    collision.js
    scoreboard.js
  scenes/
    start-screen.js
    play-scene.js
    boss-scene.js
    game-over-scene.js
    victory-scene.js
  juego-modular.js
```

## Responsabilidad de cada archivo

- `core/config.js`: constantes de juego (velocidades, vidas iniciales, delays, etc.)
- `core/state.js`: estado global centralizado (jugador, enemigo actual, buffers de disparos, flags)
- `core/input.js`: mapa de teclas y listeners de teclado
- `core/loop.js`: ciclo principal (`update/draw/requestAnimationFrame`)

- `entities/player.js`: clase/fabrica del jugador
- `entities/enemy.js`: enemigo normal y jefe final
- `entities/shot.js`: disparos del jugador y enemigo

- `systems/collision.js`: deteccion y resolucion de colisiones
- `systems/scoreboard.js`: localStorage y top de puntuaciones

- `scenes/start-screen.js`: pantalla inicial y transicion a jugar
- `scenes/play-scene.js`: logica del juego normal
- `scenes/boss-scene.js`: comportamiento especial del jefe final
- `scenes/game-over-scene.js`: pantalla al perder
- `scenes/victory-scene.js`: pantalla al ganar

- `juego-modular.js`: punto de entrada que conecta todo.

## Orden sugerido de migracion (sin romper nada)

1. Mover `fillZero`, `getAllScores`, `getBestScoreKeys`, `showBestScores`, `removeNoBestScores` a `systems/scoreboard.js`.
2. Mover `Shot`, `PlayerShot`, `EvilShot` a `entities/shot.js`.
3. Mover `Enemy`, `Evil`, `FinalBoss` a `entities/enemy.js`.
4. Mover `Player` a `entities/player.js`.
5. Mover `checkCollisions` e `isEvilHittingPlayer` a `systems/collision.js`.
6. Separar escenas (`congratulations`, `youLoose`, jefe final) en archivos `scenes/*`.
7. Crear `juego-modular.js` y dejar `videojuego-javascript.js` como legacy temporal.

## Resultado esperado
- Codigo mantenible y escalable.
- Facil agregar nuevas pantallas y mecanicas.
- Menor riesgo al modificar una parte del juego.

## Como activar la estructura modular

1. En el HTML cambia el CSS principal por `css/main-modular.css`.
2. Agrega los scripts en este orden:

```html
<script src="js/core/config.js"></script>
<script src="js/core/state.js"></script>
<script src="js/core/input.js"></script>
<script src="js/core/loop.js"></script>

<script src="js/entities/shot.js"></script>
<script src="js/entities/player.js"></script>
<script src="js/entities/enemy.js"></script>

<script src="js/systems/collision.js"></script>
<script src="js/systems/scoreboard.js"></script>

<script src="js/scenes/start-screen.js"></script>
<script src="js/scenes/play-scene.js"></script>
<script src="js/scenes/boss-scene.js"></script>
<script src="js/scenes/game-over-scene.js"></script>
<script src="js/scenes/victory-scene.js"></script>

<script src="js/juego-modular.js"></script>
```

3. Mientras migras, manten `videojuego-javascript.js` como respaldo.
