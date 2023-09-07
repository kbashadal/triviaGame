import json
import os
from google.cloud import firestore
from google.cloud import pubsub_v1

subscriber = pubsub_v1.SubscriberClient()
subscription_path = 'projects/trivia-game-5410/subscriptions/LeaderboardUpdate-sub'

headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type",
}

def hello_world(request):
    # Get the value of the 'userId' query parameter
    user_ids = request.args.get('userId')
    user_id = int(user_ids)

    # Print the value
    print('User ID:', user_id)

    # Poll messages from Pub/Sub with a timeout of 40 seconds
    received_messages = []
    ack_ids_to_acknowledge = [] 

    response = subscriber.pull(
        request={
            'subscription': subscription_path,
            'max_messages': 10,
            'return_immediately': True,
        }
    )

    if not response.received_messages:
        # No messages in the queue
        return 'No messages in the queue'

    # Process the received messages
    for message in response.received_messages:
        message_data = message.message.data
        message_attributes = message.message.attributes

        # Process the message as needed
        print('Message data:', message_data)
        # print('Message attributes:', message_attributes)

        # Decode bytes data to string
        decoded_data = message_data.decode('utf-8')

        # Parse the JSON message
        parsed_message = json.loads(decoded_data)

        # Access the desired fields
        message_text = parsed_message.get('message')
        name = parsed_message.get('name')
        receiver_id_str = parsed_message.get('receiverId')
        receiver_id = int(receiver_id_str)

        # Process the extracted fields as needed
        print('name:', name)
        print('receiver_id:', receiver_id)
        print('Message:', message_text)

        # Check if the receiverId matches the user_id
        if receiver_id == user_id:
            # Send the message to the respective user
            print(f'Sending message to user {receiver_id}: {message_text}')

            # Append the message data to the list
            received_messages.append(message_text)

            payload_to_sent = {
                'notification' : received_messages
            }

            # Add the acknowledgment ID to the list for later acknowledgement
            ack_ids_to_acknowledge.append(message.ack_id)

    if received_messages:
        # Acknowledge the relevant messages
        subscriber.acknowledge(
            request={
                'subscription': subscription_path,
                'ack_ids': ack_ids_to_acknowledge,
            }
        )

        # Return the received messages as a JSON response
        print(payload_to_sent)
        final_payload = json.dumps(payload_to_sent)
        return final_payload, 200, headers
        
    # No new messages in the queue
    return 'No messages for the given user ID', 400, headers
