import boto3

def send_message_to_lex_v2(session_id, user_input):
    client = boto3.client('lex-runtime-v2')

    bot_alias_id = 'alias-id'
    bot_id = 'bot-id'
    locale_id = 'locale-id'

    response = client.recognize_text(
        botId=bot_id,
        botAliasId=bot_alias_id,
        localeId=locale_id,
        sessionId=session_id,
        text=user_input
    )

    return response

def fetch_team_score(team_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('botTeamTable')

    response = table.get_item(
        Key={
            'TeamID': team_name
        }
    )

    item = response.get('Item')
    if item:
        return item.get('Score')
    else:
        return None

def fetch_player_score(player_name):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('botPlayerTable')

    response = table.get_item(
        Key={
            'PlayerID': player_name
        }
    )
    print(item)

    item = response.get('Item')
    if item:
        return item.get('Score')
    else:
        return None

def lambda_handler(event, context):
    print(event)
    # Extract the intent and slot values from the Lex request
    interpretations = event['interpretations']
    intent_name = interpretations[0]['intent']['name']
    slots = interpretations[0]['intent']['slots']
    session_id = event['sessionId']

    if intent_name == 'NavigationIntent':
        # Handle navigation intent
        page_name = slots.get('PageNameSlot', {}).get('value', {}).get('interpretedValue')

        if page_name:
            response_message = f"Sure! Here's the link to the {page_name} page: [Provide the link]."
        else:
            response_message = "I'm sorry, I couldn't determine the page name."

        response = {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close'
                },
                'intent': {
                    'confirmationState': 'Confirmed',
                    'name': intent_name,
                    'state': 'Fulfilled'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': response_message
                }
            ]
        }

    elif intent_name == 'ScoreSearchIntent':
        # Handle score search intent
        score_type = slots.get('ScoreTypeSlot')
        team_name = slots.get('TeamNameSlot')
        player_name = slots.get('PlayerNameSlot')

        # Check if the user has provided the required slot values
        if not team_name and not player_name:
            response_message = "Please provide the name of the team or player."

            response = {
                'sessionState': {
                    'dialogAction': {
                        'type': 'ElicitSlot',
                        'intentName': intent_name,
                        'slots': slots,
                        'slotToElicit': 'TeamNameSlot' if not team_name else 'PlayerNameSlot'
                    },
                    'intent': {
                        'confirmationState': 'None',
                        'name': intent_name,
                        'state': 'InProgress'
                    }
                },
                'messages': [
                    {
                        'contentType': 'PlainText',
                        'content': response_message
                    }
                ]
            }
        else:
            if team_name and team_name.get('value') and team_name['value'].get('interpretedValue'):
                score_details = fetch_team_score(team_name['value']['interpretedValue'])
                response_message = f"The score for {team_name['value']['interpretedValue']} is {score_details}." if score_details is not None else f"No score found for {team_name['value']['interpretedValue']}."
            elif player_name and player_name.get('value') and player_name['value'].get('interpretedValue'):
                print(player_name['value']['interpretedValue'])
                score_details = fetch_player_score(player_name['value']['interpretedValue'])
                print(score_details)
                response_message = f"The score for {player_name['value']['interpretedValue']} is {score_details}." if score_details is not None else f"No score found for {player_name['value']['interpretedValue']}."
            else:
                response_message = "Please provide the name of the team or player."

            response = {
                'sessionState': {
                    'dialogAction': {
                        'type': 'Close'
                    },
                    'intent': {
                        'confirmationState': 'Confirmed',
                        'name': intent_name,
                        'state': 'Fulfilled'
                    }
                },
                'messages': [
                    {
                        'contentType': 'PlainText',
                        'content': response_message
                    }
                ]
            }

    return response