import json
import decimal
import boto3

dynamoDBTableName = 'UserProfile'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamoDBTableName)


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)


def lambda_handler(event, context):
    try:
        httpMethod = event['requestContext']['http']['method']
        path = event['requestContext']['http']['path']
        query_params = event['queryStringParameters']

        if httpMethod == 'GET':
            if 'email' in query_params:
                email = query_params['email']

                if path == '/getItem':
                    if 'attribute' in query_params:
                        attribute = query_params['attribute']
                        response = table.get_item(Key={'email': email})
                        item = response.get('Item')

                        if item and attribute in item:
                            return {
                                'statusCode': 200,
                                'body': json.dumps({attribute: item[attribute]}, cls=DecimalEncoder)
                            }
                        else:
                            return {
                                'statusCode': 404,
                                'body': json.dumps({'message': f'Attribute {attribute} not found or item not found'})
                            }
                    else:
                        return {
                            'statusCode': 400,
                            'body': json.dumps({'message': 'Missing attribute query parameter'})
                        }
                else:
                    response = table.get_item(Key={'email': email})
                    item = response.get('Item')

                    if item:
                        return {
                            'statusCode': 200,
                            'body': json.dumps(item, cls=DecimalEncoder)
                        }
                    else:
                        return {
                            'statusCode': 404,
                            'body': json.dumps({'message': 'Item not found'})
                        }
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'message': 'Missing email query parameter'})
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
