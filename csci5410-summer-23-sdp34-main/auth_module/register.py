import json
import boto3
import hashlib
from botocore.exceptions import ClientError

dynamoDBTableName = "userTable"
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(dynamoDBTableName)


def encode_answer_to_check(password):
    output = hashlib.md5(password.encode())
    return output.hexdigest()


def get_highest_id():
    highest_id = 0
    last_evaluated_key = None

    while True:
        if last_evaluated_key:
            response = table.scan(ExclusiveStartKey=last_evaluated_key)
        else:
            response = table.scan()

        items = response["Items"]

        if not items:
            break

        for item in items:
            user_id = int(item["user_id"])
            highest_id = max(highest_id, user_id)

        last_evaluated_key = response.get("LastEvaluatedKey")
        if not last_evaluated_key:
            break

    return highest_id


def generate_next_id():
    highest_id = get_highest_id()
    return highest_id + 1


def insert_to_dynamodb(payload):
    insert = table.put_item(Item=payload)
    return insert


def login_user(email, password):
    try:
        # Retrieve the user item from DynamoDB
        response = table.get_item(Key={"email": email})

        # Check if the user exists and the provided password matches
        if "Item" in response and response["Item"][
            "password"
        ] == encode_answer_to_check(password):
            return True
        else:
            return False
    except ClientError:
        return False


def lambda_handler(event, context):
    try:
        print(event)
        data = json.loads(event["body"])
        print(data)

        if "name" in data:
            # This block handles registration with name, email, and profile picture

            email = data["email"]
            name = data["name"]
            profile_picture = data["profilePicture"]
            question1 = data["question1"]
            answer1 = data["answer1"]
            question2 = data["question2"]
            answer2 = data["answer2"]
            question3 = data["question3"]
            answer3 = data["answer3"]

            user_id = generate_next_id()

            payload = {
                "username": name,
                "email": email,
                "profilePictureUrl": profile_picture,
                "user_id": user_id,
                "TeamId": 0,
                "isAdmin": False,
                "question1": question1,
                "answer1": encode_answer_to_check(answer1),
                "question2": question2,
                "answer2": encode_answer_to_check(answer2),
                "question3": question3,
                "answer3": encode_answer_to_check(answer3),
            }

            insert_db = insert_to_dynamodb(payload)

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Registration successful"}),
            }

        else:
            # This block handles registration with first name, last name, email, password, gender, and phone number

            FirstName = data["firstName"]
            LastName = data["lastName"]
            email = data["email"]
            raw_password = data["password"]
            question1 = data["question1"]
            answer1 = data["answer1"]
            question2 = data["question2"]
            answer2 = data["answer2"]
            question3 = data["question3"]
            answer3 = data["answer3"]

            password = encode_answer_to_check(raw_password)
            user_id = generate_next_id()

            payload = {
                "username": FirstName + " " + LastName,
                "email": email,
                "password": password,
                "user_id": user_id,
                "TeamId": 0,
                "isAdmin": False,
                "question1": question1,
                "answer1": encode_answer_to_check(answer1),
                "question2": question2,
                "answer2": encode_answer_to_check(answer2),
                "question3": question3,
                "answer3": encode_answer_to_check(answer3),
            }

            insert_db = insert_to_dynamodb(payload)

            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Registration successful"}),
            }

    except KeyError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": f"Invalid request: {str(e)}"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"}),
        }
