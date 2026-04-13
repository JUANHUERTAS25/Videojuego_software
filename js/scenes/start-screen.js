(function (global) {
    function create(options) {
        var menuRoot = document.getElementById('sceneMenu');
        var wardrobeRoot = document.getElementById('sceneWardrobe');
        var tutorialRoot = document.getElementById('sceneTutorial');

        var playBtn = document.getElementById('btnPlay');
        var wardrobeBtn = document.getElementById('btnWardrobe');
        var tutorialBtn = document.getElementById('btnTutorial');
        var tutorialLink = document.getElementById('tutorialLink');

        var wardrobeBackBtn = document.getElementById('btnWardrobeBack');
        var selectSkinDefaultBtn = document.getElementById('btnSelectSkinDefault');
        var selectSkin2Btn = document.getElementById('btnSelectSkin2');
        var wardrobeStatus = document.getElementById('wardrobeUnlockStatus');
        var wardrobeCard = document.getElementById('wardrobeSkinCard');

        var tutorialBackBtn = document.getElementById('btnTutorialBack');

        var selectedSkin = 'images/bueno.png';

        function getBestStoredScore() {
            if (options.getBestScore) {
                return options.getBestScore();
            }
            return 0;
        }

        function isSkin2Unlocked() {
            return getBestStoredScore() >= 70;
        }

        function refreshWardrobeState() {
            var unlocked = isSkin2Unlocked();
            if (wardrobeStatus) {
                wardrobeStatus.textContent = unlocked
                    ? 'Desbloqueada: puntuacion 70+ alcanzada.'
                    : 'Bloqueada: alcanza 70 puntos para desbloquear.';
            }
            if (selectSkin2Btn) {
                selectSkin2Btn.disabled = !unlocked;
                selectSkin2Btn.textContent = unlocked
                    ? (selectedSkin === 'images/skin2.png' ? 'Seleccionada' : 'Seleccionar')
                    : 'Bloqueada';
            }
            if (selectSkinDefaultBtn) {
                selectSkinDefaultBtn.textContent = selectedSkin === 'images/bueno.png' ? 'Seleccionada' : 'Seleccionar';
            }
            if (wardrobeCard) {
                if (unlocked) {
                    wardrobeCard.classList.remove('is-locked');
                } else {
                    wardrobeCard.classList.add('is-locked');
                }
            }
        }

        function showMenuRoot() {
            if (menuRoot) {
                menuRoot.classList.add('is-active');
            }
            if (wardrobeRoot) {
                wardrobeRoot.classList.remove('is-active');
            }
            if (tutorialRoot) {
                tutorialRoot.classList.remove('is-active');
            }
        }

        function showWardrobe() {
            refreshWardrobeState();
            if (menuRoot) {
                menuRoot.classList.remove('is-active');
            }
            if (wardrobeRoot) {
                wardrobeRoot.classList.add('is-active');
            }
        }

        function showTutorial() {
            if (menuRoot) {
                menuRoot.classList.remove('is-active');
            }
            if (tutorialRoot) {
                tutorialRoot.classList.add('is-active');
            }
        }

        if (playBtn) {
            playBtn.addEventListener('click', function () {
                options.onPlay();
            });
        }
        if (wardrobeBtn) {
            wardrobeBtn.addEventListener('click', function () {
                showWardrobe();
            });
        }
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', function () {
                showTutorial();
            });
        }
        if (tutorialLink) {
            tutorialLink.addEventListener('click', function (event) {
                event.preventDefault();
                showTutorial();
            });
        }
        if (wardrobeBackBtn) {
            wardrobeBackBtn.addEventListener('click', function () {
                showMenuRoot();
            });
        }
        if (tutorialBackBtn) {
            tutorialBackBtn.addEventListener('click', function () {
                showMenuRoot();
            });
        }
        if (selectSkin2Btn) {
            selectSkin2Btn.addEventListener('click', function () {
                if (!isSkin2Unlocked()) {
                    return;
                }
                selectedSkin = 'images/skin2.png';
                refreshWardrobeState();
                if (options.onSelectSkin) {
                    options.onSelectSkin(selectedSkin);
                }
            });
        }
        if (selectSkinDefaultBtn) {
            selectSkinDefaultBtn.addEventListener('click', function () {
                selectedSkin = 'images/bueno.png';
                refreshWardrobeState();
                if (options.onSelectSkin) {
                    options.onSelectSkin(selectedSkin);
                }
            });
        }

        function show() {
            showMenuRoot();
            refreshWardrobeState();
        }

        function hide() {
            if (menuRoot) {
                menuRoot.classList.remove('is-active');
            }
            if (wardrobeRoot) {
                wardrobeRoot.classList.remove('is-active');
            }
            if (tutorialRoot) {
                tutorialRoot.classList.remove('is-active');
            }
        }

        return {
            show: show,
            hide: hide
        };
    }

    global.StartScreenScene = {
        create: create
    };
})(window);
