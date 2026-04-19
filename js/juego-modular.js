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
        playerSpeed = 6.2,
        evilCounter = 0,
        youLoose = false,
        congratulations = false,
        minHorizontalOffset = 100,
        maxHorizontalOffset = 400,
        nextEnemySpawnMinDelay = 700,
        nextEnemySpawnMaxDelay = 1400,
        evilShots = 5,
        evilLife = 3,
        playerShotRenderWidth = 18,
        playerShotRenderHeight = 18,
        finalBossShots = 30,
        finalBossLife = 18,
        finalBossLaserWarningDurationMs = 900,
        finalBossLaserWidthRatio = 0.38,
        finalBossLaserDurationMs = 1300,
        levelConfigs = [
            { enemyCount: 8, enemyLife: 2, enemyShots: 3, enemyDownSpeed: 0.95, enemyHorizontalSpeed: 0.9, enemyShotSpeed: 4.6, enemyShootMinDelay: 1200, enemyShootMaxDelay: 2900, spawnMinDelay: 760, spawnMaxDelay: 1300, pointsPerEnemy: 11, mix: { bat: 65, tomb: 25, kamikaze: 10 } },
            { enemyCount: 10, enemyLife: 3, enemyShots: 4, enemyDownSpeed: 1.02, enemyHorizontalSpeed: 1.0, enemyShotSpeed: 4.9, enemyShootMinDelay: 1050, enemyShootMaxDelay: 2500, spawnMinDelay: 690, spawnMaxDelay: 1180, pointsPerEnemy: 13, mix: { bat: 50, tomb: 30, kamikaze: 20 } },
            { enemyCount: 12, enemyLife: 3, enemyShots: 5, enemyDownSpeed: 1.1, enemyHorizontalSpeed: 1.1, enemyShotSpeed: 5.3, enemyShootMinDelay: 930, enemyShootMaxDelay: 2200, spawnMinDelay: 620, spawnMaxDelay: 1060, pointsPerEnemy: 16, mix: { bat: 40, tomb: 35, kamikaze: 25 } }
        ],
        currentLevelIndex = 0,
        enemiesRemainingInLevel = 0,
        bossIntroActive = false,
        bossIntroPendingSpawn = false,
        bossIntroUntil = 0,
        bossIntroDurationMs = 4600,
        backgroundScrollOffsetY = 0,
        mainBackgroundScrollSpeed = 92,
        bossBackgroundScrollSpeed = 126,
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
        playerLifeHeartImage,
        hudShieldIconImage,
        hudTripleIconImage,
        selectedWeaponSkinSrc = 'images/disparo_bueno.png',
        isAudioMuted = false,
        menuMusic,
        menuMusicBaseVolume = 0.45,
        hasUnlockedMenuAudio = false,
        gameMusic,
        gameMusicBaseVolume = 0.75,
        gameMusicFadeTimer = null,
        shotSound,
        hitSound,
        powerUpSound,
        enemyExplosionSound,
        bossMusic,
        bossMusicBaseVolume = 0.78,
        bossLaserSound,
        bossLaserSoundClipTimer = null,
        evilLaughterSound,
        evilLaughterClipTimer = null,
        winGameSound,
        gameOverSound,
        scoreboardSystem,
        powerUpSystem,
        healthBarSystem,
        weaponHeatSystem,
        startScreenScene,
        pauseScene,
        gameOverScene,
        victoryScene,
        gamePhase = 'menu',
        isTutorialMode = false,
        tutorialCurrentStep = 0,
        tutorialCompletedAt = 0,
        tutorialTarget = null,
        tutorialFlags = {
            movedLeft: false,
            movedRight: false,
            shotTarget: false,
            pausedOnce: false
        },
        hasShownFinalScene = false,
        lastFrameTime = 0,
        levelMessage = '',
        levelMessageUntil = 0,
        levelOneCompleted = false,
        levelTwoShown = false,
        playedWinSound = false,
        playedGameOverSound = false,
        selectedPlayerSkinSrc = 'images/bueno.png',
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
        legacyBossImages = {
            animation: [],
            killed: new Image()
        },
        bossImages = {
            animation: [],
            laserAnimation: [],
            killed: new Image()
        },
        bossPhaseTwoImages = {
            animation: []
        },
        bossPhaseTwoLaserImages = {
            animation: []
        },
        kamikazeImages = {
            animation: [],
            killed: new Image()
        },
        bossMinions = [];

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

            var legacyBossImage = new Image();
            legacyBossImage.src = 'images/jefe' + i + '.png';
            legacyBossImages.animation[i - 1] = legacyBossImage;

            var bossImage = new Image();
            bossImage.src = 'images/bossF/bossF' + i + '.png';
            bossImages.animation[i - 1] = bossImage;

            var bossImagePhaseTwo = new Image();
            bossImagePhaseTwo.src = 'images/bossRG/bossRG' + i + '.png';
            bossPhaseTwoImages.animation[i - 1] = bossImagePhaseTwo;

            var laserImage = new Image();
            laserImage.src = 'images/laser/laser' + i + '.png';
            bossImages.laserAnimation[i - 1] = laserImage;

            var redLaserImage = new Image();
            redLaserImage.src = 'images/laser rojo/laser rojo' + i + '.png';
            bossPhaseTwoLaserImages.animation[i - 1] = redLaserImage;

            var kamikazeImage = new Image();
            kamikazeImage.src = 'images/loco/loco' + i + '.png';
            kamikazeImages.animation[i - 1] = kamikazeImage;
        }

        evilImages.killed.src = 'images/malo_muerto.png';
        legacyBossImages.killed.src = 'images/jefe_muerto.png';
        bossImages.killed.src = 'images/bossF/bossF8.png';
        kamikazeImages.killed.src = 'images/loco/loco8.png';

        bgMain = new Image();
        bgMain.src = 'images/fondovertical.png';
        bgBoss = new Image();
        bgBoss.src = 'images/fondovertical_jefe.png';

        playerShotImage = new Image();
        playerShotImage.src = selectedWeaponSkinSrc;
        evilShotImage = new Image();
        evilShotImage.src = 'images/disparo_malo.png';
        playerKilledImage = new Image();
        playerKilledImage.src = 'images/bueno_muerto.png';
        playerNormalImage = new Image();
        playerNormalImage.src = 'images/bueno.png';
        playerShieldImage = new Image();
        playerShieldImage.src = 'images/escudo_personaje.png';
        playerLifeHeartImage = new Image();
        playerLifeHeartImage.src = 'images/vida_medusa.png';
        hudShieldIconImage = new Image();
        hudShieldIconImage.src = 'images/power_up_escudo.png';
        hudTripleIconImage = new Image();
        hudTripleIconImage.src = 'images/power_up_disparo.png';

        menuMusic = new Audio('music/musica_menu_inicio.wav');
        menuMusic.preload = 'auto';
        menuMusic.loop = true;
        menuMusic.volume = menuMusicBaseVolume;
        

        gameMusic = new Audio('music/musica_durante_juego.wav');
        gameMusic.preload = 'auto';
        gameMusic.loop = true;
        gameMusic.volume = gameMusicBaseVolume;

        shotSound = new Audio('music/sonido_disparo.wav');
        shotSound.preload = 'auto';
        hitSound = new Audio('music/Hit.wav');
        hitSound.preload = 'auto';
        powerUpSound = new Audio('music/sonido_power_up.wav');
        powerUpSound.preload = 'auto';
        enemyExplosionSound = new Audio('music/sonido_explosion_enemigos.wav');
        enemyExplosionSound.preload = 'auto';
        bossMusic = new Audio('music/musica_boss_final.mp3');
        bossMusic.preload = 'auto';
        bossMusic.loop = true;
        bossMusic.volume = bossMusicBaseVolume;
        bossLaserSound = new Audio('music/sonido de rayo laser jefe final.mp3');
        bossLaserSound.preload = 'auto';
        bossLaserSound.loop = false;
        evilLaughterSound = new Audio('music/evil laughter.mp3');
        evilLaughterSound.preload = 'auto';
        evilLaughterSound.loop = false;
        winGameSound = new Audio('music/sonido_win_game.wav');
        winGameSound.preload = 'auto';
        gameOverSound = new Audio('music/sonido_game_over.wav');
        gameOverSound.preload = 'auto';
    }

    function playHitSound() {
        if (!hitSound || isAudioMuted) {
            return;
        }
        var hitInstance = hitSound.cloneNode();
        hitInstance.volume = 0.55;
        hitInstance.play().catch(function () {
            return null;
        });
    }

    function playBossMusic() {
        if (!bossMusic || gamePhase !== 'playing' || isAudioMuted) {
            return;
        }
        if (!(evil instanceof FinalBoss)) {
            return;
        }
        if (!bossMusic.paused) {
            return;
        }
        bossMusic.volume = bossMusicBaseVolume;
        bossMusic.play().catch(function () {
            return null;
        });
    }

    function stopBossMusic(resetPosition) {
        if (!bossMusic) {
            return;
        }
        bossMusic.pause();
        if (resetPosition) {
            bossMusic.currentTime = 0;
        }
    }

    function playBossLaserSoundSegment() {
        var clipStart = 9;
        var clipEnd = 12;
        var clipDurationMs = (clipEnd - clipStart) * 1000;

        if (!bossLaserSound || isAudioMuted) {
            return;
        }

        if (bossLaserSoundClipTimer) {
            clearTimeout(bossLaserSoundClipTimer);
            bossLaserSoundClipTimer = null;
        }

        bossLaserSound.pause();
        try {
            bossLaserSound.currentTime = clipStart;
        } catch (error) {
            return;
        }
        bossLaserSound.volume = 0.8;
        bossLaserSound.play().catch(function () {
            return null;
        });

        bossLaserSoundClipTimer = setTimeout(function () {
            if (bossLaserSound) {
                bossLaserSound.pause();
            }
            bossLaserSoundClipTimer = null;
        }, clipDurationMs);
    }

    function stopBossLaserSound(resetPosition) {
        if (!bossLaserSound) {
            return;
        }
        if (bossLaserSoundClipTimer) {
            clearTimeout(bossLaserSoundClipTimer);
            bossLaserSoundClipTimer = null;
        }
        bossLaserSound.pause();
        if (resetPosition) {
            try {
                bossLaserSound.currentTime = 0;
            } catch (error) {
                return;
            }
        }
    }

    function playBossIntroLaughterSegment() {
        var clipStart = 31;
        var clipDurationMs = bossIntroDurationMs;

        if (!evilLaughterSound || isAudioMuted) {
            return;
        }

        if (evilLaughterClipTimer) {
            clearTimeout(evilLaughterClipTimer);
            evilLaughterClipTimer = null;
        }

        evilLaughterSound.pause();
        try {
            evilLaughterSound.currentTime = clipStart;
        } catch (error) {
            return;
        }
        evilLaughterSound.volume = 0.82;
        evilLaughterSound.play().catch(function () {
            return null;
        });

        evilLaughterClipTimer = setTimeout(function () {
            if (evilLaughterSound) {
                evilLaughterSound.pause();
            }
            evilLaughterClipTimer = null;
        }, clipDurationMs);
    }

    function stopBossIntroLaughter(resetPosition) {
        if (!evilLaughterSound) {
            return;
        }
        if (evilLaughterClipTimer) {
            clearTimeout(evilLaughterClipTimer);
            evilLaughterClipTimer = null;
        }
        evilLaughterSound.pause();
        if (resetPosition) {
            try {
                evilLaughterSound.currentTime = 0;
            } catch (error) {
                return;
            }
        }
    }

    function getMuteIconPath() {
        return isAudioMuted
            ? 'images/botones_juego/boton_sonido_silencio.PNG'
            : 'images/botones_juego/boton_sonido_volumen.PNG';
    }

    function updateMuteButtonsUI() {
        var menuMuteImg = document.getElementById('imgMuteMenu');
        var pauseMuteImg = document.getElementById('imgMutePause');
        var iconPath = getMuteIconPath();
        var altText = isAudioMuted ? 'Sonido silenciado' : 'Sonido activado';

        if (menuMuteImg) {
            menuMuteImg.src = iconPath;
            menuMuteImg.alt = altText;
        }
        if (pauseMuteImg) {
            pauseMuteImg.src = iconPath;
            pauseMuteImg.alt = altText;
        }
    }

    function setAudioMuted(muted) {
        isAudioMuted = !!muted;
        updateMuteButtonsUI();

        if (isAudioMuted) {
            stopMenuMusic(false);
            stopGameMusic(0);
            stopBossMusic(false);
            stopBossLaserSound(false);
            stopBossIntroLaughter(false);
            return;
        }

        if (gamePhase === 'menu') {
            playMenuMusic();
            return;
        }

        if (gamePhase === 'playing') {
            if (bossIntroActive) {
                playBossIntroLaughterSegment();
                return;
            }
            if (evil instanceof FinalBoss) {
                playBossMusic();
            } else {
                playGameMusic();
            }
        }
    }

    function toggleAudioMuted() {
        setAudioMuted(!isAudioMuted);
    }

    function setupMuteButtons() {
        var menuMuteBtn = document.getElementById('btnMuteMenu');
        var pauseMuteBtn = document.getElementById('btnMutePause');

        if (menuMuteBtn) {
            menuMuteBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleAudioMuted();
            });
        }
        if (pauseMuteBtn) {
            pauseMuteBtn.addEventListener('click', function (event) {
                event.preventDefault();
                toggleAudioMuted();
            });
        }

        updateMuteButtonsUI();
    }

    function playMenuMusic() {
        if (!menuMusic || isAudioMuted) {
            return;
        }
        if (!menuMusic.paused) {
            return;
        }
        menuMusic.volume = menuMusicBaseVolume;
        menuMusic.play().catch(function () {
            return null;
        });
    }

    function unlockMenuAudio() {
        if (hasUnlockedMenuAudio) {
            return;
        }
        hasUnlockedMenuAudio = true;
        if (gamePhase === 'menu') {
            playMenuMusic();
        }
    }

    function stopMenuMusic(resetPosition) {
        if (!menuMusic) {
            return;
        }
        menuMusic.pause();
        if (resetPosition) {
            menuMusic.currentTime = 0;
        }
    }

    function playGameMusic() {
        if (!gameMusic || isAudioMuted) {
            return;
        }
        if (youLoose || congratulations) {
            return;
        }
        if (gamePhase !== 'playing') {
            return;
        }
        if (bossIntroActive) {
            return;
        }
        if (evil instanceof FinalBoss) {
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

    function getCurrentLevelConfig() {
        return levelConfigs[Math.max(0, Math.min(currentLevelIndex, levelConfigs.length - 1))];
    }

    function getCurrentLevelNumber() {
        return currentLevelIndex + 1;
    }

    function createLevelEnemy(levelConfig) {
        var mix = levelConfig.mix || { bat: 100, tomb: 0, kamikaze: 0 };
        var roll = getRandomNumber(100);
        var batLimit = mix.bat || 0;
        var tombLimit = batLimit + (mix.tomb || 0);

        if (roll < batLimit) {
            return new Evil(levelConfig);
        }
        if (roll < tombLimit) {
            return new TombEnemy(levelConfig);
        }
        return new KamikazeEvil(levelConfig);
    }

    function startBossIntro() {
        bossIntroActive = true;
        bossIntroPendingSpawn = true;
        bossIntroUntil = new Date().getTime() + bossIntroDurationMs;
        stopGameMusic(250);
        playBossIntroLaughterSegment();
    }

    function drawBossIntro() {
        bufferctx.fillStyle = '#000000';
        bufferctx.fillRect(0, 0, canvas.width, canvas.height);
        bufferctx.fillStyle = '#ff1f1f';
        bufferctx.shadowColor = 'rgba(255, 20, 20, 0.75)';
        bufferctx.shadowBlur = 12;
        bufferctx.font = 'bold 62px pixelbasel, Arial';
        bufferctx.textAlign = 'center';
        bufferctx.fillText('BOSS FINAL', canvas.width / 2, canvas.height / 2);
        bufferctx.textAlign = 'start';
        bufferctx.shadowBlur = 0;
    }

    function playShotSound() {
        if (!shotSound || isAudioMuted) {
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
        if (!powerUpSound || isAudioMuted) {
            return;
        }
        var powerUpInstance = powerUpSound.cloneNode();
        powerUpInstance.volume = 0.5;
        powerUpInstance.play().catch(function () {
            return null;
        });
    }

    function playEnemyExplosionSound() {
        if (!enemyExplosionSound || isAudioMuted) {
            return;
        }
        var explosionInstance = enemyExplosionSound.cloneNode();
        explosionInstance.volume = 0.5;
        explosionInstance.play().catch(function () {
            return null;
        });
    }

    function playWinGameSound() {
        if (!winGameSound || playedWinSound || isAudioMuted) {
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
        if (!gameOverSound || playedGameOverSound || isAudioMuted) {
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
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');

        scoreboardSystem = global.ScoreboardSystem.create({
            totalBestScoresToShow: totalBestScoresToShow,
            backendBaseUrl: global.JELLY_BACKEND_URL || 'http://127.0.0.1:8000'
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

        startScreenScene = global.StartScreenScene.create({
            onPlay: startGame,
            onTutorial: startTutorialGame,
            canOpenSidebarLinks: function () {
                return gamePhase === 'menu';
            },
            getBestScore: function () {
                return scoreboardSystem.getBestScore();
            },
            onSelectSkin: function (skinPath) {
                selectedPlayerSkinSrc = skinPath;
            },
            onSelectWeaponSkin: function (weaponPath) {
                selectedWeaponSkinSrc = weaponPath;
                if (playerShotImage) {
                    playerShotImage.src = selectedWeaponSkinSrc;
                }
            }
        });

        pauseScene = global.PauseScene.create({
            onResume: resumeGame,
            onHome: goToMenu
        });

        gameOverScene = global.GameOverScene.create({
            onHome: goToMenu,
            onRestart: startGame
        });

        victoryScene = global.VictoryScene.create({
            onHome: goToMenu,
            onRestart: startGame
        });

        preloadImages();
        setupMuteButtons();
        powerUpSystem.preloadImages();
        scoreboardSystem.renderList('puntuaciones');
        updateSidebarScore(0);

        startScreenScene.show();
        pauseScene.hide();
        gameOverScene.hide();
        victoryScene.hide();
        gamePhase = 'menu';
        playMenuMusic();
        drawBackground();
        draw();

        addListener(document, 'pointerdown', unlockMenuAudio);
        addListener(document, 'touchstart', unlockMenuAudio);
        addListener(document, 'keydown', keyDown);
        addListener(document, 'keyup', keyUp);

        function anim() {
            loop();
            requestAnimFrame(anim);
        }
        anim();

        setSidebarButtonsEnabled(true);
    }

    function setSidebarButtonsEnabled(enabled) {
        var leftColumn = document.querySelector('.izquierda');
        if (!leftColumn) {
            return;
        }
        if (enabled) {
            leftColumn.classList.remove('sidebar-locked');
        } else {
            leftColumn.classList.add('sidebar-locked');
        }
    }

    function updateSidebarScore(score) {
        var scoreNode = document.getElementById('sidebarCurrentScore');
        if (!scoreNode) {
            return;
        }
        scoreNode.textContent = String(Math.max(0, score || 0));
    }

    function resetRunState() {
        totalEvils = 0;
        initialTotalEvils = totalEvils;
        evilCounter = 1;
        youLoose = false;
        congratulations = false;
        levelOneCompleted = false;
        levelTwoShown = false;
        playedWinSound = false;
        playedGameOverSound = false;
        hasShownFinalScene = false;
        nextPlayerShot = 0;
        now = 0;
        currentLevelIndex = 0;
        enemiesRemainingInLevel = 0;
        bossIntroActive = false;
        bossIntroPendingSpawn = false;
        bossIntroUntil = 0;
        isTutorialMode = false;
        tutorialCurrentStep = 0;
        tutorialTarget = null;
        tutorialCompletedAt = 0;
        tutorialFlags.movedLeft = false;
        tutorialFlags.movedRight = false;
        tutorialFlags.shotTarget = false;
        tutorialFlags.pausedOnce = false;
        backgroundScrollOffsetY = 0;
        stopBossLaserSound(true);
        stopBossIntroLaughter(true);
        keyPressed = {};
        playerShotsBuffer.splice(0, playerShotsBuffer.length);
        evilShotsBuffer.splice(0, evilShotsBuffer.length);
        bossMinions.splice(0, bossMinions.length);
        powerUpSystem.clear();
        if (evil) {
            evil.dead = true;
            healthBarSystem.clearEnemy(evil);
        }
        weaponHeatSystem = global.WeaponHeatSystem.create({
            maxHeat: 100,
            heatPerShot: 12,
            coolRateIdle: 26,
            coolRateHoldingFire: 10,
            overheatLockMs: 1400
        });
    }

    function startGame() {
        if (winGameSound) {
            winGameSound.pause();
            winGameSound.currentTime = 0;
        }
        if (gameOverSound) {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }
        stopBossMusic(true);
        resetRunState();
        stopMenuMusic(true);
        setSidebarButtonsEnabled(false);
        startScreenScene.hide();
        pauseScene.hide();
        gameOverScene.hide();
        victoryScene.hide();
        player = new Player(maxPlayerLife, 0);
        updateSidebarScore(0);
        enemiesRemainingInLevel = getCurrentLevelConfig().enemyCount;
        createNewEvil();
        setLevelMessage('Nivel ' + getCurrentLevelNumber(), 2200);
        gamePhase = 'playing';
        lastFrameTime = new Date().getTime();
        playGameMusic();
    }

    function startTutorialGame() {
        if (winGameSound) {
            winGameSound.pause();
            winGameSound.currentTime = 0;
        }
        if (gameOverSound) {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }

        stopBossMusic(true);
        resetRunState();
        stopMenuMusic(true);
        setSidebarButtonsEnabled(false);
        startScreenScene.hide();
        pauseScene.hide();
        gameOverScene.hide();
        victoryScene.hide();

        isTutorialMode = true;
        tutorialCurrentStep = 0;
        tutorialFlags.movedLeft = false;
        tutorialFlags.movedRight = false;
        tutorialFlags.shotTarget = false;
        tutorialFlags.pausedOnce = false;

        player = new Player(maxPlayerLife, 0);
        updateSidebarScore(0);
        tutorialTarget = {
            posX: Math.floor((canvas.width / 2) - 28),
            posY: 135,
            width: 56,
            height: 56,
            hitFlashUntil: 0
        };

        gamePhase = 'playing';
        lastFrameTime = new Date().getTime();
        playGameMusic();
    }

    function pauseGame() {
        if (gamePhase !== 'playing') {
            return;
        }
        gamePhase = 'paused';
        keyPressed = {};
        if (gameMusic && !gameMusic.paused) {
            gameMusic.pause();
        }
        if (bossMusic && !bossMusic.paused) {
            bossMusic.pause();
        }
        stopBossLaserSound(false);
        stopBossIntroLaughter(false);
        pauseScene.show();
    }

    function resumeGame() {
        if (gamePhase !== 'paused') {
            return;
        }
        pauseScene.hide();
        gamePhase = 'playing';
        lastFrameTime = new Date().getTime();
        if (isTutorialMode && tutorialCurrentStep === 3 && tutorialFlags.pausedOnce) {
            advanceTutorialStep();
        }
        if (evil instanceof FinalBoss) {
            playBossMusic();
        } else {
            playGameMusic();
        }
    }

    function goToMenu() {
        stopGameMusic(250);
        stopBossMusic(true);
        stopBossLaserSound(true);
        stopBossIntroLaughter(true);
        stopMenuMusic(false);
        if (winGameSound) {
            winGameSound.pause();
            winGameSound.currentTime = 0;
        }
        if (gameOverSound) {
            gameOverSound.pause();
            gameOverSound.currentTime = 0;
        }
        resetRunState();
        startScreenScene.show();
        pauseScene.hide();
        gameOverScene.hide();
        victoryScene.hide();
        gamePhase = 'menu';
        playMenuMusic();
        setSidebarButtonsEnabled(true);
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

    function getSafeEvilWidth() {
        if (!evil) {
            return 0;
        }
        return evil.renderWidth || evil.width || evil.image.width;
    }

    function getSafeEvilHeight() {
        if (!evil) {
            return 0;
        }
        return evil.renderHeight || evil.height || evil.image.height;
    }

    function Player(life, score) {
        var settings = {
            marginBottom: 10,
            defaultHeight: 66
        };
        var hitAnimTimer = null;

        player = new Image();
        player.src = selectedPlayerSkinSrc || playerNormalImage.src;
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
            var shot = new PlayerShot(
                player.posX + (getSafePlayerWidth() / 2) - (playerShotRenderWidth / 2),
                player.posY
            );
            shot.add();
        }

        function createTripleShot() {
            var centerX = player.posX + (getSafePlayerWidth() / 2) - (playerShotRenderWidth / 2);
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

        player.playHitAnimation = function () {
            var self = this;
            if (self.dead) {
                return;
            }
            self.src = playerKilledImage.src;
            if (hitAnimTimer) {
                clearTimeout(hitAnimTimer);
            }
            hitAnimTimer = setTimeout(function () {
                if (!self.dead) {
                    self.src = selectedPlayerSkinSrc || playerNormalImage.src;
                }
            }, 180);
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

            playHitSound();
            this.playHitAnimation();

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
                youLoose = true;
            }
        };

        player.killPlayerWithoutReset = function () {
            if (!this.canReceiveDamage()) {
                return;
            }

            playHitSound();
            this.playHitAnimation();

            if (this.hasShield) {
                this.removeShield();
                this.damageCooldownUntil = new Date().getTime() + 700;
                return;
            }

            if (this.life > 1) {
                this.life -= 1;
                this.damageCooldownUntil = new Date().getTime() + 900;
                evilShotsBuffer.splice(0, evilShotsBuffer.length);
            } else {
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
                width: getSafeEvilWidth(),
                height: getSafeEvilHeight()
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

    function Evil(levelConfig) {
        Enemy.call(this, levelConfig.enemyLife, levelConfig.enemyShots, evilImages);
        this.goDownSpeed = levelConfig.enemyDownSpeed;
        this.speed = levelConfig.enemyHorizontalSpeed;
        this.attackShotSpeed = levelConfig.enemyShotSpeed;
        this.minShootDelay = levelConfig.enemyShootMinDelay;
        this.maxShootDelay = levelConfig.enemyShootMaxDelay;
        this.pointsToKill = levelConfig.pointsPerEnemy + Math.floor(evilCounter / 2);
    }
    Evil.prototype = Object.create(Enemy.prototype);
    Evil.prototype.constructor = Evil;

    function TombEnemy(levelConfig) {
        Enemy.call(this, Math.max(2, levelConfig.enemyLife + 1), Math.max(2, levelConfig.enemyShots - 1), legacyBossImages);
        this.renderWidth = 100;
        this.renderHeight = 80;
        this.goDownSpeed = Math.max(0.85, levelConfig.enemyDownSpeed - 0.08);
        this.speed = Math.max(0.8, levelConfig.enemyHorizontalSpeed - 0.05);
        this.attackShotSpeed = Math.max(4.4, levelConfig.enemyShotSpeed - 0.2);
        this.minShootDelay = levelConfig.enemyShootMinDelay + 120;
        this.maxShootDelay = levelConfig.enemyShootMaxDelay + 180;
        this.pointsToKill = levelConfig.pointsPerEnemy + 6;
    }
    TombEnemy.prototype = Object.create(Enemy.prototype);
    TombEnemy.prototype.constructor = TombEnemy;

    function KamikazeEvil(levelConfig) {
        this.image = kamikazeImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.renderWidth = 66;
        this.renderHeight = 66;
        this.posX = 20 + getRandomNumber(canvas.width - this.renderWidth - 40);
        this.posY = -this.renderHeight;
        this.life = Math.max(2, levelConfig.enemyLife - 1);
        this.maxLife = this.life;
        this.dead = false;
        this.pointsToKill = levelConfig.pointsPerEnemy + 4;
        this.waitBeforeDashUntil = new Date().getTime() + 1000;
        this.hasLockedTarget = false;
        this.vx = 0;
        this.vy = 1.05;
        this.lockedDashSpeed = 3.4;

        this.kill = function () {
            this.dead = true;
            healthBarSystem.clearEnemy(this);
            createPowerUp();
            this.image = kamikazeImages.killed;
            verifyToCreateNewEvil();
        };

        this.update = function () {
            this.animation++;
            if (this.animation > 5) {
                this.animation = 0;
                this.imageNumber++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = kamikazeImages.animation[this.imageNumber - 1];
            }

            if (!this.hasLockedTarget && new Date().getTime() >= this.waitBeforeDashUntil) {
                var centerX = this.posX + (this.renderWidth / 2);
                var centerY = this.posY + (this.renderHeight / 2);
                var targetX = player.posX + (getSafePlayerWidth() / 2);
                var targetY = player.posY + (getSafePlayerHeight() / 2);
                var dx = targetX - centerX;
                var dy = targetY - centerY;
                var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                this.vx = (dx / distance) * this.lockedDashSpeed;
                this.vy = (dy / distance) * this.lockedDashSpeed;
                this.hasLockedTarget = true;
            }

            this.posX += this.vx;
            this.posY += this.vy;
        };

        this.isOutOfScreen = function () {
            return this.posY > (canvas.height + 60) || this.posY < -120 || this.posX < -120 || this.posX > (canvas.width + 120);
        };
    }

    function BossBatMinion() {
        this.image = legacyBossImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.renderWidth = 92;
        this.renderHeight = 70;
        this.posX = 20 + getRandomNumber(canvas.width - this.renderWidth - 40);
        this.posY = -this.renderHeight;
        this.life = 3;
        this.maxLife = 3;
        this.speed = 2.2;
        this.dead = false;
        this.pointsToKill = 35;
        this.shootCount = 2;
        this.nextShootAt = new Date().getTime() + 800 + getRandomNumber(800);

        this.update = function () {
            this.posY += this.speed;
            this.animation++;
            if (this.animation > 5) {
                this.animation = 0;
                this.imageNumber++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = legacyBossImages.animation[this.imageNumber - 1];
            }

            if (!this.dead && this.shootCount > 0 && new Date().getTime() >= this.nextShootAt) {
                var shot = new EvilShot(this.posX + (this.renderWidth / 2) - 5, this.posY + this.renderHeight);
                shot.speed = shotSpeed + 0.8;
                shot.add();
                this.shootCount--;
                this.nextShootAt = new Date().getTime() + 650 + getRandomNumber(650);
            }
        };

        this.isOutOfScreen = function () {
            return this.posY > (canvas.height + 40);
        };

        this.kill = function () {
            this.dead = true;
            this.image = legacyBossImages.killed;
            player.score += this.pointsToKill;
        };
    }

    function KamikazeMinion() {
        this.image = kamikazeImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.renderWidth = 68;
        this.renderHeight = 68;
        this.posX = 20 + getRandomNumber(canvas.width - this.renderWidth - 40);
        this.posY = -this.renderHeight;
        this.life = 1;
        this.maxLife = 1;
        this.dead = false;
        this.pointsToKill = 45;
        this.lockTargetAt = new Date().getTime() + 1000;
        this.hasLockedTarget = false;
        this.vx = 0;
        this.vy = 1.1;

        this.update = function () {
            this.animation++;
            if (this.animation > 5) {
                this.animation = 0;
                this.imageNumber++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = kamikazeImages.animation[this.imageNumber - 1];
            }

            if (!this.hasLockedTarget && new Date().getTime() >= this.lockTargetAt) {
                var centerX = this.posX + (this.renderWidth / 2);
                var centerY = this.posY + (this.renderHeight / 2);
                var targetX = player.posX + (getSafePlayerWidth() / 2);
                var targetY = player.posY + (getSafePlayerHeight() / 2);
                var dx = targetX - centerX;
                var dy = targetY - centerY;
                var distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                var speed = 5.2;
                this.vx = (dx / distance) * speed;
                this.vy = (dy / distance) * speed;
                this.hasLockedTarget = true;
            }

            this.posX += this.vx;
            this.posY += this.vy;
        };

        this.isOutOfScreen = function () {
            return this.posY > (canvas.height + 60) || this.posY < -120 || this.posX < -120 || this.posX > (canvas.width + 120);
        };

        this.kill = function () {
            this.dead = true;
            this.image = kamikazeImages.killed;
            player.score += this.pointsToKill;
        };
    }

    function FinalBoss() {
        var self = this;

        this.image = bossImages.animation[0];
        this.imageNumber = 1;
        this.animation = 0;
        this.renderWidth = 250;
        this.renderHeight = 170;
        this.posX = (canvas.width - this.renderWidth) / 2;
        this.posY = 12;
        this.life = finalBossLife;
        this.maxLife = this.life;
        this.dead = false;
        this.speed = 1.2;
        this.direction = 'D';
        this.minX = 24;
        this.maxX = canvas.width - this.renderWidth - 24;
        this.phaseTwo = false;
        this.phaseTwoThreshold = this.maxLife * 0.5;
        this.phaseTwoArmorHitsRequired = 3;
        this.phaseTwoArmorHitCounter = 0;
        this.currentAnimationFrames = bossImages.animation;
        this.currentLaserFrames = bossImages.laserAnimation;
        this.nextBatSpawnAt = 0;
        this.nextKamikazeSpawnAt = 0;
        this.spawnRestUntil = 0;
        this.laserSafeEdgeRatio = 0.08;

        this.laserFrame = 0;
        this.laserTick = 0;
        this.laserWarningActive = false;
        this.laserWarningDurationMs = finalBossLaserWarningDurationMs;
        this.laserWarningEndAt = 0;
        this.laserActive = false;
        this.laserDurationMs = finalBossLaserDurationMs;
        this.laserEndAt = 0;
        this.nextLaserAt = new Date().getTime() + 1800;
        this.laserMinCooldown = 2300;
        this.laserMaxCooldown = 3800;

        this.pointsToKill = 500;

        this.kill = function () {
            this.dead = true;
            this.laserWarningActive = false;
            this.laserActive = false;
            stopBossMusic(false);
            stopBossLaserSound(true);
            healthBarSystem.clearEnemy(this);
            this.image = bossImages.killed;
            verifyToCreateNewEvil();
        };

        this.enterPhaseTwo = function () {
            this.phaseTwo = true;
            this.currentAnimationFrames = bossPhaseTwoImages.animation;
            this.currentLaserFrames = bossPhaseTwoLaserImages.animation;
            this.speed = 2.15;
            this.laserMinCooldown = 1700;
            this.laserMaxCooldown = 2900;
            this.nextBatSpawnAt = new Date().getTime() + 1200;
            this.nextKamikazeSpawnAt = new Date().getTime() + 1800;
            setLevelMessage('Fase 2', 1800);
        };

        this.update = function () {
            var nowMs = new Date().getTime();

            if (!this.phaseTwo && this.life <= this.phaseTwoThreshold) {
                this.enterPhaseTwo();
            }

            if (this.direction === 'D') {
                this.posX += this.speed;
                if (this.posX >= this.maxX) {
                    this.posX = this.maxX;
                    this.direction = 'I';
                }
            } else {
                this.posX -= this.speed;
                if (this.posX <= this.minX) {
                    this.posX = this.minX;
                    this.direction = 'D';
                }
            }

            this.animation++;
            if (this.animation > 5) {
                this.animation = 0;
                this.imageNumber++;
                if (this.imageNumber > 8) {
                    this.imageNumber = 1;
                }
                this.image = this.currentAnimationFrames[this.imageNumber - 1];
            }

            if (this.phaseTwo) {
                if (!this.laserActive && nowMs >= this.spawnRestUntil && nowMs >= this.nextBatSpawnAt) {
                    bossMinions.push(new BossBatMinion());
                    this.nextBatSpawnAt = nowMs + 2100 + getRandomNumber(2200);
                }
                if (!this.laserActive && nowMs >= this.spawnRestUntil && nowMs >= this.nextKamikazeSpawnAt) {
                    bossMinions.push(new KamikazeMinion());
                    this.nextKamikazeSpawnAt = nowMs + 2400 + getRandomNumber(2600);
                }
            }

            if (!this.laserActive && !this.laserWarningActive && nowMs >= this.nextLaserAt) {
                this.laserWarningActive = true;
                this.laserWarningEndAt = nowMs + this.laserWarningDurationMs;
            }

            if (this.laserWarningActive && nowMs >= this.laserWarningEndAt) {
                this.laserWarningActive = false;
                this.laserActive = true;
                this.laserEndAt = nowMs + this.laserDurationMs;
                this.laserFrame = 0;
                this.laserTick = 0;
                playBossLaserSoundSegment();
            }

            if (this.laserActive) {
                this.laserTick++;
                if (this.laserTick >= 3) {
                    this.laserTick = 0;
                    this.laserFrame = (this.laserFrame + 1) % bossImages.laserAnimation.length;
                }
                if (nowMs >= this.laserEndAt) {
                    this.laserActive = false;
                    this.spawnRestUntil = nowMs + 2000;
                    stopBossLaserSound(false);
                    this.nextLaserAt = nowMs + this.laserMinCooldown + getRandomNumber(this.laserMaxCooldown - this.laserMinCooldown);
                }
            }
        };

        this.isOutOfScreen = function () {
            return false;
        };

        this.getLaserRect = function () {
            var width = Math.floor(canvas.width * finalBossLaserWidthRatio);
            var bossCenterX = this.posX + (this.renderWidth / 2);
            var x = Math.floor(bossCenterX - (width / 2));
            var y = this.posY + this.renderHeight - 18;

            if (x < 0) {
                x = 0;
            }
            if (x + width > canvas.width) {
                x = canvas.width - width;
            }

            return {
                posX: x,
                posY: y,
                width: width,
                height: canvas.height - y
            };
        };

        this.drawLaserWarning = function () {
            var rect;
            if (!self.laserWarningActive) {
                return;
            }

            rect = self.getLaserRect();
            bufferctx.save();
            bufferctx.fillStyle = 'rgba(255, 70, 70, 0.18)';
            bufferctx.fillRect(rect.posX, rect.posY, rect.width, rect.height);

            bufferctx.strokeStyle = 'rgba(255, 230, 120, 0.95)';
            bufferctx.lineWidth = 3;
            if (typeof bufferctx.setLineDash === 'function') {
                bufferctx.setLineDash([8, 6]);
            }
            bufferctx.strokeRect(rect.posX + 1.5, rect.posY + 1.5, rect.width - 3, rect.height - 3);
            if (typeof bufferctx.setLineDash === 'function') {
                bufferctx.setLineDash([]);
            }

            bufferctx.fillStyle = '#ffe86a';
            bufferctx.font = 'bold 46px Arial';
            bufferctx.textAlign = 'center';
            bufferctx.fillText('!', rect.posX + (rect.width / 2), rect.posY - 10);
            bufferctx.textAlign = 'start';
            bufferctx.restore();
        };

        this.drawLaser = function () {
            var rect;
            var laserImage;
            if (!self.laserActive) {
                return;
            }

            rect = self.getLaserRect();
            laserImage = self.currentLaserFrames[self.laserFrame] || self.currentLaserFrames[0];
            if (laserImage) {
                bufferctx.drawImage(laserImage, rect.posX, rect.posY, rect.width, rect.height);
            }
        };

        this.isLaserHittingPlayer = function () {
            var hitRect;
            var safeInset;
            if (!self.laserActive) {
                return false;
            }

            hitRect = self.getLaserRect();
            safeInset = Math.floor(hitRect.width * self.laserSafeEdgeRatio);
            hitRect.posX += safeInset;
            hitRect.width = Math.max(8, hitRect.width - (safeInset * 2));

            return global.CollisionSystem.isRectOverlap(hitRect, {
                posX: player.posX,
                posY: player.posY,
                width: getSafePlayerWidth(),
                height: getSafePlayerHeight()
            });
        };
    }

    function verifyToCreateNewEvil() {
        if (evil instanceof FinalBoss) {
            setTimeout(function () {
                congratulations = true;
            }, 2000);
            return;
        }

        enemiesRemainingInLevel = Math.max(0, enemiesRemainingInLevel - 1);

        if (enemiesRemainingInLevel > 0) {
            var currentConfig = getCurrentLevelConfig();
            var spawnDelayRange = Math.max(1, currentConfig.spawnMaxDelay - currentConfig.spawnMinDelay);
            setTimeout(function () {
                createNewEvil();
                evilCounter++;
            }, currentConfig.spawnMinDelay + getRandomNumber(spawnDelayRange));
            return;
        }

        powerUpSystem.spawnGuaranteed(canvas.width, getRandomNumber);
        setLevelMessage('Nivel ' + getCurrentLevelNumber() + ' completado', 2200);

        if (currentLevelIndex < (levelConfigs.length - 1)) {
            setTimeout(function () {
                currentLevelIndex += 1;
                enemiesRemainingInLevel = getCurrentLevelConfig().enemyCount;
                setLevelMessage('Nivel ' + getCurrentLevelNumber(), 1900);
                createNewEvil();
                evilCounter++;
            }, 2300);
            return;
        }

        setTimeout(function () {
            startBossIntro();
        }, 2300);
    }

    function createNewEvil() {
        // Evita que enemigos anteriores sigan disparando por temporizadores pendientes.
        if (evil && !evil.dead) {
            evil.dead = true;
        }
        // Evita que disparos del jugador arrastrados peguen al siguiente enemigo (incluido el boss).
        playerShotsBuffer.splice(0, playerShotsBuffer.length);
        // Limpia disparos huérfanos cuando cambia el enemigo activo.
        evilShotsBuffer.splice(0, evilShotsBuffer.length);
        bossMinions.splice(0, bossMinions.length);

        if (currentLevelIndex < levelConfigs.length) {
            stopBossMusic(true);
            evil = createLevelEnemy(getCurrentLevelConfig());
            playGameMusic();
        } else {
            evil = new FinalBoss();
            stopGameMusic(250);
            playBossMusic();
            setLevelMessage('Jefe final', 1800);
        }
    }

    function isEvilHittingPlayer() {
        return global.CollisionSystem.isEnemyHittingPlayer({
            posX: evil.posX,
            posY: evil.posY,
            width: getSafeEvilWidth(),
            height: getSafeEvilHeight()
        }, {
            posX: player.posX,
            posY: player.posY,
            width: getSafePlayerWidth(),
            height: getSafePlayerHeight()
        });
    }

    function drawEvil() {
        if (evil.renderWidth && evil.renderHeight) {
            bufferctx.drawImage(evil.image, evil.posX, evil.posY, evil.renderWidth, evil.renderHeight);
            return;
        }
        bufferctx.drawImage(evil.image, evil.posX, evil.posY);
    }

    function getEntityWidth(entity) {
        return entity.renderWidth || entity.width || entity.image.width;
    }

    function getEntityHeight(entity) {
        return entity.renderHeight || entity.height || entity.image.height;
    }

    function isMinionHittingPlayer(minion) {
        return global.CollisionSystem.isEnemyHittingPlayer({
            posX: minion.posX,
            posY: minion.posY,
            width: getEntityWidth(minion),
            height: getEntityHeight(minion)
        }, {
            posX: player.posX,
            posY: player.posY,
            width: getSafePlayerWidth(),
            height: getSafePlayerHeight()
        });
    }

    function drawBossMinions() {
        var i;
        for (i = 0; i < bossMinions.length; i++) {
            var minion = bossMinions[i];
            if (!minion || minion.dead) {
                continue;
            }
            bufferctx.drawImage(minion.image, minion.posX, minion.posY, getEntityWidth(minion), getEntityHeight(minion));
        }
    }

    function updateBossMinions() {
        var i;
        for (i = 0; i < bossMinions.length; i++) {
            var minion = bossMinions[i];
            if (!minion || minion.dead) {
                continue;
            }

            minion.update();

            if (isMinionHittingPlayer(minion)) {
                minion.dead = true;
                if (evil instanceof FinalBoss) {
                    player.killPlayerWithoutReset();
                } else {
                    player.killPlayer();
                }
                continue;
            }

            if (minion.isOutOfScreen()) {
                minion.dead = true;
            }
        }

        bossMinions = bossMinions.filter(function (minion) {
            return minion && !minion.dead;
        });
    }

    function checkCollisions(shot) {
        var i;

        for (i = 0; i < bossMinions.length; i++) {
            var minion = bossMinions[i];
            if (!minion || minion.dead) {
                continue;
            }

            if (global.CollisionSystem.isPointInsideRect(shot.posX, shot.posY, {
                posX: minion.posX,
                posY: minion.posY,
                width: getEntityWidth(minion),
                height: getEntityHeight(minion)
            })) {
                if (minion.life > 1) {
                    minion.life--;
                } else {
                    playEnemyExplosionSound();
                    minion.kill();
                }
                shot.deleteShot(parseInt(shot.identifier, 10));
                return false;
            }
        }

        if (shot.isHittingEvil()) {
            if (evil.life > 1) {
                if (evil instanceof FinalBoss && evil.phaseTwo) {
                    evil.phaseTwoArmorHitCounter += 1;
                    if (evil.phaseTwoArmorHitCounter >= evil.phaseTwoArmorHitsRequired) {
                        evil.life--;
                        evil.phaseTwoArmorHitCounter = 0;
                    }
                } else {
                    evil.life--;
                }
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
        var key = (window.event ? e.keyCode : e.which);

        if (key === 27) {
            e.preventDefault();
            if (gamePhase === 'playing') {
                if (isTutorialMode) {
                    tutorialFlags.pausedOnce = true;
                }
                pauseGame();
            } else if (gamePhase === 'paused') {
                resumeGame();
            }
            return;
        }

        if (gamePhase !== 'playing') {
            return;
        }

        playGameMusic();
        var inkey;
        for (inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = true;
                if (isTutorialMode) {
                    if (inkey === 'left') {
                        tutorialFlags.movedLeft = true;
                    }
                    if (inkey === 'right') {
                        tutorialFlags.movedRight = true;
                    }
                }
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

    function updateBackgroundScroll(deltaSec) {
        var speed = (evil instanceof FinalBoss) ? bossBackgroundScrollSpeed : mainBackgroundScrollSpeed;

        backgroundScrollOffsetY += speed * deltaSec;
        if (backgroundScrollOffsetY >= canvas.height) {
            backgroundScrollOffsetY = backgroundScrollOffsetY % canvas.height;
        }
    }

    function drawBackground() {
        var background = (evil instanceof FinalBoss) ? bgBoss : bgMain;
        var offsetY = Math.floor(backgroundScrollOffsetY);

        if (!background) {
            return;
        }

        // Draw two stacked backgrounds to create a seamless downward scroll.
        bufferctx.drawImage(background, 0, offsetY - canvas.height, canvas.width, canvas.height);
        bufferctx.drawImage(background, 0, offsetY, canvas.width, canvas.height);
    }

    function showGameOver() {
        bufferctx.fillStyle = 'rgb(255,0,0)';
        bufferctx.font = 'bold 35px pixelbasel, Arial, sans-serif';
        bufferctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
    }

    function showCongratulations() {
        bufferctx.fillStyle = 'rgb(46, 219, 97)';
        bufferctx.font = 'bold 22px pixelbasel, Arial, sans-serif';
        bufferctx.fillText('Enhorabuena, te has pasado el juego!', canvas.width / 2 - 200, canvas.height / 2 - 30);
        bufferctx.fillText('PUNTOS: ' + player.score, canvas.width / 2 - 200, canvas.height / 2);
        bufferctx.fillText('VIDAS: ' + player.life + ' x 5', canvas.width / 2 - 200, canvas.height / 2 + 30);
        bufferctx.fillText('PUNTUACION TOTAL: ' + getTotalScore(), canvas.width / 2 - 200, canvas.height / 2 + 60);
    }

    function showLifeAndScore() {
        var heartSize = 26;
        var heartStartX = canvas.width - 105;
        var heartY = 30;
        var hudIconX = canvas.width - 110;
        var shieldHudY = 70;
        var tripleHudY = 100;
        var hudIconSize = 20;
        var i;

        bufferctx.fillStyle = '#ffffff';
        bufferctx.font = 'bold 16px Arial';
        bufferctx.shadowColor = 'rgba(0,0,0,0.75)';
        bufferctx.shadowBlur = 2;

        for (i = 0; i < player.life; i++) {
            bufferctx.drawImage(
                playerLifeHeartImage,
                heartStartX + (i * (heartSize + 4)),
                heartY,
                heartSize,
                heartSize
            );
        }

        if (player.hasShield && player.shieldCharges > 0) {
            bufferctx.drawImage(hudShieldIconImage, hudIconX, shieldHudY - 15, hudIconSize, hudIconSize);
            bufferctx.fillText('x' + player.shieldCharges, hudIconX + 26, shieldHudY);
        }
        if (player.hasTripleShot()) {
            bufferctx.drawImage(hudTripleIconImage, hudIconX, tripleHudY - 15, hudIconSize, hudIconSize);
            bufferctx.fillText('ACTIVO', hudIconX + 26, tripleHudY);
        }
        bufferctx.shadowBlur = 0;
        weaponHeatSystem.drawHud(bufferctx, new Date().getTime(), canvas.width - 130, 125);
    }

    function getTutorialStepText() {
        if (tutorialCurrentStep === 0) {
            return 'Tutorial: mueve la medusa a la izquierda con la flecha izquierda de tu teclado.';
        }
        if (tutorialCurrentStep === 1) {
            return 'Tutorial: ahora mueve la medusa a la derecha con la flecha derecha de tu teclado.';
        }
        if (tutorialCurrentStep === 2) {
            return 'Tutorial: dispara con ESPACIO y pega al objetivo.';
        }
        if (tutorialCurrentStep === 3) {
            return 'Tutorial: presiona ESC para pausar y luego reanuda.';
        }
        return 'Tutorial completado. Volviendo al menu...';
    }

    function advanceTutorialStep() {
        tutorialCurrentStep += 1;
        if (tutorialCurrentStep >= 4) {
            tutorialCurrentStep = 4;
            tutorialCompletedAt = new Date().getTime() + 1400;
        }
    }

    function drawTutorialOverlay() {
        var nowMs = new Date().getTime();
        var boxWidth = Math.floor(canvas.width * 0.64);
        var boxHeight = 138;
        var boxX = Math.floor((canvas.width - boxWidth) / 2);
        var boxY = Math.floor((canvas.height - boxHeight) / 2) + 140;
        var maxTextWidth = boxWidth - 36;
        var words;
        var currentLine = '';
        var lines = [];
        var i;
        var text = getTutorialStepText();

        bufferctx.save();
        bufferctx.fillStyle = 'rgba(6, 12, 20, 0.78)';
        bufferctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        bufferctx.strokeStyle = '#ffffff';
        bufferctx.lineWidth = 2;
        bufferctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        bufferctx.fillStyle = '#d7ffe6';
        bufferctx.font = 'bold 24px pixelbasel, Arial, sans-serif';
        words = text.split(' ');
        for (i = 0; i < words.length; i++) {
            var candidate = currentLine ? (currentLine + ' ' + words[i]) : words[i];
            if (bufferctx.measureText(candidate).width <= maxTextWidth) {
                currentLine = candidate;
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }

        for (i = 0; i < lines.length && i < 4; i++) {
            bufferctx.fillText(lines[i], boxX + 18, boxY + 36 + (i * 26));
        }
        bufferctx.restore();

        if (tutorialTarget) {
            bufferctx.save();
            bufferctx.fillStyle = nowMs < tutorialTarget.hitFlashUntil ? 'rgba(240, 255, 110, 0.5)' : 'rgba(50, 90, 140, 0.35)';
            bufferctx.fillRect(tutorialTarget.posX, tutorialTarget.posY, tutorialTarget.width, tutorialTarget.height);
            bufferctx.strokeStyle = '#d8f2ff';
            bufferctx.lineWidth = 2;
            bufferctx.strokeRect(tutorialTarget.posX, tutorialTarget.posY, tutorialTarget.width, tutorialTarget.height);
            bufferctx.fillStyle = '#d8f2ff';
            bufferctx.font = 'bold 13px pixelbasel, Arial, sans-serif';
            bufferctx.fillText('OBJETIVO', tutorialTarget.posX - 6, tutorialTarget.posY - 8);
            bufferctx.restore();
        }
    }

    function isTutorialShotHittingTarget(shot) {
        if (!tutorialTarget) {
            return false;
        }
        return global.CollisionSystem.isRectOverlap({
            posX: shot.posX,
            posY: shot.posY,
            width: playerShotRenderWidth,
            height: playerShotRenderHeight
        }, {
            posX: tutorialTarget.posX,
            posY: tutorialTarget.posY,
            width: tutorialTarget.width,
            height: tutorialTarget.height
        });
    }

    function updateTutorialMode(currentTime) {
        var j;

        drawPlayerWithEffects();

        for (j = 0; j < playerShotsBuffer.length; j++) {
            var playerShot = playerShotsBuffer[j];
            if (!playerShot) {
                continue;
            }
            playerShot.posY -= playerShot.speed;
            if (playerShot.posY <= 0) {
                playerShotsBuffer.splice(j, 1);
                j -= 1;
                continue;
            }

            if (isTutorialShotHittingTarget(playerShot)) {
                tutorialFlags.shotTarget = true;
                if (tutorialTarget) {
                    tutorialTarget.hitFlashUntil = currentTime + 250;
                }
                playerShotsBuffer.splice(j, 1);
                j -= 1;
                continue;
            }

            bufferctx.drawImage(
                playerShot.image,
                playerShot.posX,
                playerShot.posY,
                playerShotRenderWidth,
                playerShotRenderHeight
            );
        }

        if (tutorialCurrentStep === 0 && tutorialFlags.movedLeft) {
            advanceTutorialStep();
        }
        if (tutorialCurrentStep === 1 && tutorialFlags.movedRight) {
            advanceTutorialStep();
        }
        if (tutorialCurrentStep === 2 && tutorialFlags.shotTarget) {
            advanceTutorialStep();
        }

        showLifeAndScore();
        updateSidebarScore(player.score);
        drawTutorialOverlay();
        player.doAnything();

        if (tutorialCurrentStep >= 4 && tutorialCompletedAt > 0 && currentTime >= tutorialCompletedAt) {
            goToMenu();
        }
    }

    function updatePlayerShot(playerShot, id) {
        if (!playerShot) {
            return;
        }
        playerShot.identifier = id;
        if (checkCollisions(playerShot)) {
            if (playerShot.posY > 0) {
                playerShot.posY -= playerShot.speed;
                bufferctx.drawImage(
                    playerShot.image,
                    playerShot.posX,
                    playerShot.posY,
                    playerShotRenderWidth,
                    playerShotRenderHeight
                );
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
            player.killPlayerWithoutReset();
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

        if (gamePhase !== 'playing') {
            return;
        }

        updateBackgroundScroll(deltaSec);
        drawBackground();

        if (bossIntroActive) {
            drawBossIntro();
            if (currentTime >= bossIntroUntil && bossIntroPendingSpawn) {
                bossIntroActive = false;
                bossIntroPendingSpawn = false;
                stopBossIntroLaughter(false);
                currentLevelIndex = levelConfigs.length;
                createNewEvil();
            }
            return;
        }

        weaponHeatSystem.update({
            isFiring: !!keyPressed.fire,
            nowMs: currentTime,
            deltaSec: deltaSec
        });

        if (isTutorialMode) {
            updateTutorialMode(currentTime);
            return;
        }

        if (congratulations) {
            if (!hasShownFinalScene) {
                hasShownFinalScene = true;
                stopBossMusic(false);
                stopBossLaserSound(true);
                stopBossIntroLaughter(true);
                saveFinalScore(promptWinnerTag());
                scoreboardSystem.renderList('puntuaciones');
                playWinGameSound();
                victoryScene.show(getTotalScore());
                gamePhase = 'end';
            }
            return;
        }

        if (youLoose) {
            if (!hasShownFinalScene) {
                hasShownFinalScene = true;
                stopBossMusic(false);
                stopBossLaserSound(true);
                stopBossIntroLaughter(true);
                playGameOverSound();
                gameOverScene.show();
                gamePhase = 'end';
            }
            return;
        }

        drawPlayerWithEffects();
        if (evil instanceof FinalBoss) {
            evil.drawLaserWarning();
            evil.drawLaser();
        }
        drawEvil();
        drawBossMinions();
        healthBarSystem.drawEnemyBar(bufferctx, evil, {
            width: getSafeEvilWidth(),
            yOffset: 10,
            height: 7
        });
        drawLevelMessage();

        updateEvil();
        updateBossMinions();
        updatePowerUps();

        var j;
        for (j = 0; j < playerShotsBuffer.length; j++) {
            updatePlayerShot(playerShotsBuffer[j], j);
        }

        if (evil instanceof FinalBoss && evil.isLaserHittingPlayer()) {
            player.killPlayerWithoutReset();
        }

        if (isEvilHittingPlayer()) {
            player.killPlayerWithoutReset();
        } else {
            var i;
            for (i = 0; i < evilShotsBuffer.length; i++) {
                updateEvilShot(evilShotsBuffer[i], i);
            }
        }

        showLifeAndScore();
        updateSidebarScore(player.score);
        player.doAnything();
    }

    function getTotalScore() {
        return player.score + player.life * 5;
    }

    function sanitizeWinnerTag(rawValue) {
        var tag = (rawValue || '').toString().trim().toUpperCase();
        tag = tag.replace(/[^A-Z0-9]/g, '');
        return tag.slice(0, 3);
    }

    function promptWinnerTag() {
        var fallbackTag = 'AAA';
        var attempt = 0;
        var inputTag = '';

        while (attempt < 3) {
            inputTag = prompt('Ganaste! Ingresa un nombre de 3 caracteres (A-Z, 0-9):', fallbackTag);
            if (inputTag === null) {
                break;
            }

            inputTag = sanitizeWinnerTag(inputTag);
            if (inputTag.length === 3) {
                return inputTag;
            }

            alert('Debes ingresar exactamente 3 caracteres validos.');
            attempt += 1;
        }

        return fallbackTag;
    }

    function saveFinalScore() {
        var defaultName = 'AAA';
        var nameArg = arguments.length > 0 ? arguments[0] : defaultName;
        scoreboardSystem.saveScore(getTotalScore(), 'puntuaciones', nameArg);
    }

    return {
        init: init
    };
})(window);
