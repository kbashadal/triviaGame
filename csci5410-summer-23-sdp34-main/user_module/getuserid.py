import json
import boto3

def lambda_handler(event, context):
    try:
        # Get the email from the query parameters
        email = event['queryStringParameters']['email']

        # Create a DynamoDB client
        dynamodb = boto3.client('dynamodb')

        # Query the userTable DynamoDB table to find the user with the matching email
        response = dynamodb.scan(
            TableName='userTable',
            FilterExpression='email = :email',
            ExpressionAttributeValues={':email': {'S': email}}
        )

        # Check if a user was found
        if response['Count'] > 0:
            # Get the user ID from the first item in the response
            user_id = response['Items'][0]['user_id']['N']

            # Return the user ID as the response
            return {
                'statusCode': 200,
                'body': json.dumps({'userid': user_id})
            }
        else:
            # Return an error message if no user was found
            return {
                'statusCode': 404,
                'body': json.dumps('User not found')
            }
    except Exception as e:
        # Return an error message if an exception occurred
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }