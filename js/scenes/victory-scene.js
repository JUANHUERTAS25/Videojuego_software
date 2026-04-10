// Escena de victoria (esqueleto de migracion)
(function (global) {
    global.VictoryScene = {
        render: function (ctx, canvas, totalScore) {
            ctx.fillStyle = 'rgb(204,50,153)';
            ctx.font = 'bold 22px Arial';
            ctx.fillText('Enhorabuena, te has pasado el juego!', canvas.width / 2 - 200, canvas.height / 2 - 30);
            ctx.fillText('PUNTUACION TOTAL: ' + totalScore, canvas.width / 2 - 200, canvas.height / 2 + 30);
        }
    };
})(window);
