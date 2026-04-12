window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var gameModular = (function (global) {
    var canvas,
        ctx,
        buffer,
        bufferctx,
        player,
        evil,
        bgMain,
        bgBoss,
        evilSpeed = 1,
        totalEvils = 7,
        maxPlayerLife = 3,
        shotSpeed = 5,
        playerSpeed = 5,
        evilCounter = 0,
        youLoose = false,
        congratulations = false,
        minHorizontalOffset = 100,
        maxHorizontalOffset = 400,
        nextEnemySpawnMinDelay = 700,
        nextEnemySpawnMaxDelay = 1400,
        evilShots = 5,
        evilLife = 3,
        finalBossShots = 30,
        finalBossLife = 12,
        totalBestScoresToShow = 5,
        nextPlayerShot = 0,
        playerShotDelay = 200,
        now = 0,
        playerShotsBuffer = [],
        evilShotsBuffer = [],
        evilShotImage,
        playerShotImage,
        playerKilledImage,
        playerNormalImage,
        playerShieldImage,
        gameMusic,
        gameMusicBaseVolume = 0.75,
        gameMusicFadeTimer = null,
        shotSound,
        powerUpSound,
        enemyExplosionSound,
        winGameSound,
        gameOverSound,
        scoreboardSystem,
        powerUpSystem,
        healthBarSystem,
        weaponHeatSystem,
        lastFrameTime = 0,
        levelMessage = '',
        levelMessageUntil = 0,
        levelOneCompleted = false,
        levelTwoShown = false,
        playedWinSound = false,
        playedGameOverSound = false,
        initialTotalEvils = totalEvils,
        keyPressed = {},
        keyMap = {
            left: 37,
            right: 39,
            fire: 32
        },
        evilImages = {
            animation: [],
            killed: new Image()
        },
        bossImages = {
            animation: [],
            killed: new Image()
        };

    function loop() {
        update();
        draw();
    }

    function preloadImages() {
        var i;
        for (i = 1; i <= 8; i++) {
            var evilImage = new Image();
            evilImage.src = 'images/malo' + i + '.png';
            evilImages.animation[i - 1] = evilImage;

            var bossImage = new Image();
            bossImage.src = 'images/jefe' + i + '.png';
            bossImages.animation[i - 1] = bossImage;
        }

        evilImages.killed.src = 'images/malo_muerto.png';
        bossImages.killed.src = 'images/jefe_muerto.png';

        bgMain = new Image();
        bgMain.src = 'images/fondovertical.png';
        bgBoss = new Image();
        bgBoss.src = 'images/fondovertical_jefe.png';

        playerShotImage = new Image();
        playerShotImage.src = 'images/disparo_bueno.png';
        evilShotImage = new Image();
        evilShotImage.src = 'images/disparo_malo.png';
        playerKilledImage = new Image();
        playerKilledImage.src = 'images/bueno_muerto.png';
        playerNormalImage = new Image();
        playerNormalImage.src = 'images/bueno.png';
        playerShieldImage = new Image();
        playerShieldImage.src = 'images/escudo_personaje.png';

        gameMusic = new Audio('music/musica_durante_juego.wav');
        gameMusic.preload = 'auto';
        gameMusic.loop = true;
        gameMusic.volume = gameMusicBaseVolume;

        shotSound = new Audio('music/sonido_disparo.wav');
        shotSound.preload = 'auto';
        powerUpSound = new Audio('music/sonido_power_up.wav');
        powerUpSound.preload = 'auto';
        enemyExplosionSound = new Audio('music/sonido_explosion_enemigos.wav');
        enemyExplosionSound.preload = 'auto';
        winGameSound = new Audio('music/sonido_win_game.wav');
        winGameSound.preload = 'auto';
        gameOverSound = new Audio('music/sonido_game_over.wav');
        gameOverSound.preload = 'auto';
    }

    function playGameMusic() {
        if (!gameMusic) {
            return;
        }
        if (youLoose || congratulations) {
            return;
        }
        if (!gameMusic.paused) {
            return;
        }
        if (gameMusicFadeTimer) {
            clearInterval(gameMusicFadeTimer);
            gameMusicFadeTimer = null;
        }
        gameMusic.volume = gameMusicBaseVolume;
        gameMusic.play().catch(function () {
            return null;
        });
    }

    function stopGameMusic(fadeOutMs) {
        if (!gameMusic) {
            return;
        }
        if (gameMusicFadeTimer) {
            clearInterval(gameMusicFadeTimer);
            gameMusicFadeTimer = null;
        }

        if (!fadeOutMs || fadeOutMs <= 0 || gameMusic.paused) {
            gameMusic.pause();
            gameMusic.currentTime = 0;
            gameMusic.volume = gameMusicBaseVolume;
            return;
        }

        var stepMs = 50;
        var steps = Math.max(1, Math.floor(fadeOutMs / stepMs));
        var volumeStep = gameMusic.volume / steps;

        gameMusicFadeTimer = setInterval(function () {
            gameMusic.volume = Math.max(0, gameMusic.volume - volumeStep);
            if (gameMusic.volume <= 0.01) {
                clearInterval(gameMusicFadeTimer);
                gameMusicFadeTimer = null;
                gameMusic.pause();
                gameMusic.currentTime = 0;
                gameMusic.volume = gameMusicBaseVolume;
            }
        }, stepMs);
    }

    function setLevelMessage(message, durationMs) {
        levelMessage = message;
        levelMessageUntil = new Date().getTime() + durationMs;
    }

    function drawLevelMessage() {
        if (new Date().getTime() > levelMessageUntil) {
            return;
        }
        bufferctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        bufferctx.font = 'bold 38px Arial';
        bufferctx.textAlign = 'center';
        bufferctx.fillText(levelMessage, canvas.width / 2, canvas.height / 2);
        bufferctx.textAlign = 'start';
    }

    function playShotSound() {
        if (!shotSound) {
            return;
        }
        var shotInstance = shotSound.cloneNode();
        shotInstance.volume = 0.2;
        shotInstance.playbackRate = 1.25;
        shotInstance.play().catch(function () {
            return null;
        });
        setTimeout(function () {
            shotInstance.pause();
            shotInstance.currentTime = 0;
        }, 120);
    }

    function playPowerUpSound() {
        if (!powerUpSound) {
            return;
        }
        var powerUpInstance = powerUpSound.cloneNode();
        powerUpInstance.volume = 0.5;
        powerUpInstance.play().catch(function () {
            return null;
        });
    }

    function playEnemyExplosionSound() {
        if (!enemyExplosionSound) {
            return;
        }
        var explosionInstance = enemyExplosionSound.cloneNode();
        explosionInstance.volume = 0.5;
        explosionInstance.play().catch(function () {
            return null;
        });
    }

    function playWinGameSound() {
        if (!winGameSound || playedWinSound) {
            return;
        }
        playedWinSound = true;
        if (gameOverSound) {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }
        stopGameMusic(350);
        winGameSound.currentTime = 0;
        winGameSound.volume = 0.7;
        winGameSound.play().catch(function () {
            return null;
        });
    }

    function playGameOverSound() {
        if (!gameOverSound || playedGameOverSound) {
            return;
        }
        playedGameOverSound = true;
        if (winGameSound) {
            winGameSound.pause();
            winGameSound.currentTime = 0;
        }
        stopGameMusic(350);
        gameOverSound.currentTime = 0;
        gameOverSound.volume = 0.7;
        gameOverSound.play().catch(function () {
            return null;
        });
    }

    function init() {
        scoreboardSystem = global.ScoreboardSystem.create({
            totalBestScoresToShow: totalBestScoresToShow
        });
        powerUpSystem = global.PowerUpSystem.create();
        healthBarSystem = global.HealthBarSystem.create();
        weaponHeatSystem = global.WeaponHeatSystem.create({
            maxHeat: 100,
            heatPerShot: 12,
            coolRateIdle: 26,
            coolRateHoldingFire: 10,
            overheatLockMs: 1400
        });
        preloadImages();
        powerUpSystem.preloadImages();
        scoreboardSystem.renderList('puntuaciones');
        playGameMusic();

        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');

        player = new Player(maxPlayerLife, 0);
        lastFrameTime = new Date().getTime();
        evilCounter = 1;
        createNewEvil();
        setLevelMessage('Nivel 1', 2200);

        addListener(document, 'keydown', keyDown);
        addListener(document, 'keyup', keyUp);

        function anim() {
            loop();
            requestAnimFrame(anim);
        }
        anim();
    }

    function getRandomNumber(range) {
        return Math.floor(Math.random() * range);
    }

    function getSafePlayerWidth() {
        return player.width || 66;
    }

    function getSafePlayerHeight() {
        return player.height || 66;
    }

    function Player(life, score) {
        var settings = {
            marginBottom: 10,
            defaultHeight: 66
        };

        player = new Image();
        player.src = playerNormalImage.src;
        player.posX = (canvas.width / 2) - 33;
        player.posY = canvas.height - (player.height === 0 ? settings.defaultHeight : player.height) - settings.marginBottom;
        player.life = life;
        player.score = score;
        player.dead = false;
        player.speed = playerSpeed;
        player.hasShield = false;
        player.shieldCharges = 0;
        player.damageCooldownUntil = 0;
        player.tripleShotUntil = 0;

        function createSingleShot() {
            var shot = new PlayerShot(player.posX + (getSafePlayerWidth() / 2) - 5, player.posY);
            shot.add();
        }

        function createTripleShot() {
            var centerX = player.posX + (getSafePlayerWidth() / 2) - 5;
            var leftShot = new PlayerShot(centerX - 16, player.posY);
            var centerShot = new PlayerShot(centerX, player.posY);
            var rightShot = new PlayerShot(centerX + 16, player.posY);
            leftShot.add();
            centerShot.add();
            rightShot.add();
        }

        function shoot() {
            var nowMs = new Date().getTime();
            if (!weaponHeatSystem.canShoot(nowMs)) {
                return;
            }

            if (nextPlayerShot < now || now === 0) {
                if (player.hasTripleShot()) {
                    createTripleShot();
                } else {
                    createSingleShot();
                }
                playShotSound();
                weaponHeatSystem.onShot(nowMs, player.hasTripleShot() ? 1.8 : 1);
                now += playerShotDelay;
                nextPlayerShot = now + playerShotDelay;
            } else {
                now = new Date().getTime();
            }
        }

        player.hasTripleShot = function () {
            return new Date().getTime() <= this.tripleShotUntil;
        };

        player.activateTripleShot = function () {
            this.tripleShotUntil = new Date().getTime() + 5000;
        };

        player.activateShield = function () {
            this.shieldCharges += 1;
            this.hasShield = true;
        };

        player.removeShield = function () {
            if (this.shieldCharges > 0) {
                this.shieldCharges -= 1;
            }
            this.hasShield = this.shieldCharges > 0;
        };

        player.canReceiveDamage = function () {
            return new Date().getTime() >= this.damageCooldownUntil;
        };

        player.doAnything = function () {
            if (player.dead) {
                return;
            }
            if (keyPressed.left && player.posX > 5) {
                player.posX -= player.speed;
            }
            if (keyPressed.right && player.posX < (canvas.width - getSafePlayerWidth() - 5)) {
                player.posX += player.speed;
            }
            if (keyPressed.fire) {
                shoot();
            }
        };

        player.killPlayer = function () {
            if (!this.canReceiveDamage()) {
                return;
            }

            if (this.hasShield) {
                this.removeShield();
                this.damageCooldownUntil = new Date().getTime() + 700;
                return;
            }

            if (this.life > 1) {
                this.dead = true;
                evilShotsBuffer.splice(0, evilShotsBuffer.length);
                playerShotsBuffer.splice(0, playerShotsBuffer.length);
                powerUpSystem.clear();
                this.src = playerKilledImage.src;
                createNewEvil();

                setTimeout(function () {
                    player = new Player(player.life - 1, player.score);
                }, 500);
            } else {
                saveFinalScore();
                youLoose = true;
            }
        };

        return player;
    }

    function Shot(x, y, array, img) {
        this.posX = x;
        this.posY = y;
        this.image = img;
        this.speed = shotSpeed;
        this.identifier = 0;
        this.add = function () {
            array.push(this);
        };
        this.deleteShot = function (identifier) {
            array.splice(identifier, 1);
        };
    }

    function PlayerShot(x, y) {
        Shot.call(this, x, y, playerShotsBuffer, playerShotImage);
        this.isHittingEvil = function () {
            return !evil.dead && global.CollisionSystem.isPointInsideRect(this.posX, this.posY, {
                posX: evil.posX,
                posY: evil.posY,
                width: evil.image.width,
                height: evil.image.height
            });
        };
    }
    PlayerShot.prototype = Object.create(Shot.prototype);
    PlayerShot.prototype.constructor = PlayerShot;

    function EvilShot(x, y) {
        Shot.call(this, x, y, evilShotsBuffer, evilShotImage);
        this.isHittingPlayer = function () {
            return global.CollisionSystem.isPointInsideRect(this.posX, this.posY, {
                posX: player.posX,
                posY: player.posY,
                width: getSafePlayerWidth(),
                height: getSafePlayerHeight()
            });
        };
    }
    EvilShot.prototype = Object.create(Shot.prototype);
    EvilShot.prototype.constructor = EvilShot;

    function createPowerUp() {
        powerUpSystem.spawn(player.life, canvas.width, getRandomNumber);
    }

    function drawPlayerWithEffects() {
        var playerWidth = getSafePlayerWidth();
        var playerHeight = getSafePlayerHeight();
        bufferctx.drawImage(player, player.posX, player.posY);

        if (player.hasShield) {
            powerUpSystem.drawShieldOverlay(bufferctx, player, playerWidth, playerHeight, playerShieldImage);
        }
    }

    function applyPowerUp(type) {
        playPowerUpSound();
        if (type === powerUpSystem.types.shield) {
            player.activateShield();
            return;
        }
        if (type === powerUpSystem.types.life) {
            if (player.life < maxPlayerLife) {
                player.life += 1;
            }
            return;
        }
        player.activateTripleShot();
    }

    function updatePowerUps() {
        powerUpSystem.updateAndRender({
            ctx: bufferctx,
            player: player,
            canvasHeight: canvas.height,
            playerWidth: getSafePlayerWidth(),
            playerHeight: getSafePlayerHeight(),
            onCollect: applyPowerUp
        });
    }

    function Enemy(life, shots, enemyImages) {
        var self = this;
        this.image = enemyImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.posX = getRandomNumber(canvas.width - this.image.width);
        this.posY = -50;
        this.life = life || evilLife;
        this.maxLife = this.life;
        this.speed = evilSpeed;
        this.shots = shots || evilShots;
        this.attackShotSpeed = shotSpeed;
        this.minShootDelay = 1000;
        this.maxShootDelay = 3000;
        this.dead = false;

        var desplazamientoHorizontal = minHorizontalOffset + getRandomNumber(maxHorizontalOffset - minHorizontalOffset);
        this.minX = getRandomNumber(canvas.width - desplazamientoHorizontal);
        this.maxX = this.minX + desplazamientoHorizontal - 40;
        this.direction = 'D';

        this.kill = function () {
            this.dead = true;
            healthBarSystem.clearEnemy(this);
            createPowerUp();
            totalEvils--;
            this.image = enemyImages.killed;
            verifyToCreateNewEvil();
        };

        this.update = function () {
            this.posY += this.goDownSpeed;
            if (this.direction === 'D') {
                if (this.posX <= this.maxX) {
                    this.posX += this.speed;
                } else {
                    this.direction = 'I';
                    this.posX -= this.speed;
                }
            } else {
                if (this.posX >= this.minX) {
                    this.posX -= this.speed;
                } else {
                    this.direction = 'D';
                    this.posX += this.speed;
                }
            }

            this.animation++;
            if (this.animation > 5) {
                this.animation = 0;
                this.imageNumber++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = enemyImages.animation[this.imageNumber - 1];
            }
        };

        this.isOutOfScreen = function () {
            return this.posY > (canvas.height + 15);
        };

        function shootEnemy() {
            if (self.shots > 0 && !self.dead) {
                var shot = new EvilShot(self.posX + (self.image.width / 2) - 5, self.posY + self.image.height);
                shot.speed = self.attackShotSpeed;
                shot.add();
                self.shots--;
                var shootWindow = Math.max(1, self.maxShootDelay - self.minShootDelay);
                setTimeout(function () {
                    shootEnemy();
                }, self.minShootDelay + getRandomNumber(shootWindow));
            }
        }

        setTimeout(function () {
            shootEnemy();
        }, self.minShootDelay + getRandomNumber(Math.max(1, self.maxShootDelay)));
    }

    function Evil(life, shots) {
        Enemy.call(this, life, shots, evilImages);
        var batsKilled = initialTotalEvils - totalEvils;
        this.goDownSpeed = evilSpeed + (batsKilled * 0.22);
        this.speed = evilSpeed + (batsKilled * 0.12);
        this.attackShotSpeed = shotSpeed + (batsKilled * 0.45);
        this.minShootDelay = Math.max(350, 1000 - (batsKilled * 90));
        this.maxShootDelay = Math.max(900, 3000 - (batsKilled * 180));
        this.pointsToKill = 5 + evilCounter;
    }
    Evil.prototype = Object.create(Enemy.prototype);
    Evil.prototype.constructor = Evil;

    function FinalBoss() {
        Enemy.call(this, finalBossLife, finalBossShots, bossImages);
        this.goDownSpeed = evilSpeed / 2;
        this.pointsToKill = 20;
    }
    FinalBoss.prototype = Object.create(Enemy.prototype);
    FinalBoss.prototype.constructor = FinalBoss;

    function verifyToCreateNewEvil() {
        if (totalEvils > 0) {
            if (totalEvils === 1 && !levelOneCompleted) {
                levelOneCompleted = true;
                setLevelMessage('Nivel 1 completado', 2400);
                powerUpSystem.spawnGuaranteed(canvas.width, getRandomNumber);
            }
            var spawnDelayRange = Math.max(1, nextEnemySpawnMaxDelay - nextEnemySpawnMinDelay);
            setTimeout(function () {
                createNewEvil();
                evilCounter++;
            }, nextEnemySpawnMinDelay + getRandomNumber(spawnDelayRange));
        } else {
            setTimeout(function () {
                saveFinalScore();
                congratulations = true;
            }, 2000);
        }
    }

    function createNewEvil() {
        // Evita que enemigos anteriores sigan disparando por temporizadores pendientes.
        if (evil && !evil.dead) {
            evil.dead = true;
        }
        // Limpia disparos huérfanos cuando cambia el enemigo activo.
        evilShotsBuffer.splice(0, evilShotsBuffer.length);

        if (totalEvils !== 1) {
            var lifeScale = Math.floor((evilCounter - 1) / 2);
            evil = new Evil(evilLife + lifeScale, evilShots + evilCounter - 1);
        } else {
            evil = new FinalBoss();
            if (!levelTwoShown) {
                levelTwoShown = true;
                setLevelMessage('Nivel 2', 2200);
            }
        }
    }

    function isEvilHittingPlayer() {
        return global.CollisionSystem.isEnemyHittingPlayer({
            posX: evil.posX,
            posY: evil.posY,
            width: evil.image.width,
            height: evil.image.height
        }, {
            posX: player.posX,
            posY: player.posY,
            width: getSafePlayerWidth(),
            height: getSafePlayerHeight()
        });
    }

    function checkCollisions(shot) {
        if (shot.isHittingEvil()) {
            if (evil.life > 1) {
                evil.life--;
            } else {
                playEnemyExplosionSound();
                evil.kill();
                player.score += evil.pointsToKill;
            }
            shot.deleteShot(parseInt(shot.identifier, 10));
            return false;
        }
        return true;
    }

    function addListener(element, type, expression, bubbling) {
        bubbling = bubbling || false;
        if (window.addEventListener) {
            element.addEventListener(type, expression, bubbling);
        } else if (window.attachEvent) {
            element.attachEvent('on' + type, expression);
        }
    }

    function keyDown(e) {
        if (youLoose || congratulations) {
            return;
        }
        playGameMusic();
        var key = (window.event ? e.keyCode : e.which);
        var inkey;
        for (inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = true;
            }
        }
    }

    function keyUp(e) {
        var key = (window.event ? e.keyCode : e.which);
        var inkey;
        for (inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    function draw() {
        ctx.drawImage(buffer, 0, 0);
    }

    function drawBackground() {
        var background = (evil instanceof FinalBoss) ? bgBoss : bgMain;
        bufferctx.drawImage(background, 0, 0);
    }

    function showGameOver() {
        bufferctx.fillStyle = 'rgb(255,0,0)';
        bufferctx.font = 'bold 35px Arial';
        bufferctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
    }

    function showCongratulations() {
        bufferctx.fillStyle = 'rgb(204,50,153)';
        bufferctx.font = 'bold 22px Arial';
        bufferctx.fillText('Enhorabuena, te has pasado el juego!', canvas.width / 2 - 200, canvas.height / 2 - 30);
        bufferctx.fillText('PUNTOS: ' + player.score, canvas.width / 2 - 200, canvas.height / 2);
        bufferctx.fillText('VIDAS: ' + player.life + ' x 5', canvas.width / 2 - 200, canvas.height / 2 + 30);
        bufferctx.fillText('PUNTUACION TOTAL: ' + getTotalScore(), canvas.width / 2 - 200, canvas.height / 2 + 60);
    }

    function showLifeAndScore() {
        bufferctx.fillStyle = 'rgb(59,59,59)';
        bufferctx.font = 'bold 16px Arial';
        bufferctx.fillText('Puntos: ' + player.score, canvas.width - 120, 20);
        bufferctx.fillText('Vidas: ' + player.life, canvas.width - 120, 40);
        if (player.hasShield) {
            bufferctx.fillText('Escudo: x' + player.shieldCharges, canvas.width - 120, 60);
        }
        if (player.hasTripleShot()) {
            bufferctx.fillText('Triple: SI', canvas.width - 120, 80);
        }
        weaponHeatSystem.drawHud(bufferctx, new Date().getTime(), canvas.width - 190, 95);
    }

    function updatePlayerShot(playerShot, id) {
        if (!playerShot) {
            return;
        }
        playerShot.identifier = id;
        if (checkCollisions(playerShot)) {
            if (playerShot.posY > 0) {
                playerShot.posY -= playerShot.speed;
                bufferctx.drawImage(playerShot.image, playerShot.posX, playerShot.posY);
            } else {
                playerShot.deleteShot(parseInt(playerShot.identifier, 10));
            }
        }
    }

    function updateEvilShot(evilShot, id) {
        if (!evilShot) {
            return;
        }
        evilShot.identifier = id;
        if (!evilShot.isHittingPlayer()) {
            if (evilShot.posY <= canvas.height) {
                evilShot.posY += evilShot.speed;
                bufferctx.drawImage(evilShot.image, evilShot.posX, evilShot.posY);
            } else {
                evilShot.deleteShot(parseInt(evilShot.identifier, 10));
            }
        } else {
            evilShot.deleteShot(parseInt(evilShot.identifier, 10));
            player.killPlayer();
        }
    }

    function updateEvil() {
        if (!evil.dead) {
            evil.update();
            if (evil.isOutOfScreen()) {
                evil.kill();
            }
        }
    }

    function update() {
        var currentTime = new Date().getTime();
        var deltaSec = (currentTime - lastFrameTime) / 1000;
        lastFrameTime = currentTime;

        drawBackground();

        weaponHeatSystem.update({
            isFiring: !!keyPressed.fire,
            nowMs: currentTime,
            deltaSec: deltaSec
        });

        if (congratulations) {
            playWinGameSound();
            showCongratulations();
            return;
        }

        if (youLoose) {
            playGameOverSound();
            showGameOver();
            return;
        }

        drawPlayerWithEffects();
        bufferctx.drawImage(evil.image, evil.posX, evil.posY);
        healthBarSystem.drawEnemyBar(bufferctx, evil, {
            yOffset: 10,
            height: 7
        });
        drawLevelMessage();

        updateEvil();
        updatePowerUps();

        var j;
        for (j = 0; j < playerShotsBuffer.length; j++) {
            updatePlayerShot(playerShotsBuffer[j], j);
        }

        if (isEvilHittingPlayer()) {
            player.killPlayer();
        } else {
            var i;
            for (i = 0; i < evilShotsBuffer.length; i++) {
                updateEvilShot(evilShotsBuffer[i], i);
            }
        }

        showLifeAndScore();
        player.doAnything();
    }

    function getTotalScore() {
        return player.score + player.life * 5;
    }

    function saveFinalScore() {
        scoreboardSystem.saveScore(getTotalScore(), 'puntuaciones');
    }

    return {
        init: init
    };
})(window);
