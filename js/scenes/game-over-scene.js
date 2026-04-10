// Escena de derrota (esqueleto de migracion)
(function (global) {
    global.GameOverScene = {
        render: function (ctx, canvas) {
            ctx.fillStyle = 'rgb(255,0,0)';
            ctx.font = 'bold 35px Arial';
            ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
        }
    };
})(window);
