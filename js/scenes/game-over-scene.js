(function (global) {
    function create(options) {
        var root = document.getElementById('sceneGameOver');
        var homeBtn = document.getElementById('btnGameOverHome');
        var restartBtn = document.getElementById('btnGameOverRestart');

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

        function show() {
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

    global.GameOverScene = {
        create: create
    };
})(window);
