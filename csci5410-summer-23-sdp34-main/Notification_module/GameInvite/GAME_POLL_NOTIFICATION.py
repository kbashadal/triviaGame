import json
import boto3

lambda_client = boto3.client('lambda')

headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "Content-Type",
}


def lambda_handler(event, context):
    query_params = event['queryStringParameters']
    userId = int(query_params['userId'])
    print("query paramater is ",userId)

    sqs = boto3.client('sqs')
    queue_url = 'https://sqs.us-east-1.amazonaws.com/867792720108/GameNotificationQueue'

    user_messages = []

    # Long polling loop
    while True:
        response = sqs.receive_message(
            QueueUrl=queue_url,
            AttributeNames=['All'],
            MessageAttributeNames=['All'],
            MaxNumberOfMessages=10,  # Retrieve up to 10 messages at a time
            WaitTimeSeconds=10  # Set the WaitTimeSeconds parameter to enable long polling
        )
        

        print(f"response is {response}")
        
        if 'Messages' in response:
            for message in response['Messages']:
                
               
                # Process the received message
                message_body = json.loads(message['Body'])
                print(f"message_body is {message_body}")
                
                payload = json.loads(message_body['Message'])
                print(f"payload is {payload}")
                
                receiver_id = int(payload['user_id'])
                print(f"receiver_id is {receiver_id}")
                
                delivery_message = payload['message']
                print(f"delivery_message is {delivery_message}")
                
                message_struct = {
                    'message': delivery_message
                }
                

                # Check if the message is intended for the specified user
                if receiver_id == userId:
                    
                    print("Going inside the if condition.")
                    user_messages.append(message_struct)
                    print(f"Added to the list: {message_struct}")

                    print(f"added to the list {message_struct}")
                    
                    payload_to_sent = {
                        'notification' : user_messages
                    }

                    # Delete the message from the queue
                    sqs.delete_message(
                        QueueUrl=queue_url,
                        ReceiptHandle=message['ReceiptHandle']
                    )

        # Check if there are more messages to process or break the loop
        if 'Messages' not in response or not response['Messages']:
            break
        
    print(user_messages)

    if user_messages:
        # Return all the user messages as the response
        return {
        'statusCode': 200,
        'headers': headers,  
        'body': json.dumps(payload_to_sent)
        }

    # No messages for the specified user in the queue
    return {
        'statusCode': 400,
        'headers': headers,  # Corrected property name
        'body': 'No new messages.'
        }

