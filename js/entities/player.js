// Entidad jugador (esqueleto de migracion)
(function (global) {
    global.PlayerEntity = {
        create: function (life, score) {
            return {
                life: life,
                score: score,
                dead: false,
                posX: 0,
                posY: 0,
                speed: 0
            };
        }
    };
})(window);
