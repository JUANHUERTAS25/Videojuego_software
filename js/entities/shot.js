// Entidades de disparos (esqueleto de migracion)
(function (global) {
    global.ShotEntities = {
        createShotBase: function (x, y, image, speed) {
            return {
                posX: x,
                posY: y,
                image: image,
                speed: speed,
                identifier: 0
            };
        }
    };
})(window);
