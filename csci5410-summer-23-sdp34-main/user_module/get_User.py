import boto3
import json
import logging
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = 'userTable'

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    try:
        user_id = event['pathParameters']['user_id']
        response = get_data(user_id)
        return {
            'statusCode': 200,
            'body': json.dumps(response, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }

def get_data(user_id):
    try:
        table = dynamodb.Table(table_name)
        response = table.get_item(
            Key={
                'user_id': int(user_id)
            }
        )
        item = response.get('Item', {})
        return item
    except Exception as e:
        raise e
