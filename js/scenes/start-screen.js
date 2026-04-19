(function (global) {
    function create(options) {
        var menuRoot = document.getElementById('sceneMenu');
        var wardrobeRoot = document.getElementById('sceneWardrobe');
        var specsRoot = document.getElementById('sceneSpecs');

        var playBtn = document.getElementById('btnPlay');
        var wardrobeBtn = document.getElementById('btnWardrobe');
        var tutorialBtn = document.getElementById('btnTutorial');
        var specsLink = document.getElementById('specsLink');

        var wardrobeBackBtn = document.getElementById('btnWardrobeBack');
        var skinPrevBtn = document.getElementById('btnSkinPrev');
        var skinNextBtn = document.getElementById('btnSkinNext');
        var skinPreview = document.getElementById('wardrobeSkinPreview');
        var skinTitle = document.getElementById('wardrobeSkinTitle');
        var skinStatus = document.getElementById('wardrobeSkinStatus');
        var selectCurrentSkinBtn = document.getElementById('btnSelectCurrentSkin');

        var weaponPrevBtn = document.getElementById('btnWeaponPrev');
        var weaponNextBtn = document.getElementById('btnWeaponNext');
        var weaponPreview = document.getElementById('wardrobeWeaponPreview');
        var weaponTitle = document.getElementById('wardrobeWeaponTitle');
        var weaponStatus = document.getElementById('wardrobeWeaponStatus');
        var selectCurrentWeaponBtn = document.getElementById('btnSelectCurrentWeapon');

        var specsBackBtn = document.getElementById('btnSpecsBack');

        var medusaSkins = [
            {
                name: 'Skin Verde',
                src: 'images/bueno.png',
                unlockMinScore: 0,
                lockedText: 'Siempre disponible.',
                unlockedText: 'Siempre disponible.'
            },
            {
                name: 'Skin 2',
                src: 'images/skin2.png',
                unlockMinScore: 70,
                lockedText: 'Bloqueada: alcanza 70 puntos para desbloquear.',
                unlockedText: 'Desbloqueada: puntuacion 70+ alcanzada.'
            }
        ];

        var weaponSkins = [
            {
                name: 'Arma Default',
                src: 'images/disparo_bueno.png'
            },
            {
                name: 'Arma Medusa',
                src: 'images/skin_arma_medusa.png'
            }
        ];

        var medusaIndex = 0;
        var weaponIndex = 0;

        var selectedSkin = 'images/bueno.png';
        var selectedWeaponSkin = 'images/disparo_bueno.png';

        function getBestStoredScore() {
            if (options.getBestScore) {
                return options.getBestScore();
            }
            return 0;
        }

        function isMedusaSkinUnlocked(skinConfig) {
            return getBestStoredScore() >= (skinConfig.unlockMinScore || 0);
        }

        function refreshMedusaSkinState() {
            var currentSkin = medusaSkins[medusaIndex];
            var unlocked = isMedusaSkinUnlocked(currentSkin);

            if (skinPreview) {
                skinPreview.src = currentSkin.src;
            }
            if (skinTitle) {
                skinTitle.textContent = currentSkin.name;
            }
            if (skinStatus) {
                skinStatus.textContent = unlocked ? currentSkin.unlockedText : currentSkin.lockedText;
            }
            if (selectCurrentSkinBtn) {
                if (!unlocked) {
                    selectCurrentSkinBtn.disabled = true;
                    selectCurrentSkinBtn.textContent = 'Bloqueada';
                } else {
                    selectCurrentSkinBtn.disabled = false;
                    selectCurrentSkinBtn.textContent = selectedSkin === currentSkin.src ? 'Seleccionada' : 'Seleccionar medusa';
                }
            }
        }

        function refreshWeaponSkinState() {
            var currentWeapon = weaponSkins[weaponIndex];
            if (weaponPreview) {
                weaponPreview.src = currentWeapon.src;
            }
            if (weaponTitle) {
                weaponTitle.textContent = currentWeapon.name;
            }
            if (weaponStatus) {
                weaponStatus.textContent = 'Disponible.';
            }
            if (selectCurrentWeaponBtn) {
                selectCurrentWeaponBtn.disabled = false;
                selectCurrentWeaponBtn.textContent = selectedWeaponSkin === currentWeapon.src ? 'Seleccionada' : 'Seleccionar arma';
            }
        }

        function refreshWardrobeState() {
            refreshMedusaSkinState();
            refreshWeaponSkinState();
        }

        function showMenuRoot() {
            if (menuRoot) {
                menuRoot.classList.add('is-active');
            }
            if (wardrobeRoot) {
                wardrobeRoot.classList.remove('is-active');
            }
            if (specsRoot) {
                specsRoot.classList.remove('is-active');
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

        function showSpecs() {
            if (menuRoot) {
                menuRoot.classList.remove('is-active');
            }
            if (specsRoot) {
                specsRoot.classList.add('is-active');
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
                if (options.onTutorial) {
                    options.onTutorial();
                }
            });
        }
        if (specsLink) {
            specsLink.addEventListener('click', function (event) {
                event.preventDefault();
                if (options.canOpenSidebarLinks && !options.canOpenSidebarLinks()) {
                    return;
                }
                showSpecs();
            });
        }
        if (wardrobeBackBtn) {
            wardrobeBackBtn.addEventListener('click', function () {
                showMenuRoot();
            });
        }
        if (specsBackBtn) {
            specsBackBtn.addEventListener('click', function () {
                showMenuRoot();
            });
        }
        if (skinPrevBtn) {
            skinPrevBtn.addEventListener('click', function () {
                medusaIndex = (medusaIndex - 1 + medusaSkins.length) % medusaSkins.length;
                refreshMedusaSkinState();
            });
        }
        if (skinNextBtn) {
            skinNextBtn.addEventListener('click', function () {
                medusaIndex = (medusaIndex + 1) % medusaSkins.length;
                refreshMedusaSkinState();
            });
        }
        if (selectCurrentSkinBtn) {
            selectCurrentSkinBtn.addEventListener('click', function () {
                var currentSkin = medusaSkins[medusaIndex];
                if (!isMedusaSkinUnlocked(currentSkin)) {
                    return;
                }
                selectedSkin = currentSkin.src;
                refreshMedusaSkinState();
                if (options.onSelectSkin) {
                    options.onSelectSkin(selectedSkin);
                }
            });
        }

        if (weaponPrevBtn) {
            weaponPrevBtn.addEventListener('click', function () {
                weaponIndex = (weaponIndex - 1 + weaponSkins.length) % weaponSkins.length;
                refreshWeaponSkinState();
            });
        }
        if (weaponNextBtn) {
            weaponNextBtn.addEventListener('click', function () {
                weaponIndex = (weaponIndex + 1) % weaponSkins.length;
                refreshWeaponSkinState();
            });
        }
        if (selectCurrentWeaponBtn) {
            selectCurrentWeaponBtn.addEventListener('click', function () {
                selectedWeaponSkin = weaponSkins[weaponIndex].src;
                refreshWeaponSkinState();
                if (options.onSelectWeaponSkin) {
                    options.onSelectWeaponSkin(selectedWeaponSkin);
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
            if (specsRoot) {
                specsRoot.classList.remove('is-active');
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
