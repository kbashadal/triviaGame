import json
import boto3
import hashlib
import decimal
from botocore.exceptions import ClientError

# Custom JSON encoder to handle Decimal objects
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return str(o)
        return super(DecimalEncoder, self).default(o)

dynamoDBTableName = "userTable"
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(dynamoDBTableName)

def encode_answer_to_check(password):
    # Encode the answer using MD5 hash function
    output = hashlib.md5(password.encode())

    # Print the hash of the input string (optional)
    print("Hash of the input string:")
    print(output.hexdigest())

    # Return the hash value
    return output.hexdigest()


def lambda_handler(event, context):
    try:
        print(event)
        data = json.loads(event["body"])
        print(data)

        # Check if the required fields are present
        if "email" not in data or "password" not in data:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Invalid request: 'email' and 'password' fields are required."}),
            }

        email = data["email"]
        raw_password = data["password"]

        # Validate that the email and password are not empty
        if not email.strip() or not raw_password.strip():
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Invalid request: 'email' and 'password' cannot be empty."}),
            }

        password = encode_answer_to_check(raw_password)

        try:
            # Retrieve the user item from DynamoDB using the GSI
            response = table.query(
                IndexName="email-index",
                KeyConditionExpression=boto3.dynamodb.conditions.Key("email").eq(email),
            )

            if response["Count"] == 1 and response["Items"][0]["password"] == password:
                user_id = response["Items"][0]["user_id"]
                team_id = response["Items"][0]["TeamId"]

                return {
                    "statusCode": 200,
                    "body": json.dumps({
                        "message": "Login successful",
                        "user_id": user_id,
                        "team_id": team_id
                    }, cls=DecimalEncoder),  # Using the custom JSON encoder here
                }
            else:
                if response["Count"] == 1:
                    return {
                        "statusCode": 401,
                        "body": json.dumps({"message": "Invalid password"}),
                    }
                else:
                    return {
                        "statusCode": 401,
                        "body": json.dumps({"message": "Invalid email"}),
                    }
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                return {
                    "statusCode": 401,
                    "body": json.dumps({"message": "Invalid email or password"}),
                }
            else:
                print("Unexpected error:", e)
                print("Exception message:", str(e))
                return {
                    "statusCode": 500,
                    "body": json.dumps({"message": "Internal server error"}),
                }

    except KeyError as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"message": f"Invalid request: {str(e)}"}),
        }
    except Exception as e:
        print("Unexpected error:", e)
        print("Exception message:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"}),
        }