(function (global) {
    function create(options) {
        var totalBestScoresToShow = options.totalBestScoresToShow || 5;
        var storageKey = options.storageKey || 'jellyshoot_scores';

        function normalizeName(name) {
            var safeName = (name || '').toString().trim();
            if (!safeName) {
                return 'Jugador';
            }
            return safeName.slice(0, 20);
        }

        function getSavedScores() {
            var raw = localStorage.getItem(storageKey);
            if (!raw) {
                return [];
            }
            try {
                var parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                return [];
            }
        }

        function persistScores(scores) {
            localStorage.setItem(storageKey, JSON.stringify(scores));
        }

        function getBestScores() {
            var scores = getSavedScores();
            scores.sort(function (a, b) {
                return b.score - a.score;
            });
            return scores.slice(0, totalBestScoresToShow);
        }

        function getBestScore() {
            var bestScores = getBestScores();
            if (!bestScores.length) {
                return 0;
            }
            return bestScores[0].score;
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
            addListElement(list, 'Jugador');
            addListElement(list, 'Puntos');
        }

        function renderList(targetElementId) {
            var bestScores = getBestScores();
            var bestScoresList = document.getElementById(targetElementId);
            if (!bestScoresList) {
                return;
            }

            clearList(bestScoresList);
            var i;
            for (i = 0; i < bestScores.length; i++) {
                addListElement(bestScoresList, bestScores[i].name, i === 0 ? 'negrita' : null);
                addListElement(bestScoresList, bestScores[i].score, i === 0 ? 'negrita' : null);
            }
        }

        function saveScore(totalScore, targetElementId, playerName) {
            var scores = getSavedScores();
            scores.push({
                name: normalizeName(playerName),
                score: parseInt(totalScore, 10) || 0,
                createdAt: new Date().toISOString()
            });
            scores.sort(function (a, b) {
                return b.score - a.score;
            });
            scores = scores.slice(0, totalBestScoresToShow);
            persistScores(scores);
            renderList(targetElementId);
        }

        return {
            renderList: renderList,
            saveScore: saveScore,
            getBestScore: getBestScore
        };
    }

    global.ScoreboardSystem = {
        create: create
    };
})(window);
