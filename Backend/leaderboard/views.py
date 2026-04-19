import json

from django.http import HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Score


def with_cors(response):
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


def top5_scores(request):
    if request.method == 'OPTIONS':
        return with_cors(JsonResponse({}, status=204))

    if request.method != 'GET':
        return with_cors(HttpResponseNotAllowed(['GET']))

    rows = Score.objects.order_by('-score', 'date')[:5]
    data = [
        {
            'nickname': row.nickname,
            'score': row.score,
            'player_id': row.player_id,
            'date': row.date.isoformat(),
        }
        for row in rows
    ]
    return with_cors(JsonResponse({'top5': data}, status=200))


@csrf_exempt
def save_score(request):
    if request.method == 'OPTIONS':
        return with_cors(JsonResponse({}, status=204))

    if request.method != 'POST':
        return with_cors(HttpResponseNotAllowed(['POST']))

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return with_cors(JsonResponse({'error': 'JSON invalido.'}, status=400))

    nickname = str(payload.get('nickname', '')).strip()
    player_id = str(payload.get('player_id', '')).strip()
    raw_score = payload.get('score', None)

    if not nickname or not player_id or raw_score is None:
        return with_cors(JsonResponse(
            {'error': 'nickname, player_id y score son obligatorios.'},
            status=400,
        ))

    if len(nickname) > 32:
        return with_cors(JsonResponse({'error': 'nickname demasiado largo (max 32).'}, status=400))

    try:
        score_value = int(raw_score)
    except (TypeError, ValueError):
        return with_cors(JsonResponse({'error': 'score debe ser un entero.'}, status=400))

    if score_value < 0:
        score_value = 0

    existing = Score.objects.filter(nickname__iexact=nickname).first()

    if existing:
        if existing.player_id != player_id:
            return with_cors(JsonResponse(
                {'error': 'Este nickname ya esta en uso por otro jugador.'},
                status=403,
            ))

        updated = False
        if score_value > existing.score:
            existing.score = score_value
            existing.save(update_fields=['score', 'date'])
            updated = True

        return with_cors(JsonResponse(
            {
                'message': 'Puntaje procesado.',
                'nickname': existing.nickname,
                'score': existing.score,
                'updated': updated,
            },
            status=200,
        ))

    created = Score.objects.create(
        nickname=nickname,
        score=score_value,
        player_id=player_id,
    )
    return with_cors(JsonResponse(
        {
            'message': 'Jugador registrado en leaderboard.',
            'nickname': created.nickname,
            'score': created.score,
            'updated': True,
        },
        status=201,
    ))
