(function (global) {
    function create() {
        var smoothLifeByEnemy = new WeakMap();

        function drawEnemyBar(ctx, enemy, options) {
            if (!enemy || enemy.dead) {
                return;
            }

            var maxLife = enemy.maxLife || enemy.life || 1;
            var currentLife = Math.max(0, enemy.life || 0);
            var smoothLife = smoothLifeByEnemy.get(enemy);

            if (typeof smoothLife !== 'number') {
                smoothLife = currentLife;
            }

            // Transicion suave hacia la vida real.
            smoothLife += (currentLife - smoothLife) * 0.2;
            if (Math.abs(currentLife - smoothLife) < 0.01) {
                smoothLife = currentLife;
            }
            smoothLifeByEnemy.set(enemy, smoothLife);

            var width = (options && options.width) || enemy.image.width;
            var height = (options && options.height) || 8;
            var yOffset = (options && options.yOffset) || 12;
            var border = (options && options.border) || 1;

            var x = enemy.posX;
            var y = enemy.posY - yOffset;
            var ratio = Math.max(0, Math.min(1, smoothLife / maxLife));
            var fillWidth = Math.max(0, (width - border * 2) * ratio);

            // Sombra suave de fondo.
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetY = 1;

            // Marco y fondo.
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = 'rgba(60, 60, 60, 0.9)';
            ctx.fillRect(x + border, y + border, width - border * 2, height - border * 2);

            // Barra roja (vida actual con suavizado).
            var gradient = ctx.createLinearGradient(x, y, x, y + height);
            gradient.addColorStop(0, '#ff4d4d');
            gradient.addColorStop(1, '#c41010');
            ctx.fillStyle = gradient;
            ctx.fillRect(x + border, y + border, fillWidth, height - border * 2);

            ctx.restore();
        }

        function clearEnemy(enemy) {
            if (enemy) {
                smoothLifeByEnemy.delete(enemy);
            }
        }

        return {
            drawEnemyBar: drawEnemyBar,
            clearEnemy: clearEnemy
        };
    }

    global.HealthBarSystem = {
        create: create
    };
})(window);
