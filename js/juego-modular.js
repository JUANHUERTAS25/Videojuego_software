// Punto de entrada para migracion modular.
// Este archivo no reemplaza aun al juego legacy; sirve como base para mover logica por etapas.
(function (global) {
    global.gameModular = {
        init: function () {
            // Aqui se conectaran core, entities, systems y scenes.
            // Mantener game.init() (legacy) activo hasta terminar la migracion.
            console.log('Base modular lista. Falta migrar logica desde videojuego-javascript.js');
        }
    };
})(window);
