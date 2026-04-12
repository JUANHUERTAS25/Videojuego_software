(function (global) {
    function create(options) {
        var totalBestScoresToShow = options.totalBestScoresToShow || 5;

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

        function getAllScores() {
            var all = [];
            var i;
            for (i = 0; i < localStorage.length; i++) {
                all[i] = localStorage.getItem(localStorage.key(i));
            }
            return all;
        }

        function getBestScoreKeys() {
            var bestScores = getAllScores();
            bestScores.sort(function (a, b) {
                return b - a;
            });
            bestScores = bestScores.slice(0, totalBestScoresToShow);

            var bestScoreKeys = [];
            var j;
            for (j = 0; j < bestScores.length; j++) {
                var score = bestScores[j];
                var i;
                for (i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (parseInt(localStorage.getItem(key), 10) === parseInt(score, 10)) {
                        bestScoreKeys.push(key);
                    }
                }
            }

            return bestScoreKeys.slice(0, totalBestScoresToShow);
        }

        function addListElement(list, content, className) {
            var element = document.createElement('li');
            if (className) {
                element.setAttribute('class', className);
            }
            element.innerHTML = content;
            list.appendChild(element);
        }

        function clearList(list) {
            list.innerHTML = '';
            addListElement(list, 'Fecha');
            addListElement(list, 'Puntos');
        }

        function renderList(targetElementId) {
            var bestScores = getBestScoreKeys();
            var bestScoresList = document.getElementById(targetElementId);
            if (!bestScoresList) {
                return;
            }

            clearList(bestScoresList);
            var i;
            for (i = 0; i < bestScores.length; i++) {
                addListElement(bestScoresList, bestScores[i], i === 0 ? 'negrita' : null);
                addListElement(bestScoresList, localStorage.getItem(bestScores[i]), i === 0 ? 'negrita' : null);
            }
        }

        function containsElement(array, element) {
            var i;
            for (i = 0; i < array.length; i++) {
                if (array[i] === element) {
                    return true;
                }
            }
            return false;
        }

        function removeNoBestScores() {
            var scoresToRemove = [];
            var bestScoreKeys = getBestScoreKeys();
            var i;
            for (i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (!containsElement(bestScoreKeys, key)) {
                    scoresToRemove.push(key);
                }
            }

            var j;
            for (j = 0; j < scoresToRemove.length; j++) {
                localStorage.removeItem(scoresToRemove[j]);
            }
        }

        function saveScore(totalScore, targetElementId) {
            localStorage.setItem(getFinalScoreDate(), totalScore);
            renderList(targetElementId);
            removeNoBestScores();
        }

        return {
            renderList: renderList,
            saveScore: saveScore
        };
    }

    global.ScoreboardSystem = {
        create: create
    };
})(window);
