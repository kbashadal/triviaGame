import json
import boto3

# Function to get all user IDs from the 'userTable' DynamoDB table
def getAllUserIds():
    db_client = boto3.resource('dynamodb')
    table_name = db_client.Table('userTable')
    
    # Use scan to get all items from the table with only 'user_id' attribute
    response = table_name.scan(ProjectionExpression='user_id')
    
    # Extract and store user IDs in a list
    user_ids = [int(item['user_id']) for item in response['Items']]
    return user_ids

# Function to send a notification using SNS (Simple Notification Service)
def NotifcationConfiguration(payload):
    sns = boto3.client('sns')
    topic_arn = 'arn:aws:sns:us-east-1:867792720108:GameAvailablity'
    
    message = json.dumps(payload)
    
    # Publish the message to the specified topic
    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )
    
    return response

def lambda_handler(event, context):
    print(event)
    records = event['Records']

    for record in records:
        eventName = record['eventName']
        
        if eventName == 'REMOVE':
            print("not proccessing")
        
        elif eventName == 'MODIFY':
            print("not proccessing")
        
        elif eventName == 'INSERT':
            # Extract relevant attributes from the new image of the record
            new_image = record['dynamodb']['NewImage']
            GameId = new_image['GameId']['N']
            Name = new_image['gameName']['S']
            Category = new_image['selectedCategory']['S']
            
            # Prepare the message to be delivered
            message_to_deliver = f"Hey everyone, Introducing {Name} - an immersive and thrilling {Category} gaming experience."
            print(message_to_deliver)
            
            # Get all user IDs from the DynamoDB table
            user_ids = getAllUserIds()
            print(user_ids)
            
            # Send the notification to each user with relevant payload
            for user_id in user_ids:
                payload = {
                    'GameId': GameId,
                    'message': message_to_deliver,
                    'user_id': user_id
                }
            
                # Send the payload to the SNS topic for each user
                send_payload = NotifcationConfiguration(payload)
                print(send_payload)
            
        else:
            print("unknown process")
        
    return {
        'statusCode': 200,
        'body': 'Message published successfully'
    }
