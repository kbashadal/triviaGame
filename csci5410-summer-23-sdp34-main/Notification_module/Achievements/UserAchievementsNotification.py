import json
import boto3

# Create an SNS client
sns = boto3.client('sns')

# Function to send a notification message to the specified user
def NotifcationConfiguration(user_id, message):
    payload = {
        'recieverId': user_id,
        'message': message
    }
    
    print(payload)
    
    # Specify the ARN of the SNS topic to publish the message
    topic_arn = 'arn:aws:sns:us-east-1:867792720108:Achievements'
    
    message = json.dumps(payload)
    
    # Publish the message to the specified topic
    response = sns.publish(
        TopicArn=topic_arn,
        Message=message
    )
    print("Payload sent to SNS topic")
    return response

# Function to compare old and new achievements and identify new achievements
def compare_achievements(old_achievements, new_achievements):
    latest_added_value = {}
    
    for key in new_achievements.keys():
        new_value = new_achievements[key]
        if key in old_achievements:
            old_value = old_achievements[key]
            if new_value != old_value:
                print(f"Key: {key}")
                print("Old Value:", old_value)
                print("New Value:", new_value)
                print()
        else:
            print(f"New value added for Key: {key}")
            print("New Value:", new_value)
            print()
            latest_added_value[key] = new_value
            print(latest_added_value)
    
    return latest_added_value

def lambda_handler(event, context):
    print(event)
    
    # Loop through each record in the event
    for record in event['Records']:
        # Check if the event is a MODIFY event (change in DynamoDB item)
        if record['eventName'] == 'MODIFY':
            # Extract the new and old images of the DynamoDB item
            new_image = record['dynamodb']['NewImage']
            old_image = record['dynamodb']['OldImage']
            
            # Extract the user ID from the new image
            userId = new_image['user_id']['N']
            
            # Extract the old and new achievement data as dictionaries
            old_achievement = old_image['Achievements']['M']
            new_achievement = new_image['Achievements']['M']
            
            print(old_achievement)
            print(new_achievement)
            
            # Compare old and new achievements to identify newly added achievements
            added_achievement = compare_achievements(old_achievement, new_achievement)
            print(added_achievement)

            # Check if there are newly added achievements
            if not added_achievement or not new_achievement:  # Check if added_achievement is empty or new_achievement is empty (no differences or no new achievements)
                print("No achievements added.")
                return
            else:
                print("New achievement(s) added.")
                
                # Get the first newly added achievement
                keys = list(added_achievement.keys())[0]
                print(keys)
                for key in keys:
                    achievement_name = added_achievement[key]['M']['Achivement']['S']
                    achievement_achieved = achievement_name
                    print(achievement_achieved)
                    
                    # Prepare the message to deliver
                    message_to_deliver = f"Congratulations! You've achieved a {achievement_achieved} Trivia milestone! 🎉"
                    print(message_to_deliver)
                    
                    # Send the notification message to the user
                    publish_message = NotifcationConfiguration(userId, message_to_deliver)
                    
                    print(publish_message)
                
    return {
        'statusCode': 200,
        'body': "Successfully sent"
    }
