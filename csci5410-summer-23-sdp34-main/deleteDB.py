import json
import boto3

dynamoDBTableName = 'UserProfile'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamoDBTableName)

def lambda_handler(event, context):
    try:
        httpMethod = event['requestContext']['http']['method']
        path = event['requestContext']['http']['path']
        
        if httpMethod == 'DELETE' and path == '/delete':
            # Extract the primary key value from the request query string parameters
            email = event['queryStringParameters']['email']
            
            # Extract the attribute key-value pair to be deleted from the request query string parameters
            attribute_name = event['queryStringParameters']['attribute']
            
            # Remove the attribute from the item in DynamoDB using the primary key value
            response = table.update_item(
                Key={
                    'email': email
                },
                UpdateExpression='REMOVE #attr',
                ExpressionAttributeNames={
                    '#attr': attribute_name
                }
            )
            
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Attribute deleted successfully'})
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

# https://zcptrj3jipzjw5ttgp7yrpzce40nwyxf.lambda-url.ca-central-1.on.aws/delete?email=kazbekker@gmail.com&attribute=Answer1