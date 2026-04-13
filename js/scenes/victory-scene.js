(function (global) {
    function create(options) {
        var root = document.getElementById('sceneVictory');
        var scoreEl = document.getElementById('victoryScore');
        var homeBtn = document.getElementById('btnVictoryHome');
        var restartBtn = document.getElementById('btnVictoryRestart');

        if (homeBtn) {
            homeBtn.addEventListener('click', function () {
                options.onHome();
            });
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', function () {
                options.onRestart();
            });
        }

        function show(totalScore) {
            if (scoreEl) {
                scoreEl.textContent = 'Puntuacion total: ' + totalScore;
            }
            if (root) {
                root.classList.add('is-active');
            }
        }

        function hide() {
            if (root) {
                root.classList.remove('is-active');
            }
        }

        return {
            show: show,
            hide: hide
        };
    }

    global.VictoryScene = {
        create: create
    };
})(window);
