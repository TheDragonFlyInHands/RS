from django.http import JsonResponse
from .models import *
from django.db.models import Q
import secrets
import string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from .models import User  # или Client, в зависимости от вашей модели
import json

def get_popular_products(request):#нужно доделать
    # Берём 3 самых новых продукта (сортировка по дате убывания)

    popular_products = Product.objects.order_by('-date')[:3]
    print(popular_products)
    
    data = []
    for p in popular_products:
        data.append(p.id)
    print(data)
    # safe=False позволяет вернуть список, а не словарь
    return JsonResponse(data, safe=False)

def get_product_by_id(request, product_id):
    """Возвращает данные одного продукта по ID"""
    try:
        product = Product.objects.get(id=product_id)
        
        # Получаем название города (если есть)
        city_name = product.city.name if product.city else None
        
        data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'short_description': product.short_description,
            'id_image': product.id_image,
            'category': product.category,
            'city': city_name,
            'city_id': product.city.id if product.city else None,
            'date': product.date.isoformat() if product.date else None,
        }
        
        return JsonResponse(data, status=200)
        
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)


def get_filtered_product_ids(request):
    """Возвращает список ID продуктов с фильтрацией"""
    
    category = request.GET.get('category', 'all')
    city_id = request.GET.get('city_id', 'all')  # ID города из фильтра
    search = request.GET.get('search', '')
    sort = request.GET.get('sort', 'newest')

    queryset = Product.objects.all()
    
    if category and category != 'all':
        queryset = queryset.filter(category=category)
    
    if city_id and city_id != 'all':
        if city_id.isdigit():
            queryset = queryset.filter(city_id=int(city_id))
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )
    if sort == 'newest':
        queryset = queryset.order_by('-date')
    else:
        queryset = queryset.order_by('date')
    ids_list = list(queryset.values_list('id', flat=True))
    return JsonResponse({'ids': ids_list})

import secrets
import string
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from .models import User  # или Client, в зависимости от вашей модели
import json

# 🔹 Генерация случайного пароля
def generate_password(length=10):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

# 🔹 Генерация простого токена (в продакшене используйте JWT или django-rest-authtoken)
def generate_token(user_id):
    # Простая реализация: user_id + случайная строка
    random_part = secrets.token_urlsafe(32)
    return f"{user_id}_{random_part}"

# 🔹 Вход пользователя
@csrf_exempt  # ⚠️ Для продакшена уберите и настройте CSRF правильно
def login_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        identifier = data.get('identifier', '').strip()
        password = data.get('password', '')
        
        if not identifier or not password:
            return JsonResponse({'error': 'Заполните все поля'}, status=400)
        
        # Поиск пользователя по почте или телефону
        user = None
        if '@' in identifier:
            user = User.objects.filter(email=identifier).first()
        else:
            user = User.objects.filter(phone=identifier).first()
        
        if not user:
            return JsonResponse({'error': 'Пользователь не найден'}, status=401)
        
        # Проверка пароля (если пароли хешированы)
        if not check_password(password, user.password):
            # Если пароли хранятся в открытом виде (не рекомендуется!)
            if password != user.password:
                return JsonResponse({'error': 'Неверный пароль'}, status=401)
        
        # Генерация токена
        token = generate_token(user.id)
        
        # 🔸 В реальном приложении: сохраните токен в БД или используйте JWT
        # user.auth_token = token
        # user.save()
        
        return JsonResponse({
            'token': token,
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.surname,
            'phone':user.phone,
            'address':user.address
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# 🔹 Сброс пароля
@csrf_exempt
def reset_password_view(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        
        if not email:
            return JsonResponse({'error': 'Введите почту'}, status=400)
        
        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({'error': 'Пользователь не найден'}, status=404)
        
        # Генерация нового пароля
        new_password = generate_password()
        
        # Обновление пароля в БД (хешируем!)
        user.password = make_password(new_password)
        user.save()
        
        # 🔸 Здесь должна быть отправка письма с new_password на user.email
        # send_reset_email(user.email, new_password)
        
        return JsonResponse({
            'message': 'Пароль сброшен',
            'new_password': new_password  # ⚠️ В продакшене НЕ возвращайте пароль в ответе!
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# 🔹 Валидация токена (проверка сессии)
@csrf_exempt
def validate_token_view(request):
    token = request.headers.get('Authorization', '').replace('Token ', '')
    
    if not token:
        return JsonResponse({'valid': False})
    
    # 🔸 Простая проверка: в реальном приложении проверяйте токен в БД или декодируйте JWT
    if '_' in token:
        user_id = token.split('_')[0]
        user = User.objects.filter(id=user_id).first()
        if user:
            return JsonResponse(
            {
                'valid': True, 
                'user': {
                    'user_id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.surname,
                    'phone':user.phone,
                    'address':user.address
                }
            })
    
    return JsonResponse({'valid': False})
@csrf_exempt
def update_profile(request):
    # Разрешаем PUT и POST
    if request.method not in ['PUT', 'POST']:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # 1. Проверка авторизации
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '')
    
    if not token or '_' not in token:
        return JsonResponse({'error': 'Необходима авторизация'}, status=401)

    try:
        user_id = token.split('_')[0]
        client = User.objects.get(id=user_id)
    except (User.DoesNotExist, ValueError):
        return JsonResponse({'error': 'Пользователь не найден'}, status=404)

    # 2. Парсинг JSON
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Неверный формат данных'}, status=400)

    # 3. Обновление полей (только разрешённые для безопасности)
    allowed_fields = ['first_name', 'last_name', 'phone', 'address']
    for field in allowed_fields:
        if field in data:
            setattr(client, field, data[field])

    # 4. Обработка смены пароля
    if 'newPassword' in data and data['newPassword']:
        if data.get('confirmPassword') != data['newPassword']:
            return JsonResponse({'error': 'Пароли не совпадают'}, status=400)
        client.password = make_password(data['newPassword'])

    client.save()

    # 5. Возвращаем обновлённые данные
    return JsonResponse({
        'message': 'Профиль успешно обновлён',
        'user': {
            'id': client.id,
            'first_name': client.first_name,
            'last_name': client.last_name,
            'email': client.email,
            'phone': client.phone,
            'address': client.address
        }
    })