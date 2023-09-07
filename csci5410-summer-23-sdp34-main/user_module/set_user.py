import boto3
import json

dynamodb = boto3.resource('dynamodb')
table_name = 'userTable'

def lambda_handler(event, context):
    try:
        user_id = event['pathParameters']['user_id']
        item = json.loads(event['body'])
        response = set_data(user_id, item)
        return {
            'statusCode': 200,
            'body': json.dumps(response)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }
    # return json.dumps(event)

def set_data(user_id, item):
    try:
        table = dynamodb.Table(table_name)
        response = table.put_item(
            Item={
                'user_id': int(user_id),
                **item
            }
        )
        return response
    except Exception as e:
        raise e
