// Estado compartido del juego
(function (global) {
    global.GameState = {
        canvas: null,
        ctx: null,
        buffer: null,
        bufferctx: null,
        player: null,
        evil: null,
        evilCounter: 0,
        youLoose: false,
        congratulations: false,
        nextPlayerShot: 0,
        now: 0,
        playerShotsBuffer: [],
        evilShotsBuffer: [],
        keyPressed: {}
    };
})(window);
