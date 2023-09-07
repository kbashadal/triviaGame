import json
import os
import boto3
from google.cloud import firestore
from google.cloud import pubsub_v1


def get_team_name(team_id):
    # Initialize the Firestore client
    db = firestore.Client()

    # Reference the collection and query for the team with the given ID
    doc_ref = db.collection('teamCollection').document(team_id)
    doc = doc_ref.get()
    if doc.exists:
        team_name = str(doc.to_dict()['Name'])
        return team_name    
    else:
        print("No such document!")
        return team_name

def hello_firestore(event, context):
    # Extract event data
    event_data = event['value']['fields']
    senderId = event_data['SenderId']['integerValue']
    recieverId = event_data['ReceiverID']['integerValue']
    teamId = event_data['TeamID']['integerValue']
    status = event_data['Status']['booleanValue']

    # Construct the payload
    data = {
        'senderId': senderId,
        'recieverId': recieverId,
        'teamId': teamId
    }

    print(data)

    # Retrieve team name from Firestore
    teamName = get_team_name(teamId)
    print(teamName)

    # Retrieve AWS credentials from environment variables
    access_key_id = os.environ['AWS_ACCESS_KEY_ID']
    secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
    region = 'us-east-1'

    # Create DynamoDB client
    db_client = boto3.client('dynamodb', region_name='us-east-1')
    table_name = 'userTable'
    
    # Retrieve sender's name from DynamoDB
    sender_key = {
        'user_id': {'N': str(senderId)}
    }
    sender_response = db_client.get_item(
        TableName=table_name,
        Key=sender_key
    )

    print(sender_response)

    # Check if the item was found
    if 'Item' in sender_response:
        # Extract the name from the item
        sender_name = sender_response['Item']['username']['S']
        print('Name:', sender_name)
    else:
        print('Sender not found')

    message_payload = {
        'message' : f"{sender_name} has invited you to join the team {teamName}",
        'teamId' : teamId
    }

    print(message_payload)

    # Create the Pub/Sub clients
    subscriber = pubsub_v1.SubscriberClient()
    publisher = pubsub_v1.PublisherClient()

    # Set the Pub/Sub topic name
    topic_name = 'projects/trivia-game-5410/topics/TeamInvite'
    subscription_path = 'projects/trivia-game-5410/subscriptions/TeamInvite-sub'

    payload = {
        'message': message_payload,
        'senderId': senderId,
        'recieverId': recieverId
    }

    # Publish the payload as JSON to the Pub/Sub topic
    publisher.publish(topic_name, json.dumps(payload).encode('utf-8'), subscription=subscription_path)

    # Return a response indicating the function executed successfully
    print("Payload published to Pub/Sub topic")




