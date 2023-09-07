import json
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import firestore
import requests

# Initialize Firebase Admin SDK
firebase_admin.initialize_app()

# Get a Firestore client
db = firestore.client()

def hello_http(request):
    if request.method == 'POST':
        return store_leaderboard_data(request)
    else:
        return 'Invalid HTTP method'

def store_leaderboard_data(request):
    data = request.get_json()
    game = data.get('game')
    category = game.get('category')
    
    for team in game.get('teams', []):
        team_id = team.get('id')
        team_name = team.get('name')
        team_score = 0
        team_right_answers = 0
        team_wrong_answers = 0
        
        for member in team.get('members', []):
            player_id = member.get('id')
            player_name = member.get('name')
            player_score = member.get('score', 0)
            player_right_answers = member.get('right_answers', 0)
            player_wrong_answers = member.get('wrong_answers', 0)
            
            # Update team totals using the player's data
            team_score += player_score
            team_right_answers += player_right_answers
            team_wrong_answers += player_wrong_answers
            
            # Update or create player data in leaderboard collection
            player_ref = db.collection('leaderboard').where('entity_type', '==', 'player').where('entity_name', '==', player_name).limit(1).get()

            if player_ref:
                # If an entry already exists for the player, update the document with the new data
                doc_id = player_ref[0].id
                player_ref = db.collection('leaderboard').document(doc_id)
                player_ref.update({
                    'id': player_id,
                    'score': player_score,
                    'right_answers': player_right_answers,
                    'wrong_answers': player_wrong_answers,
                    'category': category,
                    'create_time': int(datetime.now().timestamp())
                })
                send_data_to_lambda('player', player_name, player_score)
            else:
                # If no entry exists, create a new document for the player
                player_document_id = str(uuid.uuid4())
                player_ref = db.collection('leaderboard').document(player_document_id)
                player_ref.set({
                    'id': player_id,
                    'entity_type': 'player',
                    'entity_name': player_name,
                    'score': player_score,
                    'right_answers': player_right_answers,
                    'wrong_answers': player_wrong_answers,
                    'category': category,
                    'create_time': int(datetime.now().timestamp())
                })
                send_data_to_lambda('player', player_name, player_score)
        
        # Update or create team data in leaderboard collection
        team_ref = db.collection('leaderboard').where('entity_type', '==', 'team').where('entity_name', '==', team_name).limit(1).get()

        if team_ref:
            # If an entry already exists for the team, update the document with the new data
            doc_id = team_ref[0].id
            team_ref = db.collection('leaderboard').document(doc_id)
            team_ref.update({
                'id': team_id,
                'score': team_score,
                'right_answers': team_right_answers,
                'wrong_answers': team_wrong_answers,
                'category': category,
                'create_time': int(datetime.now().timestamp())
            })
            send_data_to_lambda('team', team_name, team_score)
        else:
            # If no entry exists, create a new document for the team
            team_document_id = str(uuid.uuid4())
            team_ref = db.collection('leaderboard').document(team_document_id)
            team_ref.set({
                'id': team_id,
                'entity_type': 'team',
                'entity_name': team_name,
                'score': team_score,
                'right_answers': team_right_answers,
                'wrong_answers': team_wrong_answers,
                'category': category,
                'create_time': int(datetime.now().timestamp())
            })
            send_data_to_lambda('team', team_name, team_score)

    return 'Leaderboard data saved successfully'

def send_data_to_lambda(entity_type, entity_name, score):
    lambda_url = "https://jgq4ca67y3nxwauka7occbsmu40dpcbt.lambda-url.us-east-1.on.aws/"
    data_to_send = {
        "entity_type": entity_type,
        "entity_name": entity_name,
        "score": score
    }
    headers = {'Content-type': 'application/json'}
    response = requests.post(lambda_url, data=json.dumps(data_to_send), headers=headers)
    return response