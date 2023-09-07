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
        try:
            # Get the request body
            request_body = request.data.decode("utf-8")
            data = json.loads(request_body)

            # Get the team ID from the request body
            team_id = data.get("teamId")

            if not team_id:
                return "Missing 'teamId' field in the request body.", 400, headers

            # Retrieve the team data from Firestore
            db = firestore.Client()
            team_collection_ref = db.collection("teamCollection")
            team_doc_ref = team_collection_ref.document(team_id)
            team_data = team_doc_ref.get().to_dict()

            if team_data:
                # Prepare the response JSON
                response_data = {
                    "TeamData": team_data
                }

                # Convert the response data to JSON format
                response_json = json.dumps(response_data)

                # Return the JSON response with CORS headers
                return response_json, 200, headers
            else:
                return f"Team with TeamID '{team_id}' not found.", 404, headers

        except Exception as e:
            return f"Error occurred while fetching team data: {str(e)}", 500, headers
    else:
        # Return CORS headers for preflight OPTIONS request
        if request.method == "OPTIONS":
            return "", 200, headers
        else:
            return "This Cloud Function only supports HTTP POST requests.", 204, headers
