(function (global) {
    var SHIELD_SIZE_EXTRA = 14;
    var SHIELD_ALPHA = 0.4;

    function isRectOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
        return ax < (bx + bw) &&
            (ax + aw) > bx &&
            ay < (by + bh) &&
            (ay + ah) > by;
    }

    function create() {
        var powerUpsBuffer = [];
        var powerUpTypes = {
            shield: 'shield',
            life: 'life',
            triple: 'triple'
        };
        var powerUpImages = {
            shield: new Image(),
            life: new Image(),
            triple: new Image()
        };

        function preloadImages() {
            powerUpImages.shield.src = 'images/power_up_escudo.png';
            powerUpImages.life.src = 'images/power_up_vida.png';
            powerUpImages.triple.src = 'images/power_up_disparo.png';
        }

        function getPowerUpImage(type) {
            if (type === powerUpTypes.shield) {
                return powerUpImages.shield;
            }
            if (type === powerUpTypes.life) {
                return powerUpImages.life;
            }
            return powerUpImages.triple;
        }

        function getTypeProbabilitiesByLife(playerLife) {
            var lifeChance;
            if (playerLife <= 1) {
                lifeChance = 70;
            } else if (playerLife === 2) {
                lifeChance = 45;
            } else {
                lifeChance = 20;
            }

            var remainingChance = 100 - lifeChance;
            var shieldChance = Math.floor(remainingChance / 2);
            var tripleChance = remainingChance - shieldChance;

            return {
                life: lifeChance,
                shield: shieldChance,
                triple: tripleChance
            };
        }

        function selectPowerUpType(playerLife, randomFn) {
            var chances = getTypeProbabilitiesByLife(playerLife);
            var roll = randomFn(100);
            if (roll < chances.life) {
                return powerUpTypes.life;
            }
            if (roll < (chances.life + chances.shield)) {
                return powerUpTypes.shield;
            }
            return powerUpTypes.triple;
        }

        function spawn(playerLife, canvasWidth, randomFn) {
            var spawnProbability = 35;
            if (randomFn(100) > spawnProbability) {
                return;
            }

            var type = selectPowerUpType(playerLife, randomFn);
            var width = 22;
            var height = 22;
            var x = 10 + randomFn(canvasWidth - 48);

            powerUpsBuffer.push({
                type: type,
                width: width,
                height: height,
                posX: x,
                posY: -height,
                speed: 3,
                hitboxPadding: 10,
                image: getPowerUpImage(type)
            });
        }

        function updateAndRender(options) {
            var i;
            var ctx = options.ctx;
            var player = options.player;
            var canvasHeight = options.canvasHeight;
            var playerWidth = options.playerWidth;
            var playerHeight = options.playerHeight;
            var onCollect = options.onCollect;

            for (i = 0; i < powerUpsBuffer.length; i++) {
                var powerUp = powerUpsBuffer[i];

                var hit = isRectOverlap(
                    powerUp.posX - powerUp.hitboxPadding,
                    powerUp.posY - powerUp.hitboxPadding,
                    powerUp.width + (powerUp.hitboxPadding * 2),
                    powerUp.height + (powerUp.hitboxPadding * 2),
                    player.posX,
                    player.posY,
                    playerWidth,
                    playerHeight
                );

                if (hit) {
                    onCollect(powerUp.type);
                    powerUpsBuffer.splice(i, 1);
                    i--;
                    continue;
                }

                powerUp.posY += powerUp.speed;
                if (powerUp.posY > canvasHeight) {
                    powerUpsBuffer.splice(i, 1);
                    i--;
                    continue;
                }

                ctx.drawImage(powerUp.image, powerUp.posX, powerUp.posY, powerUp.width, powerUp.height);
            }
        }

        function drawShieldOverlay(ctx, player, playerWidth, playerHeight, shieldImage) {
            if (!player.hasShield) {
                return;
            }
            var shieldWidth = playerWidth + SHIELD_SIZE_EXTRA;
            var shieldHeight = playerHeight + SHIELD_SIZE_EXTRA;
            var shieldX = player.posX - ((shieldWidth - playerWidth) / 2);
            var shieldY = player.posY - ((shieldHeight - playerHeight) / 2);
            ctx.globalAlpha = SHIELD_ALPHA;
            ctx.drawImage(shieldImage, shieldX, shieldY, shieldWidth, shieldHeight);
            ctx.globalAlpha = 1;
        }

        function clear() {
            powerUpsBuffer.splice(0, powerUpsBuffer.length);
        }

        return {
            preloadImages: preloadImages,
            spawn: spawn,
            updateAndRender: updateAndRender,
            drawShieldOverlay: drawShieldOverlay,
            clear: clear,
            types: powerUpTypes
        };
    }

    global.PowerUpSystem = {
        create: create
    };
})(window);
