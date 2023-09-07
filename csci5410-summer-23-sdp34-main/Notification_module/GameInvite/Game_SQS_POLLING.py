import json
import boto3

# Create an SNS client instance
sns = boto3.client('sns')

# Function to send a notification to a user via SNS
def NotifcationConfiguration(user_id, message):
    payload = {
        'user_id': user_id,
        'message': message
    }
    
    # SNS topic ARN to publish the message
    topic_arn = 'arn:aws:sns:us-east-1:867792720108:Game_Send_Notification'
    
    message = json.dumps(payload)
    
    # Publish the message to the specified SNS topic
    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )
    print("payload sent")
    
    return response
    
    
def lambda_handler(event, context):
    # Loop through each record in the event
    for record in event['Records']:
        
        # Parse the payload from the SQS message body
        payload = json.loads(record['body'])
            
        if 'Type' in payload and 'Message' in payload:
            
            # Check if it's a 'Game Availablity' type payload
            sns_message = payload['Message']
            if 'GameId' in sns_message and 'message' in sns_message and 'user_id' in sns_message:
                sns_message_game = payload['Message']
                sns_payload_game = json.loads(sns_message_game)
                
                # Extract relevant data from the payload
                GameId = sns_payload_game['GameId']
                user_id = sns_payload_game['user_id']
                message = sns_payload_game['message']
                print(f"Type Game Availablity payload: Game ID: {GameId}, User ID: {user_id}, Message: {message}")
                
                # Send the notification to the specified user
                response = NotifcationConfiguration(user_id, message)
                print(response)
                
            else:
                # It's a 'Game Invite' type payload
                sns_payload = json.loads(sns_message)
                sender_id = sns_payload['SenderId']
                sender_name = sns_payload['SenderName']
                receiver_id = sns_payload['RecieverId']
                message = sns_payload['message']
                
                print(f"Type 1 payload: Sender ID: {sender_id}, Sender Name: {sender_name}, Receiver ID: {receiver_id}, Message: {message}")
                
                # Send the notification to the specified receiver
                response = NotifcationConfiguration(receiver_id, message)
                print(response)
                print("message sent it to final queue")
        
        else:
            print("Invalid payload format")
            continue
        
        # Delete the processed message from the SQS queue
        sqs = boto3.client('sqs')
        receipt_handle = record['receiptHandle']
        eventSourceARN= record['eventSourceARN']
        queue_name = eventSourceARN.split(":")[-1].strip('"}')
        queue_url = "https://sqs.us-east-1.amazonaws.com/867792720108/"+queue_name
         
        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)

    return {
        'statusCode': 200,
        'body': 'Lambda execution completed'
    }
