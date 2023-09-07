import functions_framework
from google.cloud import firestore
import json


@functions_framework.http
def hello_http(request):
        # Enable CORS for all origins (adjust the origin to restrict access if needed)
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    if request.method == "POST":



        # Get the request body
        request_body = request.data.decode("utf-8")
        data = json.loads(request_body)

        # Verify that the required fields are present in the request
        required_fields = [
            "RecieverId",
            "SenderId",
            "Status",
            "TeamID",
        ]
        for field in required_fields:
            if field not in data:
                return f"Required field '{field}' is missing in the request body.", 400, headers

        # Save the data to the 'TeamInvite' collection in Firestore
        try:
            db = firestore.Client()
            team_invite_collection_ref = db.collection("TeamInvite")
            team_invite_collection_ref.add(data)

            return "Team invite data has been successfully added to Firestore.", 200, headers
        except Exception as e:
            return f"Error occurred while saving data: {str(e)}", 500, headers
    else:
        return "This Cloud Function only supports HTTP POST requests.", 204, headers
