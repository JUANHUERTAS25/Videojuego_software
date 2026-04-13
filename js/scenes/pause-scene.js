(function (global) {
    function create(options) {
        var root = document.getElementById('scenePause');
        var resumeBtn = document.getElementById('btnPauseResume');
        var homeBtn = document.getElementById('btnPauseHome');

        if (resumeBtn) {
            resumeBtn.addEventListener('click', function () {
                options.onResume();
            });
        }
        if (homeBtn) {
            homeBtn.addEventListener('click', function () {
                options.onHome();
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

    global.PauseScene = {
        create: create
    };
})(window);