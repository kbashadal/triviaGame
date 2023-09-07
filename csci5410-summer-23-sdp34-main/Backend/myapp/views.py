from django.http import JsonResponse,HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import json

@csrf_exempt
def registerOne(request):
    if request.method == "GET":
        return "test"
    if request.method == 'POST':
        # Process the registration logic here
        # Extract data from the request, perform validation, create a new user, etc.
        # You can access the request data using request.POST or request.body
        # Return a JSON response indicating the success or failure of the registration

        # Example response
        response_data = {
            'message': 'Registration successful!',
            'status': 'success'
        }
        return JsonResponse(response_data)

    else:
        # Handle unsupported HTTP methods
        response_data = {
            'message': 'Method not allowed',
            'status': 'error'
        }
        return JsonResponse(response_data, status=405)
@csrf_exempt
def register(request):
    data = json.loads(request.body)
    print(data)

    return render(request, 'sample.html')

    # return HttpResponse("Testing")
