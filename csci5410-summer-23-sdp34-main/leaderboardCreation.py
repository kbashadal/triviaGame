import json
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import firestore
import requests
from google.cloud.firestore_v1 import ArrayRemove, ArrayUnion
import functions_framework

firebase_admin.initialize_app()
db = firestore.client()

def hello_http(request):
    if request.method == 'GET':
        print(request)
        category = request.args.get('category', default=None)
        print(category)
        time_frame = request.args.get('time_frame', default=None)
        print(time_frame)

        entity_type = request.args.get('entity_type')
        entity_name = request.args.get('entity_name')

        print(entity_type)
        print(entity_name)

        leaderboard_ref = db.collection('leaderboard')

        filter_conditions = [('entity_type', '==', entity_type)]

        if category != "-1":
            filter_conditions.append(('category', '==', category))

        current_time = datetime.now()
        current_time = datetime(current_time.year, current_time.month, current_time.day)
        if time_frame == 'daily':
            create_date = current_time
        elif time_frame == 'weekly':
            create_date = current_time - timedelta(days=current_time.weekday())
        elif time_frame == 'monthly':
            create_date = current_time.replace(day=1)
        else:
            create_date = None

        if create_date is not None:
            # Convert the create_date to epoch format for comparison
            create_date_epoch = int(create_date.timestamp())
            filter_conditions.append(('create_time', '>=', create_date_epoch))

        if entity_name is not None:
            filter_conditions.append(('entity_name', '==', entity_name))
            resultdata = get_entity_stats(leaderboard_ref, filter_conditions, entity_type)
            print(resultdata)
            return {
                'statusCode': 500,
                'body': json.dumps(resultdata),
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            }
        else:
            resultdata = get_leaderboard(leaderboard_ref, filter_conditions, entity_type)
            print(resultdata)
            return {
                'statusCode': 500,
                'body': json.dumps(resultdata),
                'headers': {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Content-Type"
                }
            }
    else:
        return 'Invalid HTTP method'

def get_leaderboard(collection_ref, filter_conditions, entity_type):
    query = collection_ref
    for field_path, op_string, value in filter_conditions:
        query = query.where(field_path, op_string, value)
    leaderboard_data = query.stream()
    entity_data = []
    for entity in leaderboard_data:
        score = entity.get('score')
        right_answers = entity.get('right_answers')
        wrong_answers = entity.get('wrong_answers')
        efficiency = (right_answers * 100) / (right_answers + wrong_answers) if right_answers > 0 or wrong_answers > 0 else 0

        entity_data.append({
            'id': entity.get('id'),  # Use the 'id' directly from the entity
            'name': entity.get('entity_name'),
            'total_score': score,
            'total_right_answers': right_answers,
            'total_wrong_answers': entity.get('wrong_answers'),
            'efficiency': efficiency
        })

    leaderboard_data = sorted(entity_data, key=lambda x: x['total_score'], reverse=True)
    if entity_type == 'team':
        store_team_ranks(leaderboard_data)  # No need to pass entity_ids dictionary
    elif entity_type == 'player':
        store_player_ranks(leaderboard_data)  # No need to pass entity_ids dictionary

    lambda_url = 'https://us-central1-glowing-reserve-390522.cloudfunctions.net/LeaderboardNotificationPayload'
    send_team_data_to_lambda(lambda_url)
    send_player_data_to_lambda(lambda_url)

    response = {
        'statusCode': 200,
        'body': json.dumps(leaderboard_data, default=str)
    }

    return response

def get_entity_stats(collection_ref, filter_conditions, entity_type):
    query = collection_ref

    for field_path, op_string, value in filter_conditions:
        query = query.where(field_path, op_string, value)

    entity_data = query.select(['entity_name', 'score', 'right_answers', 'wrong_answers', 'category', 'entity_type', 'create_time']).stream()

    response = {
        'statusCode': 200,
        'body': json.dumps([entity.to_dict() for entity in entity_data], default=str)
    }

    return response

def store_player_ranks(data):
    print(data)
    rank_collection_ref = db.collection('Player_Ranks')
    for index, entity in enumerate(data):
        rank = index + 1
        rank_entity = {
            'name': entity['name'],
            'rank': rank,
            'player_id': entity['id']  # Store the 'id' from the leaderboard data as player_id
        }

        existing_entity_query = rank_collection_ref.where('name', '==', entity['name']).limit(1).get()
        if existing_entity_query:
            existing_entity_id = existing_entity_query[0].id
            rank_collection_ref.document(existing_entity_id).update(rank_entity)
        else:
            rank_collection_ref.add(rank_entity)


def store_team_ranks(data):
    rank_collection_ref = db.collection('Team_Ranks')
    for index, entity in enumerate(data):
        rank = index + 1
        rank_entity = {
            'name': entity['name'],
            'rank': rank,
            'team_id': entity['id']  # Store the 'id' from the leaderboard data as team_id
        }

        existing_entity_query = rank_collection_ref.where('name', '==', entity['name']).limit(1).get()
        if existing_entity_query:
            existing_entity_id = existing_entity_query[0].id
            rank_collection_ref.document(existing_entity_id).update(rank_entity)
        else:
            rank_collection_ref.add(rank_entity)

def send_player_data_to_lambda(lambda_url):
    rank_collection_ref = db.collection('Player_Ranks')
    rank_data = rank_collection_ref.order_by('rank').limit(3).stream()

    data_to_send = []
    for entity in rank_data:
        data_to_send.append({
            'player_id': entity.get('player_id'),
            'name': entity.get('name'),
            'rank': entity.get('rank')
        })

    headers = {'Content-type': 'application/json'}
    response = requests.post(lambda_url, data=json.dumps(data_to_send), headers=headers)
    return response

def send_team_data_to_lambda(lambda_url):
    rank_collection_ref = db.collection('Team_Ranks')
    rank_data = rank_collection_ref.order_by('rank').limit(3).stream()

    data_to_send = []
    for entity in rank_data:
        data_to_send.append({
            'team_id': entity.get('team_id'),
            'name': entity.get('name'),
            'rank': entity.get('rank')
        })

    headers = {'Content-type': 'application/json'}
    response = requests.post(lambda_url, data=json.dumps(data_to_send), headers=headers)
    return response