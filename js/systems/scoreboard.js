// Sistema de puntuaciones/localStorage (esqueleto de migracion)
(function (global) {
    function fillZero(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    function getFinalScoreDate() {
        var date = new Date();
        return fillZero(date.getDay() + 1) + '/' +
            fillZero(date.getMonth() + 1) + '/' +
            date.getFullYear() + ' ' +
            fillZero(date.getHours()) + ':' +
            fillZero(date.getMinutes()) + ':' +
            fillZero(date.getSeconds());
    }

    global.ScoreboardSystem = {
        getFinalScoreDate: getFinalScoreDate
    };
})(window);
