import boto3
import json

sns_client = boto3.client('sns')
db_client = boto3.client('dynamodb')


def publish_message(topic_arn, message):
    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=json.dumps(message),
            Subject='Notification',
            MessageStructure='string',
        )
        return response['MessageId']
    except Exception as e:
        return str(e)

def lambda_handler(event, context):
    print(event)
    records = event['Records']
    
    for record in records:
        
        # Extract the new image from the record
        new_image = record['dynamodb']['NewImage']
        SenderId = new_image['SenderId']['N']
        RecieverId = new_image['RecieverId']['N']
        InviteId = new_image['InviteId']['N']
        GameInviteId = new_image['GameInviteId']['S']
        # Status = new_image['InviteStatus']['BOOL']

        
        table_name = 'userTable'

        # Create the key for the get_item operation to retrieve the sender_name
        sender_key = {
            'user_id': {'N': SenderId}  
        }

        # Retrieve the item from the table to get the name
        sender_response = db_client.get_item(
            TableName=table_name,
            Key=sender_key
        )

        # Check if the item was found
        if 'Item' in sender_response:
            # Extract the name from the item
            sender_name = sender_response['Item']['username']['S']
            print('Name:', sender_name)
        else:
            print('sender not found')
            
            
        message = f"{sender_name} has invited you to the game {GameInviteId}"
        
        # Create the message payload for SQS
        payload = {
            'SenderId': str(SenderId),
            'SenderName': str(sender_name),
            'RecieverId': str(RecieverId),
            'message': message
        }
        print(payload)

        
        topic_arn = 'arn:aws:sns:us-east-1:867792720108:GameInviteTopic'

        # Publish the message to the subscription
        
        message_id = publish_message(topic_arn, payload)
        print(message_id)
        print("message published")

    return {
        'statusCode': 200,
        'body': 'Lambda invoked successfully'
    }

            
