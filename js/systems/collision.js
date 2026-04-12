(function (global) {
    function isRectOverlap(a, b) {
        return (
            a.posX < b.posX + b.width &&
            a.posX + a.width > b.posX &&
            a.posY < b.posY + b.height &&
            a.posY + a.height > b.posY
        );
    }

    function isPointInsideRect(x, y, rect) {
        return x >= rect.posX && x <= (rect.posX + rect.width) &&
            y >= rect.posY && y <= (rect.posY + rect.height);
    }

    function isEnemyHittingPlayer(enemyRect, playerRect) {
        return ((enemyRect.posY + enemyRect.height) > playerRect.posY &&
            (playerRect.posY + playerRect.height) >= enemyRect.posY) &&
            ((playerRect.posX >= enemyRect.posX && playerRect.posX <= (enemyRect.posX + enemyRect.width)) ||
                ((playerRect.posX + playerRect.width) >= enemyRect.posX && (playerRect.posX + playerRect.width) <= (enemyRect.posX + enemyRect.width)));
    }

    global.CollisionSystem = {
        isRectOverlap: isRectOverlap,
        isPointInsideRect: isPointInsideRect,
        isEnemyHittingPlayer: isEnemyHittingPlayer
    };
})(window);
