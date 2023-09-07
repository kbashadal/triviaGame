import json
import boto3

# Create AWS clients for SNS, SQS, and Lambda
sns_client = boto3.client('sns') 
sqs_client = boto3.client('sqs')
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    # Extract relevant information from the event
    team_name = event['TeamName']
    team_id = event['TeamID']
    message = event['message']
    member_ids = event['member_ids']
    
    print(team_name)
    print(team_id)
    print(message)
    print(member_ids)
    
    # Construct the topic name using the team_id
    topic_name = f"{team_id}-team"
    
    # Check if the topic already exists
    response = sns_client.list_topics()
    topics = response['Topics']
    
    for topic in topics:
        topic_arn = topic['TopicArn']
        print(f"Checking topic: {topic_arn}")
        if topic_name in topic_arn:
            print(f"Topic '{topic_name}' already exists.")
            break  # Exit the loop without returning
    else:
        # Create a new topic if it doesn't exist
        response = sns_client.create_topic(Name=topic_name)
        topic_arn = response['TopicArn']
        print(f"Topic '{topic_name}' created with ARN: {topic_arn}")
    
    # Construct the queue name using the team_id
    queue_name = f"{team_id}-team-queue"
    lambda_function_name = "TeamUpdateDelivery"
    
    try:
        # Check if the queue already exists
        sqs_response = sqs_client.get_queue_url(QueueName=queue_name)
        queue_url = sqs_response['QueueUrl']
        queue_arn = sqs_client.get_queue_attributes(QueueUrl=queue_url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']
        print(f"Queue '{queue_name}' already exists.")
    except sqs_client.exceptions.QueueDoesNotExist:
        # Create a new queue if it doesn't exist
        create_response = sqs_client.create_queue(QueueName=queue_name)
        queue_url = create_response['QueueUrl']
        queue_arn = sqs_client.get_queue_attributes(QueueUrl=queue_url, AttributeNames=['QueueArn'])['Attributes']['QueueArn']
        print(f"Queue '{queue_name}' created with URL: {queue_url}")
    except Exception as e:
        # Handle the exception or log the error message
        print(f"Error checking or creating SQS queue: {e}")
    
    # Retrieve the event source mappings for the Lambda function
    queue_trigger_response = lambda_client.list_event_source_mappings(
        FunctionName=lambda_function_name,
        EventSourceArn=queue_arn
    )
    
    if len(queue_trigger_response['EventSourceMappings']) > 0:
        # Lambda function is already attached to the queue
        print(f"Lambda function '{lambda_function_name}' is already attached to queue '{queue_name}'.")
    else:
        # Attach the Lambda function to the queue
        queue_trigger_response = lambda_client.create_event_source_mapping(
            EventSourceArn=queue_arn,
            FunctionName=lambda_function_name,
            BatchSize=10
        )
        print(f"Lambda function '{lambda_function_name}' attached to queue '{queue_name}' successfully.")
    
    # Check if subscription already exists between the topic and queue
    subscriptions = sns_client.list_subscriptions_by_topic(TopicArn=topic_arn)['Subscriptions']
    subscription_exists = False

    for subscription in subscriptions:
        if subscription['Protocol'] == 'sqs' and subscription['Endpoint'] == queue_arn:
            print(f"Subscription between topic '{topic_name}' and queue '{queue_name}' already exists")
            subscription_exists = True
            break

    if not subscription_exists:
        # Create the subscription
        subscription_response = sns_client.subscribe(
            TopicArn=topic_arn,
            Protocol='sqs',
            Endpoint=queue_arn
        )
        subscription_arn = subscription_response['SubscriptionArn']
        print(f"Subscription created between topic '{topic_name}' and queue '{queue_name}' with ARN: {subscription_arn}")
        
    # Publish messages for each member_id to the SQS queue
    for member_id in member_ids:
        message_to_send_to_queue = {
            'team_name': team_name,
            'team_id': team_id,
            'message': message,
            'member_id': member_id
        }
        try:
            publish_message = sqs_client.send_message(
                QueueUrl=queue_url,
                MessageBody=json.dumps(message_to_send_to_queue)
            )
            print("Message published to the SQS queue")
        except Exception as e:
            # Handle the exception or log the error message
            print(f"Error publishing message to the SQS queue: {e}")
    
    return {
        'statusCode': 200,
        'body': 'Successfully published to SQS queue'
    }
