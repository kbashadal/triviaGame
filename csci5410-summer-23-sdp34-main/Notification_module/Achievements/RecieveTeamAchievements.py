import json
import boto3

# Create an SNS client
sns = boto3.client('sns')


def NotifcationConfiguration(user_id, message):
    # Function to send an achievement notification to a user using SNS

    # Prepare the payload for the notification
    payload = {
        'recieverId': user_id,
        'message': message
    }

    print(payload)

    # Specify the ARN of the SNS topic for achievements
    topic_arn = 'arn:aws:sns:us-east-1:867792720108:Achievements'

    # Convert the payload to JSON
    message = json.dumps(payload)

    # Publish the message to the specified SNS topic
    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )

    print("Payload sent")
    return response
    

def lambda_handler(event, context):

    # Extract data from the event
    payload = event
    print(event)

    # Extract achievement name and team members from the payload
    achievement_name = event['message']
    team_members = event['member_ids']

    # Prepare the message to be sent in the notification
    message = f"Congratulations! Your Team achieved a {achievement_name} Trivia milestone ! 🎉"
    print(message)

    # Send notifications to all team members
    for userId in team_members:
        publish_message = NotifcationConfiguration(userId, message)
        print(publish_message)

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
