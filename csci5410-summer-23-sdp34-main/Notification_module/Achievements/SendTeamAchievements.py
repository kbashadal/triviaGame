import json
import os
import boto3
from google.cloud import firestore


def connect_to_lambda(payload):
    # Function to invoke another Lambda function with the provided payload

    # Retrieve the AWS credentials and region from environment variables
    access_key_id = os.environ['AWS_ACCESS_KEY_ID']
    secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
    region = 'us-east-1'

    # Create a Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')

    # Specify the name of the target Lambda function
    function_name = "TeamAchievements"

    # Invoke the target Lambda function with the provided payload
    response = lambda_client.invoke(
        FunctionName=function_name,
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )

    # Process the response if needed
    response_payload = response['Payload'].read().decode('utf-8')
    print("Lambda invocation response:", response_payload)


def hello_firestore(event, context):


    # Extract the payload from the 'updateMask' field in the event
    payload = event['updateMask']['fieldPaths']
    print(payload)

    # Check if the 'Achievements' field is in the payload
    if 'Achievements' in payload:
        # Access the 'Achievements' and 'TeamMembers' fields from the event
        achievements = event['value']['fields']['Achievements']['arrayValue']['values']
        Team_members = event['value']['fields']['TeamMembers']['arrayValue']['values']
        print(Team_members)
        members_ids = [int(item['integerValue']) for item in Team_members]
        print(members_ids)

        print(achievements)

        if achievements:
            # Extract the latest achievement and its timestamp from the 'Achievements' array

            # Initialize variables to track the latest achievement and its timestamp
            latest_timestamp = None
            latest_achievement = None

            for achievement_data in achievements:
                # Extract timestamp and achievement value from each achievement_data
                timestamp = achievement_data['mapValue']['fields']['TimeStamp']['stringValue']
                if latest_timestamp is None or timestamp > latest_timestamp:
                    latest_timestamp = timestamp
                    latest_achievement = achievement_data['mapValue']['fields']['Achievement']['stringValue']

            # Create a dictionary to store the latest achievement data
            latest_payload_map = {'Achievement': latest_achievement, 'TimeStamp': latest_timestamp}
            print("Latest Payload Map:", latest_payload_map)
            print(f"The latest achievement is: {latest_achievement}")

            # Prepare payload to send to the 'TeamAchievements' Lambda function
            payload = {
                'message': latest_achievement,
                'member_ids': members_ids
            }
            print(payload)
            
            # Invoke the 'TeamAchievements' Lambda function
            invoking_lambda = connect_to_lambda(payload)
            print(invoking_lambda)

        else:
            print("The 'Achievements' field is empty.")
    else:
        print("The 'Achievements' field was not updated.")
        return 'Not processing payload'
