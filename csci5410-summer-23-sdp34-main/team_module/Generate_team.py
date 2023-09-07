import functions_framework
import random
import json
import openai

# Set your OpenAI API key here
openai.api_key = "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"

# Predefined lists of adjectives and animal names
ADJECTIVES = [
    "Awesome",
    "Fierce",
    "Mighty",
    "Brave",
    "Energetic",
    "Spirited",
    "Daring",
    "Powerful",
    "Dynamic",
    "Courageous",
    "Swift",
    "Vibrant",
    "Glorious",
    "Majestic",
    "Noble",
    "Tenacious",
    "Fearless",
    "Valiant",
    "Vivacious",
    "Warrior",
]

ANIMAL_NAMES = [
    "Lions",
    "Dragons",
    "Titans",
    "Warriors",
    "Thunderbolts",
    "Eagles",
    "Phoenix",
    "Vikings",
    "Cobras",
    "Panthers",
    "Jaguars",
    "Falcons",
    "Hawks",
    "Patriots",
    "Spartans",
    "Raptors",
    "Suns",
    "Knights",
    "Tigers",
    "Wolves",
]


@functions_framework.http
def hello_http(request):
    if request.method == "GET":
        # Enable CORS for all origins (adjust the origin to restrict access if needed)
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        }
        try:
            # Generate a random team name using GPT-3.5 API or fallback to lists
            team_name = generate_random_team_name_with_gpt3()

            if team_name is None:
                team_name = generate_random_team_name_from_lists()

            # Prepare the response JSON
            response_data = {"RandomTeamName": team_name}

            # Convert the response data to JSON format
            response_json = json.dumps(response_data)

            # Return the JSON response
            return response_json, 200, headers
        except Exception as e:
            return f"Error occurred while generating a random team name: {str(e)}", 500, headers
    else:
        return "This Cloud Function only supports HTTP GET requests."


def generate_random_team_name_from_lists():
    # Choose a random adjective and animal name from the predefined lists
    adjective = random.choice(ADJECTIVES)
    animal_name = random.choice(ANIMAL_NAMES)

    # Combine the adjective and animal name to create the team name
    team_name = f"{adjective} {animal_name}"
    return team_name


def generate_random_team_name_with_gpt3():
    try:
        # Use GPT-3.5 API to generate a random team name
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": "Give me one meaningful trivia game team name, just a name.",
                },
            ],
            temperature=0.8,
            max_tokens=256,
        )

        # Extract the generated team name from the API response
        generated_text = response["choices"][0]["message"]["content"]
        team_name = generated_text.strip()

        if team_name:
            return team_name
    except Exception as e:
        print(f"Error occurred while using GPT-3: {str(e)}")

    return None
