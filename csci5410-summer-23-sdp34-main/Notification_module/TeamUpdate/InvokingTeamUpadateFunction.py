import json
import os
import boto3
from google.cloud import firestore

# Function to invoke an AWS Lambda function
def connect_to_lambda(payload):
    # Retrieving AWS access key and secret from environment variables
    access_key_id = os.environ['AWS_ACCESS_KEY_ID']
    secret_access_key = os.environ['AWS_SECRET_ACCESS_KEY']
    region = 'us-east-1'

    # Creating an AWS Lambda client
    lambda_client = boto3.client('lambda', region_name='us-east-1')
    function_name = "TeamUpdatesNotification"

    # Invoking the Lambda function with the specified payload
    response = lambda_client.invoke(
        FunctionName=function_name,
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )

    # Process the response if needed
    response_payload = response['Payload'].read().decode('utf-8')
    print("Lambda invocation response:", response_payload)

def hello_firestore(event, context):
    print(event)

    # Check for Delete operation
    if 'oldValue' in event and not event['value']:
        # Delete operation
        deleted_value = event['oldValue']['fields']
        OLD_TeamID = deleted_value['Id']['integerValue']
        OLD_TeamName = deleted_value['Name']['stringValue']
        TeamMembers = deleted_value['TeamMembers']['arrayValue']
      
        # Generate message for Team Deletion
        MESSAGE_TO_DELIVER = f"Team Update,  team has been Deleted : {OLD_TeamName}"
        print(MESSAGE_TO_DELIVER)

        # Extract Team Members
        team_members = TeamMembers['values']
        print(team_members)
        member_ids = [member['integerValue'] for member in team_members]
        print(member_ids)

        if member_ids:
            print('Team ID:', OLD_TeamID)
            print('Name:', OLD_TeamName)
            print('Member IDs:', member_ids)
        else:
            print('Team not found')
        
        # Prepare payload for Lambda invocation
        payload = {
            'TeamID': OLD_TeamID,
            'TeamName': OLD_TeamName,
            'member_ids': member_ids,
            'message': MESSAGE_TO_DELIVER
        }
        print(payload)
        invoking_lambda = connect_to_lambda(payload)
        print(invoking_lambda)

    # Check for Update operation
    elif 'oldValue' in event and event['oldValue']:
        # Update operation
        old_value = event['oldValue']['fields']
        new_value = event['value']['fields']
        print(f"Update event - Old value: {old_value}, New value: {new_value}")

        # Compare the old and new value to find updated fields
        updated_fields = {}
        for field, new_attribute_data in new_value.items():
            if field in old_value and old_value[field] != new_attribute_data:
                updated_fields[field] = {
                    'newValue': new_attribute_data,
                    'oldValue': old_value[field]

                }
        print(f"Updated fields: {updated_fields}")

        # Process updated fields
        for attribute_name, attribute_data in updated_fields.items():
            # Check the type of updated value and generate message accordingly
            if 'stringValue' in attribute_data['newValue']:
                updated_value = attribute_data['newValue']['stringValue']
                MESSAGE_TO_DELIVER = f"Team Update, {attribute_name} has been changed to {updated_value}"
            elif 'integerValue' in attribute_data['newValue']:
                updated_value = attribute_data['newValue']['integerValue']
                MESSAGE_TO_DELIVER = f"Team Update, {attribute_name} has been changed to {updated_value}"                
            elif 'booleanValue' in attribute_data['newValue']:
                updated_value = attribute_data['newValue']['booleanValue']
                MESSAGE_TO_DELIVER = f"Team Update, {attribute_name} has been changed to {updated_value}"
            elif 'arrayValue' in attribute_data['newValue']:
                updated_value = attribute_data['newValue']['arrayValue']['values']

                if all(isinstance(value, int) for value in updated_value):
                    # All elements are integers
                    updated_value = [value['integerValue'] for value in updated_value]
                elif all(isinstance(value, str) for value in updated_value):
                    # All elements are strings
                    updated_value = [value['stringValue'] for value in updated_value]
                else:
                    print("not processing")

                removed_item = None

                if 'arrayValue' in attribute_data['oldValue']:
                    old_value_list = attribute_data['oldValue']['arrayValue']['values']
                    if all(isinstance(value, int) for value in updated_value):
                        updated_value = [value['integerValue'] for value in old_value_list]
                    elif all(isinstance(value, str) for value in updated_value):
                        updated_value = [value['stringValue'] for value in old_value_list]
                    else:
                        print("not processing")
                    # old_value_list = [value['integerValue'] for value in old_value_list]
                    for item in old_value_list:
                        if item not in updated_value:
                            if isinstance(item, str) and item.isdigit():
                                removed_item = int(item['intValue'])
                                break
                            else:
                                removed_item = item['stringValue']
                                break

                if removed_item is not None:
                    MESSAGE_TO_DELIVER = f"Team Update, A {attribute_name} with ID {removed_item} has been removed from the team"
                else:
                    MESSAGE_TO_DELIVER = f"Team Update, A new {attribute_name} has been added to the team"
            else:
                updated_value = 'Unknown'  # Set a default value or handle unsupported types
            print(attribute_name, updated_value)

        NEW_TeamID = new_value['Id']['integerValue']
        NEW_TeamName = new_value['Name']['stringValue']
        NEW_TeamMembers = new_value['TeamMembers']['arrayValue']
        Updated_Field_Name = attribute_name
        Updated_Field_Value = updated_value

        print(MESSAGE_TO_DELIVER)

        # Extract Team Members
        team_members = NEW_TeamMembers['values']
        print(team_members)
        member_ids = [member['integerValue'] for member in team_members]
        print(member_ids)

        if member_ids:
            print('Team ID:', NEW_TeamID)
            print('Name:', NEW_TeamName)
            print('Member IDs:', member_ids)
        else:
            print('Team not found')
        
        # Prepare payload for Lambda invocation
        payload = {
            'TeamID': NEW_TeamID,
            'TeamName': NEW_TeamName,
            'member_ids': member_ids,
            'message': MESSAGE_TO_DELIVER
        }
        print(payload)
        invoking_lambda = connect_to_lambda(payload)
        print(invoking_lambda)
        
    # Check for Insert operation
    elif 'value' in event and 'fields' in event['value']:
        # Insert operation
        new_value = event['value']['fields']
        NEW_TeamID = new_value['Id']['integerValue']
        NEW_TeamName = new_value['Name']['stringValue']
        NEW_TeamMembers = new_value['TeamMembers']['arrayValue']
        print(f"Insert event - New value: {new_value}")

        # Generate message for Team Creation
        MESSAGE_TO_DELIVER = f"Team Update, new team has been created : {NEW_TeamName}"
        print(MESSAGE_TO_DELIVER)

        # Extract Team Members
        team_members = NEW_TeamMembers['values']
        print(team_members)
        member_ids = [member['integerValue'] for member in team_members]
        print(member_ids)

        if member_ids:
            print('Team ID:', NEW_TeamID)
            print('Name:', NEW_TeamName)
            print('Member IDs:', member_ids)
        else:
            print('Team not found')
        
        # Prepare payload for Lambda invocation
        payload = {
            'TeamID': NEW_TeamID,
            'TeamName': NEW_TeamName,
            'member_ids': member_ids,
            'message': MESSAGE_TO_DELIVER
        }
        print(payload)
        invoking_lambda = connect_to_lambda(payload)
        print(invoking_lambda)

    else:
        print("not processing")
