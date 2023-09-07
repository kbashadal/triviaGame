import json
import boto3

def lambda_handler(event, context):
    # Parse the event body
    data = json.loads(event['body'])

    entity_type = data.get('entity_type')
    entity_name = data.get('entity_name')
    score = data.get('score')

    dynamodb = boto3.resource('dynamodb')
    bot_team_table = dynamodb.Table('botTeamTable')
    bot_player_table = dynamodb.Table('botPlayerTable')

    if entity_type == 'team':
        # Store the team data in the botTeamTable
        bot_team_table.put_item(Item={'TeamID': entity_name, 'Score': score})
    elif entity_type == 'player':
        # Store the player data in the botPlayerTable
        bot_player_table.put_item(Item={'PlayerID': entity_name, 'Score': score})
    else:
        return {
            'statusCode': 400,
            'body': json.dumps('Invalid entity_type'),
        }

    return {
        'statusCode': 200,
        'body': json.dumps('Data stored successfully'),
    }