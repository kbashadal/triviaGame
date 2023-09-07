import json
import boto3

dynamoDBTableName = 'UserProfile'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamoDBTableName)

def lambda_handler(event, context):
    try:
        httpMethod = event['requestContext']['http']['method']
        path = event['requestContext']['http']['path']
        
        if httpMethod == 'POST' and path == '/save':
            # Extract the request body
            request_body = json.loads(event['body'])
            
            # Check if the 'email' key is present in the request payload
            if 'email' in request_body:
                email = request_body['email']
                
                # Create an item dictionary for DynamoDB
                item = {
                    'email': email
                }
                
                # Add remaining key-value pairs from the request payload
                for key, value in request_body.items():
                    item[key] = value
                
                # Save the item in DynamoDB
                table.put_item(Item=item)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Data saved successfully'})
                }
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing email key in the request payload'})
                }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'Invalid request'})
            }
    
    except KeyError as e:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid request'})
        }

# https://obsei7rgoremxpuizrpvf7ld540fkykb.lambda-url.ca-central-1.on.aws/save