import boto3

# Create clients for Amazon Comprehend and DynamoDB
comprehend = boto3.client('comprehend')
dynamodb = boto3.resource('dynamodb')

def detect_entities(text):
    # Function to detect entities (tags) from the text using Amazon Comprehend

    # Call Comprehend API to detect entities in the given text
    response = comprehend.detect_entities(Text=text, LanguageCode='en')
    entities = response['Entities']
    tags = [entity['Type'] for entity in entities]

    if not tags:  # Check if the tags list is empty
        tags = ['None']

    print(tags)
    return tags

def update_dynamodb_record(question_id, tag):
    # Function to update the tag field in the DynamoDB record

    # Get the DynamoDB table named 'AllQuestions'
    table = dynamodb.Table('AllQuestions')

    # Update the tag field in the DynamoDB record with the detected tag
    if tag:
        table.update_item(
            Key={'QuestionId': question_id},
            UpdateExpression='SET Tag = :tag',
            ExpressionAttributeValues={':tag': tag[0]}
        )
        print('Updated tag:', tag[0])

def lambda_handler(event, context):

    print(event)
    records = event['Records']

    for record in records:
        eventName = record['eventName']
        if eventName == 'INSERT':
            # Get the new image (record) from the event
            new_image = record['dynamodb']['NewImage']
            Question = new_image['QuestionName']['S']
            QuestionId = int(new_image['QuestionId']['N'])
            print(QuestionId)
            print(Question)

            # Detect entities (tags) from the question using Comprehend
            tag = detect_entities(Question)
            print(tag)

            # Update the DynamoDB record with the detected tag
            update_dynamodb_record(QuestionId, tag)

    # Return the response
    return {
        'statusCode': 200,
        'body': tag
    }
