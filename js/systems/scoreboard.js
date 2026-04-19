(function (global) {
    function create(options) {
        var totalBestScoresToShow = options.totalBestScoresToShow || 5;
        var storageKey = options.storageKey || 'jellyshoot_scores';
        var backendBaseUrl = options.backendBaseUrl || 'http://127.0.0.1:8000';
        var playerIdStorageKey = options.playerIdStorageKey || 'jellyshoot_player_id';
        var nicknameStorageKey = options.nicknameStorageKey || 'jellyshoot_player_nickname';
        var bestScoreCache = 0;

        var saveEndpoint = backendBaseUrl.replace(/\/$/, '') + '/api/scores/save/';
        var top5Endpoint = backendBaseUrl.replace(/\/$/, '') + '/api/scores/top5/';

        function normalizeName(name) {
            var safeName = (name || '').toString().trim().toUpperCase();
            safeName = safeName.replace(/[^A-Z0-9]/g, '');
            if (!safeName) {
                return 'AAA';
            }
            return safeName.slice(0, 3);
        }

        function getOrCreatePlayerId() {
            var playerId = localStorage.getItem(playerIdStorageKey);
            if (!playerId) {
                if (global.crypto && typeof global.crypto.randomUUID === 'function') {
                    playerId = global.crypto.randomUUID();
                } else {
                    playerId = 'pid-' + Date.now() + '-' + Math.random().toString(16).slice(2);
                }
                localStorage.setItem(playerIdStorageKey, playerId);
            }
            return playerId;
        }

        function getStoredNickname() {
            return localStorage.getItem(nicknameStorageKey) || '';
        }

        function setStoredNickname(nickname) {
            localStorage.setItem(nicknameStorageKey, normalizeName(nickname));
        }

        function resolveNickname(preferredName) {
            var provided = normalizeName(preferredName);
            if (preferredName && provided) {
                setStoredNickname(provided);
                return provided;
            }

            var stored = normalizeName(getStoredNickname());
            if (stored && stored !== 'AAA') {
                return stored;
            }

            var prompted = global.prompt('Ingresa tu nickname de 3 caracteres para el leaderboard:', stored || 'AAA') || '';
            prompted = normalizeName(prompted);
            if (!prompted) {
                prompted = 'AAA';
            }
            setStoredNickname(prompted);
            return prompted;
        }

        function updateBestScoreCache(scores) {
            if (!scores || !scores.length) {
                bestScoreCache = 0;
                return;
            }
            bestScoreCache = Math.max(0, parseInt(scores[0].score, 10) || 0);
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
            if (bestScoreCache > 0) {
                return bestScoreCache;
            }
            var bestScores = getBestScores();
            if (!bestScores.length) {
                return 0;
            }
            updateBestScoreCache(bestScores);
            return bestScoreCache;
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

        function mapBackendRowsToLocalShape(rows) {
            var mapped = [];
            var i;
            for (i = 0; i < rows.length; i++) {
                mapped.push({
                    name: rows[i].nickname,
                    score: parseInt(rows[i].score, 10) || 0
                });
            }
            return mapped;
        }

        function persistFallbackScore(name, scoreValue) {
            var scores = getSavedScores();
            scores.push({
                name: normalizeName(name),
                score: parseInt(scoreValue, 10) || 0,
                createdAt: new Date().toISOString()
            });
            scores.sort(function (a, b) {
                return b.score - a.score;
            });
            scores = scores.slice(0, totalBestScoresToShow);
            persistScores(scores);
            updateBestScoreCache(scores);
        }

        function renderRows(targetElementId, rows) {
            var bestScoresList = document.getElementById(targetElementId);
            if (!bestScoresList) {
                return;
            }

            clearList(bestScoresList);
            var i;
            for (i = 0; i < rows.length; i++) {
                addListElement(bestScoresList, rows[i].name, i === 0 ? 'negrita' : null);
                addListElement(bestScoresList, rows[i].score, i === 0 ? 'negrita' : null);
            }
        }

        function fetchTop5FromBackend() {
            return fetch(top5Endpoint, {
                method: 'GET',
                mode: 'cors'
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error('No se pudo consultar Top 5');
                }
                return response.json();
            }).then(function (data) {
                return mapBackendRowsToLocalShape(data.top5 || []);
            });
        }

        function saveToBackend(name, scoreValue) {
            return fetch(saveEndpoint, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nickname: normalizeName(name),
                    score: parseInt(scoreValue, 10) || 0,
                    player_id: getOrCreatePlayerId()
                })
            }).then(function (response) {
                return response.json().then(function (payload) {
                    if (!response.ok) {
                        var backendError = new Error(payload.error || 'Error al guardar puntaje');
                        backendError.status = response.status;
                        throw backendError;
                    }
                    return payload;
                });
            });
        }

        function renderList(targetElementId) {
            fetchTop5FromBackend().then(function (rows) {
                updateBestScoreCache(rows);
                renderRows(targetElementId, rows);
            }).catch(function () {
                var fallbackRows = getBestScores();
                updateBestScoreCache(fallbackRows);
                renderRows(targetElementId, fallbackRows);
            });
        }

        function saveScore(totalScore, targetElementId, playerName) {
            var scoreValue = parseInt(totalScore, 10) || 0;
            var nickname = resolveNickname(playerName);

            saveToBackend(nickname, scoreValue).then(function () {
                renderList(targetElementId);
            }).catch(function (error) {
                if (error && error.status === 403) {
                    var retryName = global.prompt(
                        'Ese nickname ya esta en uso. Elige otro:',
                        normalizeName(nickname + '_1')
                    ) || '';
                    retryName = normalizeName(retryName);
                    if (retryName) {
                        setStoredNickname(retryName);
                        saveScore(scoreValue, targetElementId, retryName);
                    }
                    return;
                }

                // Fallback offline si el backend no esta disponible.
                persistFallbackScore(nickname, scoreValue);
                renderList(targetElementId);
            });
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
