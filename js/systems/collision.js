// Sistema de colisiones (esqueleto de migracion)
(function (global) {
    global.CollisionSystem = {
        isRectOverlap: function (a, b) {
            return (
                a.posX < b.posX + b.width &&
                a.posX + a.width > b.posX &&
                a.posY < b.posY + b.height &&
                a.posY + a.height > b.posY
            );
        }
    };
})(window);
