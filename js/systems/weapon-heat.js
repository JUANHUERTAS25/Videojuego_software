(function (global) {
    function create(config) {
        var settings = config || {};
        var maxHeat = settings.maxHeat || 100;
        var heatPerShot = settings.heatPerShot || 12;
        var coolRateIdle = settings.coolRateIdle || 26;
        var coolRateHoldingFire = settings.coolRateHoldingFire || 10;
        var overheatLockMs = settings.overheatLockMs || 1400;
        var unlockHeatRatio = settings.unlockHeatRatio || 0.35;

        var heat = 0;
        var overheatUntil = 0;

        function update(state) {
            var deltaSec = state.deltaSec || 0;
            var isFiring = !!state.isFiring;
            var coolRate = isFiring ? coolRateHoldingFire : coolRateIdle;
            heat = Math.max(0, heat - (coolRate * deltaSec));

            // Si el lock de sobrecalentamiento acaba y el calor ya bajo suficiente,
            // el arma vuelve a estar operativa.
            if (state.nowMs >= overheatUntil && heat <= (maxHeat * unlockHeatRatio)) {
                overheatUntil = 0;
            }
        }

        function canShoot(nowMs) {
            return nowMs >= overheatUntil;
        }

        function onShot(nowMs, heatMultiplier) {
            var multiplier = heatMultiplier || 1;
            heat += heatPerShot * multiplier;
            if (heat >= maxHeat) {
                heat = maxHeat;
                overheatUntil = nowMs + overheatLockMs;
            }
        }

        function getHeatRatio() {
            return Math.max(0, Math.min(1, heat / maxHeat));
        }

        function isOverheated(nowMs) {
            return nowMs < overheatUntil;
        }

        function drawHud(ctx, nowMs, x, y) {
            var width = 110;
            var height = 10;
            var border = 1;
            var ratio = getHeatRatio();

            var color = '#20c7ff';
            if (ratio >= 0.67) {
                color = '#ff3b30';
            } else if (ratio >= 0.34) {
                color = '#ff9f0a';
            }

            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(x, y, width, height);
            ctx.fillStyle = 'rgba(70,70,70,0.9)';
            ctx.fillRect(x + border, y + border, width - (border * 2), height - (border * 2));
            ctx.fillStyle = color;
            ctx.fillRect(x + border, y + border, (width - (border * 2)) * ratio, height - (border * 2));

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Arial';
            ctx.fillText('Calor', x, y - 4);

            if (isOverheated(nowMs)) {
                ctx.fillStyle = '#ff3b30';
                ctx.font = 'bold 14px Arial';
                ctx.fillText('SOBRECALENTADO', x - 4, y + 26);
            }
        }

        return {
            update: update,
            canShoot: canShoot,
            onShot: onShot,
            drawHud: drawHud,
            isOverheated: isOverheated
        };
    }

    global.WeaponHeatSystem = {
        create: create
    };
})(window);
