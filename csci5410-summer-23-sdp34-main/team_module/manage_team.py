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

            # Verify that the required fields are present in the request body
            required_fields = ["teamId", "action", "memberId"]
            for field in required_fields:
                if field not in data:
                    return (
                        f"Required field '{field}' is missing in the request body.",
                        400,
                        headers,
                    )

            # Extract the data from the request body
            team_id = str(data["teamId"])
            action = data["action"]
            member_id = data["memberId"]

            db = firestore.Client()
            team_doc_ref = db.collection("teamCollection").document(team_id)

            # Check if the team with the provided teamId exists
            if not team_doc_ref.get().exists:
                return f"Team with TeamID '{team_id}' does not exist.", 404, headers

            # Retrieve the team data
            team_data = team_doc_ref.get().to_dict()

            # Perform the specified action
            if action == "add_member":
                # Check if the provided memberId already exists in the TeamMembers list
                if member_id in team_data["TeamMembers"]:
                    return (
                        f"Member with ID '{member_id}' already exists in the team.",
                        400,
                        headers,
                    )

                # Add the new member to the TeamMembers list
                new_team_members = team_data["TeamMembers"] + [member_id]
                team_doc_ref.update({"TeamMembers": new_team_members})
                return (
                    f"Member with ID '{member_id}' has been added to the team.",
                    200,
                    headers,
                )

            elif action == "promote_to_admin":
                if team_data["AdminId"] == member_id:
                    return "The member is already an admin.", 200, headers

                team_doc_ref.update({"AdminId": member_id})
                return (
                    f"Member with ID '{member_id}' has been promoted to admin.",
                    200,
                    headers,
                )

            elif action == "remove_member":
                if team_data["AdminId"] == member_id:
                    return (
                        "Cannot remove the admin from the team. Transfer admin rights first.",
                        400,
                        headers,
                    )

                new_team_members = [
                    member for member in team_data["TeamMembers"] if member != member_id
                ]
                team_doc_ref.update({"TeamMembers": new_team_members})
                return (
                    f"Member with ID '{member_id}' has been removed from the team.",
                    200,
                    headers,
                )

            elif action == "leave_team":
                if team_data["AdminId"] == member_id:
                    return (
                        "The admin cannot leave the team. Transfer admin rights first.",
                        400,
                        headers,
                    )

                new_team_members = [
                    member for member in team_data["TeamMembers"] if member != member_id
                ]
                team_doc_ref.update({"TeamMembers": new_team_members})
                return f"Member with ID '{member_id}' has left the team.", 200, headers

            else:
                return (
                    f"Invalid action '{action}'. Supported actions are 'add_member', 'promote_to_admin', 'remove_member', and 'leave_team'.",
                    400,
                    headers,
                )

        except Exception as e:
            return f"Error occurred while managing team members: {str(e)}", 500, headers

    else:
        return "This Cloud Function only supports HTTP POST requests.", 204, headers
