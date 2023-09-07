import boto3
import json
import hashlib
import decimal


# Custom JSON encoder to handle Decimal objects
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)


def is_answer_valid(answer):
    # Implement your answer validation logic here
    # For example, require a minimum length of 4 characters
    return len(answer) >= 4


def lambda_handler(event, context):
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("userTable")

    # Get the question number from the URL path
    question_number = event["pathParameters"]["questionnumber"]

    # Retrieve the user item from DynamoDB using the GSI based on the email
    email = event["queryStringParameters"]["email"]

    # Parse the request body to get the JSON data
    request_body = event.get("body", "{}")
    try:
        data = json.loads(request_body)
        answer = data["answer"]
    except ValueError:
        # Return an error response if the request body is not valid JSON
        return {
            "statusCode": 400,
            "body": 'Invalid request data. Expected JSON data with "email", "question_number", and "answer" fields.',
        }

    if not is_answer_valid(answer):
        # Return an error response if the answer is not valid
        return {
            "statusCode": 400,
            "body": "Invalid answer. Answers must be at least 4 characters long.",
        }

    try:
        response = table.query(
            IndexName="email-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("email").eq(email),
        )
        if response["Count"] >= 1:
            user_id = response["Items"][0]["user_id"]
            team_id = response["Items"][0]["TeamId"]

        items = response.get("Items")

        if not items:
            # If the user is not found in the table, return an error response
            return {"statusCode": 404, "body": "User not found in the database."}

        # Since email is unique, we expect only one item in the response
        item = items[0]

        # Construct the attribute name for the requested question number
        question_attr_name = f"answer{question_number}"

        # Extract the expected hashed answer based on the requested number from the item
        expected_hashed_answer = item.get(question_attr_name)

        if not expected_hashed_answer:
            # If the requested question number is not found, return an error response
            return {
                "statusCode": 404,
                "body": f"Question {question_number} not found for the user in the database.",
            }

        # Hash the provided answer using MD5
        hashed_answer = hashlib.md5(answer.encode()).hexdigest()

        if hashed_answer == expected_hashed_answer:
            return {
                "statusCode": 200,
                "body": json.dumps(
                    {"reasult": True, "user_id": user_id, "team_id": team_id},
                    cls=DecimalEncoder,
                ),
            }
        else:
            return {
                "statusCode": 200,
                "body": json.dumps({"reasult": False}),
            }

    except Exception as e:
        # Handle any unexpected errors
        return {"statusCode": 500, "body": f"Error occurred: {str(e)}"}
