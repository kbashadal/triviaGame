import json
import boto3


# Create an SNS client
sns = boto3.client('sns')
sqs = boto3.client('sqs')

def NotifcationConfiguration(user_id, message):
    # Prepare the payload for the notification
    payload = {
        'user_id': user_id,
        'message': message
    }
    
    # Define the SNS topic ARN to publish the message
    topic_arn = 'arn:aws:sns:us-east-1:867792720108:SendTeamUpdate'
    
    # Convert the payload to JSON format
    message = json.dumps(payload)
    
    # Publish the message to the specified topic
    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )
    print("Payload sent to SNS topic")
    
    return response
    
def lambda_handler(event, context):
    print(event)
    
    # TEAM UPDATE
    for record in event['Records']:
        
        payload = json.loads(record['body'])
        
        if 'team_name' in payload and 'team_id' in payload and 'message' in payload and 'member_id' in payload:
            # Team payload
            team_name = payload['team_name']
            team_id = payload['team_id']
            message = payload['message']
            member_id = payload['member_id']
            
            print(f"Type 2 payload: Team Name: {team_name}, Team ID: {team_id}, Message: {message}, Member IDs: {member_id}")
            
            # Process the payload and send the message to the respective members
            response = NotifcationConfiguration(member_id, message)
            print(response)
            
        else:
            print("Invalid payload format")
            continue
            
        # Delete the processed message from the SQS queue
        
        receipt_handle = record['receiptHandle']
        eventSourceARN= record['eventSourceARN']
        queue_name = eventSourceARN.split(":")[-1].strip('"}')
        queue_url = "https://sqs.us-east-1.amazonaws.com/867792720108/"+queue_name
         
        sqs.delete_message(QueueUrl=queue_url, ReceiptHandle=receipt_handle)
        print('Deleted message from the queue')
    
    return {
        'statusCode': 200,
        'body': "Successfully sent to the final queue"
    }
