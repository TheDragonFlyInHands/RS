from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def send_message(request):
    return Response({"message": "Привет! Это ответ от Django сервера 🚀"})