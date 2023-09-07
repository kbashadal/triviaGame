import json
import os
from google.cloud import firestore
from google.cloud import pubsub_v1

# Function to get a list of team member IDs based on the team ID
def get_team_member_ids(team_id):
    # Creating a Firestore client
    db = firestore.Client()

    # Creating a reference to the document with the given team_id in the 'teamCollection' collection
    doc_ref = db.collection('teamCollection').document(str(team_id))
    doc = doc_ref.get()
    # Check if the document exists
    if doc.exists:
        # Converting the document data to a Python dictionary
        data = doc.to_dict()
        # Checking if the 'TeamMembers' field exists in the document
        if 'TeamMembers' in data:
            # If the field exists, get the list of team members
            team_members_list = data['TeamMembers']
            return team_members_list
        else:
            # If the 'TeamMembers' field does not exist, return an empty list
            return []
    else:
        # If the document with the given team_id does not exist, return an empty list
        return []


# Create the Pub/Sub clients
subscriber = pubsub_v1.SubscriberClient()
publisher = pubsub_v1.PublisherClient()

# Set the Pub/Sub topic name
topic_name = 'projects/trivia-game-5410/topics/LeaderboardUpdate'
subscription_path = 'projects/trivia-game-5410/subscriptions/LeaderboardUpdate-sub'

def hello_world(request):
    payload = request.get_json()
    print(payload)

    for entry in payload:
        name = entry['name']
        rank = entry['rank']
        recieverId = entry.get('team_id', entry.get('player_id'))

        print("Name:", name)
        print("Rank:", rank)
        print("RecieverId:", recieverId)

        if 'team_id' in entry:
            member_ids = get_team_member_ids(recieverId)
            print(member_ids)
            print("Team Member IDs:", member_ids)
            
            for member_id in member_ids:

                # message format to be sent
                notification_message = {
                    'message' : f"Leaderboard has changed. {name}, your team are now in rank {rank}!"
                }

                payload_to_topic = {
                    'message': notification_message,
                    'name': name,
                    'receiverId': member_id,
                }

                # Publish the payload as JSON to the Pub/Sub topic
                publisher.publish(topic_name, json.dumps(payload_to_topic).encode('utf-8'),subscription=subscription_path)

                # Return a response indicating the function executed successfully
                print("Payload published to Pub/Sub topic, team leaderboard")

        else:

            notification_message = {
                    'message' : f"Leaderboard has changed. {name}, you are now in rank {rank}!"
                }

            payload_to_topic = {
                'message': notification_message,
                'name': name,
                'receiverId': recieverId,
            }

            # Publish the payload as JSON to the Pub/Sub topic
            publisher.publish(topic_name, json.dumps(payload_to_topic).encode('utf-8'), subscription=subscription_path)

            # Return a response indicating the function executed successfully
            print("Payload published to Pub/Sub topic")


    return "payload sent to pub/sub"
