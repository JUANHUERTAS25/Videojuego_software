// Utilidad para ciclo principal
(function (global) {
    global.GameLoop = {
        run: function (tickFn) {
            function anim() {
                tickFn();
                window.requestAnimFrame(anim);
            }
            anim();
        }
    };
})(window);
