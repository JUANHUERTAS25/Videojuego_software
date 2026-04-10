// Escena de inicio (esqueleto de migracion)
(function (global) {
    global.StartScreenScene = {
        render: function (ctx, canvas) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.fillText('Presiona ESPACIO para iniciar', 100, canvas.height / 2);
        }
    };
})(window);
