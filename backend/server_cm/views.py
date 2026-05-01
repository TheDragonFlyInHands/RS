from django.http import JsonResponse
from .models import *
from django.db.models import Q
import secrets
import string
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password
from .models import User
import json
import os
from django.conf import settings
import uuid
from django.db import transaction

def get_popular_products(request):#нужно доделать
    # Берём 3 самых новых продукта (сортировка по дате убывания)

    popular_products = Product.objects.order_by('-data')[:3]
    print(popular_products)
    
    data = []
    for p in popular_products:
        data.append(p.id)
    print(data)
    # safe=False позволяет вернуть список, а не словарь
    return JsonResponse(data, safe=False)

def get_product_by_id(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
        
        # 1. Формируем полный URL к изображению
        image_url = None
        if product.id_image:
            image_path = os.path.join(settings.MEDIA_ROOT, product.id_image)
            if os.path.exists(image_path):
                image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{product.id_image}")

        # 2. Получаем список городов (если используется ManyToMany)
        # Если у вас ForeignKey city, то используйте product.city.name
        cities_names = list(product.cities.values_list('name', flat=True))

        data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'short_description': product.short_description,
            'image': image_url,
            'category': product.category,
            'source_url': "",  # Ссылка на оффер (хранится в address)
            'date': product.data.isoformat() if product.data else None, # Дата создания
            'cities': cities_names          # Список городов для вывода бейджиков
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
        queryset = queryset.order_by('-data')
    else:
        queryset = queryset.order_by('data')
    ids_list = list(queryset.values_list('id', flat=True))
    return JsonResponse({'ids': ids_list})


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
            'last_name': user.last_name,
            'phone':user.phone,
            'city':user.city
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

@csrf_exempt
def validate_token_view(request):
    token = request.headers.get('Authorization', '').replace('Token ', '')
    
    if not token:
        return JsonResponse({'valid': False})
    
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
                    'last_name': user.last_name,
                    'phone':user.phone,
                    'address':user.address
                }
            })
    
    return JsonResponse({'valid': False})
@csrf_exempt
def update_profile(request):
    if request.method not in ['POST', 'PUT', 'PATCH']:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '').strip()
    
    if not token or '_' not in token:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        user_id = token.split('_')[0]
        user = User.objects.get(id=user_id)
    except (User.DoesNotExist, ValueError):
        return JsonResponse({'error': 'User not found'}, status=404)

    first_name = request.POST.get('first_name', user.first_name)
    last_name = request.POST.get('last_name', user.last_name)
    phone = request.POST.get('phone', user.phone)
    city = request.POST.get('city', user.city)

    user.first_name = first_name
    user.last_name = last_name
    user.phone = phone
    user.city = city

    new_password = request.POST.get('newPassword')
    confirm_password = request.POST.get('confirmPassword')
    
    if new_password:
        user.password = make_password(new_password)

    if 'avatar' in request.FILES:
        avatar_file = request.FILES['avatar']
        file_extension = os.path.splitext(avatar_file.name)[1]
        unique_name = f"{uuid.uuid4()}{file_extension}"

        file_path = os.path.join(settings.MEDIA_ROOT, unique_name)
        
        with open(file_path, 'wb+') as destination:
            for chunk in avatar_file.chunks():
                destination.write(chunk)

        user.id_image = unique_name

    user.save()
    return JsonResponse({
        'message': 'Profile updated',
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'city': user.city,
            'email': user.email,
            'id_image': user.id_image,
            'avatar_url': request.build_absolute_uri(f'{settings.MEDIA_URL}{user.id_image}') if user.id_image else '', 
        }
    })

def check_is_employee(request):
    """
    Проверяет, является ли пользователь работником.
    Возвращает {'is_employee': True} или False.
    """
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '')
    
    if not token or '_' not in token:
        return JsonResponse({'is_employee': False, 'error': 'Token missing'}, status=401)
        
    try:
        # Извлекаем ID из токена (формат: id_случайнаястрока)
        user_id = token.split('_')[0]
        
        # Ищем пользователя в базе
        user = User.objects.get(id=user_id)
        
        # Возвращаем значение поля is_employee
        return JsonResponse({'is_employee': user.is_employee}, status=200)
        
    except User.DoesNotExist:
        return JsonResponse({'is_employee': False, 'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'is_employee': False, 'error': str(e)}, status=500)

def verify_employee(request):
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '').strip()
    
    if not token or '_' not in token:
        return None, JsonResponse({'error': 'Unauthorized'}, status=401)
        
    try:
        user_id = token.split('_')[0]
        user = User.objects.get(id=user_id)
        
        if not user.is_employee:
            return None, JsonResponse({'error': 'Access denied. Employees only.'}, status=403)
            
        return user, None
    except User.DoesNotExist:
        return None, JsonResponse({'error': 'User not found'}, status=401)

# 🔹 1. Получение списка городов (для выпадающего списка на фронте)
@csrf_exempt
def get_cities(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    # Возвращаем список словарей [{'id': 1, 'name': 'Москва'}, ...]
    cities = list(City.objects.values('id', 'name'))
    return JsonResponse(cities, safe=False)

# 🔹 2. Создание продукта (только для работников)
@csrf_exempt
def create_product(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # ✅ Проверка авторизации и роли
    employee, error_resp = verify_employee(request)
    if error_resp:
        return error_resp

    try:
        # 📥 Чтение данных из FormData
        name = request.POST.get('name', '').strip()
        category = request.POST.get('category', '').strip()
        short_desc = request.POST.get('short_description', '').strip()
        description = request.POST.get('description', '').strip()
        source_url = request.POST.get('source_url', '').strip()
        cities_list = request.POST.getlist('cities')  # список выбранных городов

        # ✅ Валидация обязательных полей
        if not all([name, category, short_desc, cities_list]):
            return JsonResponse({'error': 'Заполните название, категорию, описание и выберите города'}, status=400)

        # 🖼️ Обработка загрузки изображения
        image_filename = None
        if 'image' in request.FILES:
            img_file = request.FILES['image']
            ext = os.path.splitext(img_file.name)[1]
            image_filename = f"{uuid.uuid4()}{ext}"
            file_path = os.path.join(settings.MEDIA_ROOT, image_filename)
            
            os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
            with open(file_path, 'wb+') as dest:
                for chunk in img_file.chunks():
                    dest.write(chunk)

        # 💾 Сохранение продукта и привязка городов в одной транзакции
        with transaction.atomic():
            product = Product.objects.create(
                name=name,
                category=category,
                short_description=short_desc,
                description=description,
                address=source_url,  # source_url сохраняется в поле address модели
                id_image=image_filename,
                employee=employee
            )

            # Привязываем выбранные города через промежуточную таблицу CityList
            for city_val in cities_list:
                # Ищем город по имени или по ID (на случай если фронт шлёт разное)
                city_obj = City.objects.filter(name=city_val).first() or City.objects.filter(id=city_val).first()
                if city_obj:
                    CityList.objects.get_or_create(product=product, city=city_obj)

        return JsonResponse({
            'message': 'Продукт успешно добавлен',
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_all_cities(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    # Возвращаем только id и name
    cities = list(City.objects.values('id', 'name'))
    return JsonResponse(cities, safe=False)