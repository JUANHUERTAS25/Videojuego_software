// nos marca los pulsos del juego
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame        ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        window.oRequestAnimationFrame       ||
        window.msRequestAnimationFrame      ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
arrayRemove = function (array, from) {
    var rest = array.slice((from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

var game = (function () {

    // Variables globales a la aplicacion
    var canvas,
        ctx,
        buffer,
        bufferctx,
        player,
        evil,
        playerShot,
        bgMain,
        bgBoss,
        evilSpeed = 1,
        totalEvils = 7,
        playerLife = 3,
        shotSpeed = 5,
        playerSpeed = 5,
        evilCounter = 0,
        youLoose = false,
        congratulations = false,
        minHorizontalOffset = 100,
        maxHorizontalOffset = 400,
        evilShots = 5,   // disparos que tiene el malo al principio
        evilLife = 3,    // vidas que tiene el malo al principio (se van incrementando)
        finalBossShots = 30,
        finalBossLife = 12,
        totalBestScoresToShow = 5, // las mejores puntuaciones que se mostraran
        playerShotsBuffer = [],
        evilShotsBuffer = [],
        powerUpsBuffer = [],
        evilShotImage,
        playerShotImage,
        playerKilledImage,
        playerNormalImage,
        playerShieldImage,
        powerUpImages = {
            shield : new Image(),
            life : new Image(),
            triple : new Image()
        },
        evilImages = {
            animation : [],
            killed : new Image()
        },
        bossImages = {
            animation : [],
            killed : new Image()
        },
        keyPressed = {},
        keyMap = {
            left: 37,
            right: 39,
            fire: 32     // tecla espacio
        },
        nextPlayerShot = 0,
        playerShotDelay = 250,
        now = 0;

    var powerUpTypes = {
        shield: 'shield',
        life: 'life',
        triple: 'triple'
    };

    function loop() {
        update();
        draw();
    }

    function preloadImages () {
        for (var i = 1; i <= 8; i++) {
            var evilImage = new Image();
            evilImage.src = 'images/malo' + i + '.png';
            evilImages.animation[i-1] = evilImage;
            var bossImage = new Image();
            bossImage.src = 'images/jefe' + i + '.png';
            bossImages.animation[i-1] = bossImage;
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
        powerUpImages.shield.src = 'images/power_up_escudo.png';
        powerUpImages.life.src = 'images/power_up_vida.png';
        powerUpImages.triple.src = 'images/power_up_disparo.png';

    }

    function init() {

        preloadImages();

        showBestScores();

        canvas = document.getElementById('canvas');
        ctx = canvas.getContext("2d");

        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');

        player = new Player(playerLife, 0);
        evilCounter = 1;
        createNewEvil();

        showLifeAndScore();

        addListener(document, 'keydown', keyDown);
        addListener(document, 'keyup', keyUp);

        function anim () {
            loop();
            requestAnimFrame(anim);
        }
        anim();
    }

    function showLifeAndScore () {
        bufferctx.fillStyle="rgb(59,59,59)";
        bufferctx.font="bold 16px Arial";
        bufferctx.fillText("Puntos: " + player.score, canvas.width - 100, 20);
        bufferctx.fillText("Vidas: " + player.life, canvas.width - 100,40);
        if (player.hasShield) {
            bufferctx.fillText("Escudo: SI", canvas.width - 100,60);
        }
        if (player.hasTripleShot()) {
            bufferctx.fillText("Triple: SI", canvas.width - 100,80);
        }
    }

    function getRandomNumber(range) {
        return Math.floor(Math.random() * range);
    }

    function Player(life, score) {
        var settings = {
            marginBottom : 10,
            defaultHeight : 66
        };
        player = new Image();
        player.src = 'images/bueno.png';
        player.posX = (canvas.width / 2) - (player.width / 2);
        player.posY = canvas.height - (player.height == 0 ? settings.defaultHeight : player.height) - settings.marginBottom;
        player.life = life;
        player.score = score;
        player.dead = false;
        player.speed = playerSpeed;
        player.hasShield = false;
        player.tripleShotUntil = 0;

        var shoot = function () {
            if (nextPlayerShot < now || now == 0) {
                if (player.hasTripleShot()) {
                    createTripleShot();
                } else {
                    playerShot = new PlayerShot(player.posX + (player.width / 2) - 5 , player.posY);
                    playerShot.add();
                }
                now += playerShotDelay;
                nextPlayerShot = now + playerShotDelay;
            } else {
                now = new Date().getTime();
            }
        };

        function createTripleShot() {
            var centerX = player.posX + (player.width / 2) - 5;
            var leftShot = new PlayerShot(centerX - 16, player.posY);
            var centerShot = new PlayerShot(centerX, player.posY);
            var rightShot = new PlayerShot(centerX + 16, player.posY);
            leftShot.add();
            centerShot.add();
            rightShot.add();
        }

        player.doAnything = function() {
            if (player.dead)
                return;
            if (keyPressed.left && player.posX > 5)
                player.posX -= player.speed;
            if (keyPressed.right && player.posX < (canvas.width - player.width - 5))
                player.posX += player.speed;
            if (keyPressed.fire)
                shoot();
        };

        player.hasTripleShot = function() {
            return new Date().getTime() <= this.tripleShotUntil;
        };

        player.activateShield = function() {
            if (this.hasShield) {
                return;
            }
            this.hasShield = true;
            this.src = playerShieldImage.src;
        };

        player.removeShield = function() {
            this.hasShield = false;
            this.src = playerNormalImage.src;
        };

        player.activateTripleShot = function() {
            this.tripleShotUntil = new Date().getTime() + 5000;
        };

        player.killPlayer = function() {
            if (this.hasShield) {
                this.removeShield();
                return;
            }
            if (this.life > 0) {
                this.dead = true;
                evilShotsBuffer.splice(0, evilShotsBuffer.length);
                playerShotsBuffer.splice(0, playerShotsBuffer.length);
                powerUpsBuffer.splice(0, powerUpsBuffer.length);
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

    /******************************* DISPAROS *******************************/
    function Shot( x, y, array, img) {
        this.posX = x;
        this.posY = y;
        this.image = img;
        this.speed = shotSpeed;
        this.identifier = 0;
        this.add = function () {
            array.push(this);
        };
        this.deleteShot = function (idendificador) {
            arrayRemove(array, idendificador);
        };
    }

    function PlayerShot (x, y) {
        Object.getPrototypeOf(PlayerShot.prototype).constructor.call(this, x, y, playerShotsBuffer, playerShotImage);
        this.isHittingEvil = function() {
            return (!evil.dead && this.posX >= evil.posX && this.posX <= (evil.posX + evil.image.width) &&
                this.posY >= evil.posY && this.posY <= (evil.posY + evil.image.height));
        };
    }

    PlayerShot.prototype = Object.create(Shot.prototype);
    PlayerShot.prototype.constructor = PlayerShot;

    function EvilShot (x, y) {
        Object.getPrototypeOf(EvilShot.prototype).constructor.call(this, x, y, evilShotsBuffer, evilShotImage);
        this.isHittingPlayer = function() {
            return (this.posX >= player.posX && this.posX <= (player.posX + player.width)
                && this.posY >= player.posY && this.posY <= (player.posY + player.height));
        };
    }

    EvilShot.prototype = Object.create(Shot.prototype);
    EvilShot.prototype.constructor = EvilShot;

    function PowerUp(type, x, y) {
        this.type = type;
        this.posX = x;
        this.posY = y;
        this.speed = 2;
        this.image = getPowerUpImage(type);
        this.add = function () {
            powerUpsBuffer.push(this);
        };
        this.deletePowerUp = function (identifier) {
            arrayRemove(powerUpsBuffer, identifier);
        };
        this.isHittingPlayer = function () {
            return (this.posX >= player.posX && this.posX <= (player.posX + player.width)
                && this.posY >= player.posY && this.posY <= (player.posY + player.height));
        };
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

    function createPowerUp(x, y) {
        // 35% de probabilidad de generar un power-up al derrotar un enemigo.
        if (getRandomNumber(100) > 34) {
            return;
        }
        var availableTypes = [powerUpTypes.shield, powerUpTypes.life, powerUpTypes.triple];
        var selectedType = availableTypes[getRandomNumber(availableTypes.length)];
        var powerUp = new PowerUp(selectedType, x, y);
        powerUp.add();
    }

    function applyPowerUp(type) {
        if (type === powerUpTypes.shield) {
            player.activateShield();
            return;
        }
        if (type === powerUpTypes.life) {
            if (player.life < playerLife) {
                player.life++;
            }
            return;
        }
        player.activateTripleShot();
    }

    function updatePowerUps() {
        for (var i = 0; i < powerUpsBuffer.length; i++) {
            var powerUp = powerUpsBuffer[i];
            if (!powerUp) {
                continue;
            }
            if (powerUp.isHittingPlayer()) {
                applyPowerUp(powerUp.type);
                powerUp.deletePowerUp(i);
                continue;
            }
            powerUp.posY += powerUp.speed;
            if (powerUp.posY > canvas.height) {
                powerUp.deletePowerUp(i);
            } else {
                bufferctx.drawImage(powerUp.image, powerUp.posX, powerUp.posY);
            }
        }
    }
    /******************************* FIN DISPAROS ********************************/


    /******************************* ENEMIGOS *******************************/
    function Enemy(life, shots, enemyImages) {
        this.image = enemyImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.posX = getRandomNumber(canvas.width - this.image.width);
        this.posY = -50;
        this.life = life ? life : evilLife;
        this.speed = evilSpeed;
        this.shots = shots ? shots : evilShots;
        this.dead = false;

        var desplazamientoHorizontal = minHorizontalOffset +
            getRandomNumber(maxHorizontalOffset - minHorizontalOffset);
        this.minX = getRandomNumber(canvas.width - desplazamientoHorizontal);
        this.maxX = this.minX + desplazamientoHorizontal - 40;
        this.direction = 'D';


        this.kill = function() {
            this.dead = true;
            createPowerUp(this.posX + (this.image.width / 2), this.posY + (this.image.height / 2));
            totalEvils --;
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
                this.imageNumber ++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = enemyImages.animation[this.imageNumber - 1];
            }
        };

        this.isOutOfScreen = function() {
            return this.posY > (canvas.height + 15);
        };

        function shoot() {
            if (evil.shots > 0 && !evil.dead) {
                var disparo = new EvilShot(evil.posX + (evil.image.width / 2) - 5 , evil.posY + evil.image.height);
                disparo.add();
                evil.shots --;
                setTimeout(function() {
                    shoot();
                }, getRandomNumber(3000));
            }
        }
        setTimeout(function() {
            shoot();
        }, 1000 + getRandomNumber(2500));

        this.toString = function () {
            return 'Enemigo con vidas:' + this.life + 'shotss: ' + this.shots + ' puntos por matar: ' + this.pointsToKill;
        }

    }

    function Evil (vidas, disparos) {
        Object.getPrototypeOf(Evil.prototype).constructor.call(this, vidas, disparos, evilImages);
        this.goDownSpeed = evilSpeed;
        this.pointsToKill = 5 + evilCounter;
    }

    Evil.prototype = Object.create(Enemy.prototype);
    Evil.prototype.constructor = Evil;

    function FinalBoss () {
        Object.getPrototypeOf(FinalBoss.prototype).constructor.call(this, finalBossLife, finalBossShots, bossImages);
        this.goDownSpeed = evilSpeed/2;
        this.pointsToKill = 20;
    }

    FinalBoss.prototype = Object.create(Enemy.prototype);
    FinalBoss.prototype.constructor = FinalBoss;
    /******************************* FIN ENEMIGOS *******************************/

    function verifyToCreateNewEvil() {
        if (totalEvils > 0) {
            setTimeout(function() {
                createNewEvil();
                evilCounter ++;
            }, getRandomNumber(3000));

        } else {
            setTimeout(function() {
                saveFinalScore();
                congratulations = true;
            }, 2000);

        }
    }

    function createNewEvil() {
        if (totalEvils != 1) {
            evil = new Evil(evilLife + evilCounter - 1, evilShots + evilCounter - 1);
        } else {
            evil = new FinalBoss();
        }
    }

    function isEvilHittingPlayer() {
        return ( ( (evil.posY + evil.image.height) > player.posY && (player.posY + player.height) >= evil.posY ) &&
            ((player.posX >= evil.posX && player.posX <= (evil.posX + evil.image.width)) ||
                (player.posX + player.width >= evil.posX && (player.posX + player.width) <= (evil.posX + evil.image.width))));
    }

    function checkCollisions(shot) {
        if (shot.isHittingEvil()) {
            if (evil.life > 1) {
                evil.life--;
            } else {
                evil.kill();
                player.score += evil.pointsToKill;
            }
            shot.deleteShot(parseInt(shot.identifier));
            return false;
        }
        return true;
    }

    function playerAction() {
        player.doAnything();
    }

    function addListener(element, type, expression, bubbling) {
        bubbling = bubbling || false;

        if (window.addEventListener) { // Standard
            element.addEventListener(type, expression, bubbling);
        } else if (window.attachEvent) { // IE
            element.attachEvent('on' + type, expression);
        }
    }

    function keyDown(e) {
        var key = (window.event ? e.keyCode : e.which);
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = true;
            }
        }
    }

    function keyUp(e) {
        var key = (window.event ? e.keyCode : e.which);
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    function draw() {
        ctx.drawImage(buffer, 0, 0);
    }

    function showGameOver() {
        bufferctx.fillStyle="rgb(255,0,0)";
        bufferctx.font="bold 35px Arial";
        bufferctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
    }

    function showCongratulations () {
        bufferctx.fillStyle="rgb(204,50,153)";
        bufferctx.font="bold 22px Arial";
        bufferctx.fillText("Enhorabuena, te has pasado el juego!", canvas.width / 2 - 200, canvas.height / 2 - 30);
        bufferctx.fillText("PUNTOS: " + player.score, canvas.width / 2 - 200, canvas.height / 2);
        bufferctx.fillText("VIDAS: " + player.life + " x 5", canvas.width / 2 - 200, canvas.height / 2 + 30);
        bufferctx.fillText("PUNTUACION TOTAL: " + getTotalScore(), canvas.width / 2 - 200, canvas.height / 2 + 60);
    }

    function getTotalScore() {
        return player.score + player.life * 5;
    }

    function update() {

        drawBackground();

        if (congratulations) {
            showCongratulations();
            return;
        }

        if (youLoose) {
            showGameOver();
            return;
        }

        bufferctx.drawImage(player, player.posX, player.posY);
        bufferctx.drawImage(evil.image, evil.posX, evil.posY);

        updateEvil();
        updatePowerUps();

        for (var j = 0; j < playerShotsBuffer.length; j++) {
            var disparoBueno = playerShotsBuffer[j];
            updatePlayerShot(disparoBueno, j);
        }

        if (isEvilHittingPlayer()) {
            player.killPlayer();
        } else {
            for (var i = 0; i < evilShotsBuffer.length; i++) {
                var evilShot = evilShotsBuffer[i];
                updateEvilShot(evilShot, i);
            }
        }

        showLifeAndScore();

        playerAction();
    }

    function updatePlayerShot(playerShot, id) {
        if (playerShot) {
            playerShot.identifier = id;
            if (checkCollisions(playerShot)) {
                if (playerShot.posY > 0) {
                    playerShot.posY -= playerShot.speed;
                    bufferctx.drawImage(playerShot.image, playerShot.posX, playerShot.posY);
                } else {
                    playerShot.deleteShot(parseInt(playerShot.identifier));
                }
            }
        }
    }

    function updateEvilShot(evilShot, id) {
        if (evilShot) {
            evilShot.identifier = id;
            if (!evilShot.isHittingPlayer()) {
                if (evilShot.posY <= canvas.height) {
                    evilShot.posY += evilShot.speed;
                    bufferctx.drawImage(evilShot.image, evilShot.posX, evilShot.posY);
                } else {
                    evilShot.deleteShot(parseInt(evilShot.identifier));
                }
            } else {
                evilShot.deleteShot(parseInt(evilShot.identifier));
                player.killPlayer();
            }
        }
    }

    function drawBackground() {
        var background;
        if (evil instanceof FinalBoss) {
            background = bgBoss;
        } else {
            background = bgMain;
        }
        bufferctx.drawImage(background, 0, 0);
    }

    function updateEvil() {
        if (!evil.dead) {
            evil.update();
            if (evil.isOutOfScreen()) {
                evil.kill();
            }
        }
    }

    /******************************* MEJORES PUNTUACIONES (LOCALSTORAGE) *******************************/
    function saveFinalScore() {
        localStorage.setItem(getFinalScoreDate(), getTotalScore());
        showBestScores();
        removeNoBestScores();
    }

    function getFinalScoreDate() {
        var date = new Date();
        return fillZero(date.getDay()+1)+'/'+
            fillZero(date.getMonth()+1)+'/'+
            date.getFullYear()+' '+
            fillZero(date.getHours())+':'+
            fillZero(date.getMinutes())+':'+
            fillZero(date.getSeconds());
    }

    function fillZero(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    function getBestScoreKeys() {
        var bestScores = getAllScores();
        bestScores.sort(function (a, b) {return b - a;});
        bestScores = bestScores.slice(0, totalBestScoresToShow);
        var bestScoreKeys = [];
        for (var j = 0; j < bestScores.length; j++) {
            var score = bestScores[j];
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (parseInt(localStorage.getItem(key)) == score) {
                    bestScoreKeys.push(key);
                }
            }
        }
        return bestScoreKeys.slice(0, totalBestScoresToShow);
    }

    function getAllScores() {
        var all = [];
        for (var i=0; i < localStorage.length; i++) {
            all[i] = (localStorage.getItem(localStorage.key(i)));
        }
        return all;
    }

    function showBestScores() {
        var bestScores = getBestScoreKeys();
        var bestScoresList = document.getElementById('puntuaciones');
        if (bestScoresList) {
            clearList(bestScoresList);
            for (var i=0; i < bestScores.length; i++) {
                addListElement(bestScoresList, bestScores[i], i==0?'negrita':null);
                addListElement(bestScoresList, localStorage.getItem(bestScores[i]), i==0?'negrita':null);
            }
        }
    }

    function clearList(list) {
        list.innerHTML = '';
        addListElement(list, "Fecha");
        addListElement(list, "Puntos");
    }

    function addListElement(list, content, className) {
        var element = document.createElement('li');
        if (className) {
            element.setAttribute("class", className);
        }
        element.innerHTML = content;
        list.appendChild(element);
    }

    // extendemos el objeto array con un metodo "containsElement"
    Array.prototype.containsElement = function(element) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == element) {
                return true;
            }
        }
        return false;
    };

    function removeNoBestScores() {
        var scoresToRemove = [];
        var bestScoreKeys = getBestScoreKeys();
        for (var i=0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (!bestScoreKeys.containsElement(key)) {
                scoresToRemove.push(key);
            }
        }
        for (var j = 0; j < scoresToRemove.length; j++) {
            var scoreToRemoveKey = scoresToRemove[j];
            localStorage.removeItem(scoreToRemoveKey);
        }
    }
    /******************************* FIN MEJORES PUNTUACIONES *******************************/

    return {
        init: init
    }
})();