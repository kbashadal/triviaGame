import json
import boto3

dynamoDBTableName = 'UserProfile'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamoDBTableName)

def lambda_handler(event, context):
    try:
        httpMethod = event['requestContext']['http']['method']
        path = event['requestContext']['http']['path']

        if httpMethod == 'PATCH' and path == '/update':
            # Extract the request body
            request_body = json.loads(event['body'])
            
            # Check if the 'email' key is present in the request payload
            if 'email' in request_body:
                email = request_body['email']
                
                # Create an update expression and expression attribute values dictionary
                update_expression = []
                expression_attribute_values = {}
                expression_attribute_names = {}
                
                # Build the update expression and expression attribute values dictionary based on the request payload
                for key, value in request_body.items():
                    if key != 'email':
                        update_expression.append(f"#{key} = :{key}")
                        expression_attribute_values[f":{key}"] = value
                        expression_attribute_names[f"#{key}"] = key

                response = table.update_item(
                    Key={
                        'email': email
                    },
                    UpdateExpression='SET ' + ', '.join(update_expression),
                    ExpressionAttributeValues=expression_attribute_values,
                    ExpressionAttributeNames=expression_attribute_names
                )
                
                return {
                    'statusCode': 200,
                    'body': json.dumps({'message': 'Item updated successfully'})
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
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': str(e)})
        }


# https://4hzxlnt3bo7e2ya2fsbfpcc5fi0gcrnq.lambda-url.ca-central-1.on.aws/update