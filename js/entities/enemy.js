// Entidades enemigo normal y jefe (esqueleto de migracion)
(function (global) {
    global.EnemyEntities = {
        createEnemy: function () {
            return {
                life: 1,
                shots: 0,
                dead: false,
                posX: 0,
                posY: -50,
                pointsToKill: 0
            };
        },

        createBoss: function () {
            return {
                life: 1,
                shots: 0,
                dead: false,
                posX: 0,
                posY: -50,
                pointsToKill: 20
            };
        }
    };
})(window);
