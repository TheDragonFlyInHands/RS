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
import random
from django.db.models import Sum, Count, Q
from .models import RegisterUser
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail


# Employees / Dashboard
def get_employee_dashboard(request):
    """Возвращает статистику и список реферальных ссылок сотрудника."""
    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        if not user.is_employee:
            return JsonResponse({'error': 'Access denied'}, status=403)

        referrals_qs = Refferals.objects.filter(client=user).select_related('product')
        total_views = referrals_qs.aggregate(total=Sum('stats__views_count'))['total'] or 0
        total_clicks = referrals_qs.aggregate(total=Sum('stats__clicks_count'))['total'] or 0

        referrals_data = []
        for ref in referrals_qs:
            stat, _ = Statistics.objects.get_or_create(ref=ref)
            referrals_data.append({
                'id': ref.id,
                'product_id': ref.product.id,
                'product_name': ref.product.name,
                'link': ref.referral_link,
                'views': stat.views_count,
                'clicks': stat.clicks_count
            })

        return JsonResponse({
            'stats': {
                'total_views': total_views,
                'total_clicks': total_clicks,
                'total_products': referrals_qs.values('product').distinct().count()
            },
            'referrals': referrals_data
        }, status=200)

    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=401)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Referrals / Tracking
def add_referral_link(request):
    """Создает новую реферальную ссылку для продукта (доступно сотрудникам)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '').strip()
    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        if not user.is_employee:
            return JsonResponse({'error': 'Access denied'}, status=403)

        data = json.loads(request.body)
        product_id = data.get('product_id')
        referral_link = data.get('referral_link', '').strip()

        if not product_id or not referral_link:
            return JsonResponse({'error': 'Product ID and Link are required'}, status=400)

        product = Product.objects.get(id=product_id)

        with transaction.atomic():
            new_ref = Refferals.objects.create(
                client=user,
                product=product,
                referral_link=referral_link
            )
            Statistics.objects.create(ref=new_ref, views_count=0, clicks_count=0)

        return JsonResponse({'message': 'Referral link added', 'id': new_ref.id}, status=201)

    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def track_view(request):
    """Увеличивает счетчик просмотров для referral_id."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        referral_id = data.get('referral_id')

        if not referral_id:
            return JsonResponse({'error': 'Referral ID required'}, status=400)

        ref = Refferals.objects.get(id=referral_id)
        stat, _ = Statistics.objects.get_or_create(ref=ref)
        stat.views_count = stat.views_count + 1
        stat.save()

        return JsonResponse({'message': 'View tracked', 'new_count': stat.views_count}, status=200)

    except Refferals.DoesNotExist:
        return JsonResponse({'error': 'Referral not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def track_click(request):
    """Увеличивает счетчик кликов для referral_id."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        referral_id = data.get('referral_id')

        if not referral_id:
            return JsonResponse({'error': 'Referral ID required'}, status=400)

        ref = Refferals.objects.get(id=referral_id)
        stat, _ = Statistics.objects.get_or_create(ref=ref)
        stat.clicks_count = stat.clicks_count + 1
        stat.save()

        return JsonResponse({'message': 'Click tracked', 'new_count': stat.clicks_count}, status=200)

    except Refferals.DoesNotExist:
        return JsonResponse({'error': 'Referral not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def search_products_for_referral(request):
    """Поиск продуктов по q с пагинацией page и фиксированным limit."""
    query = request.GET.get('q', '')
    page = int(request.GET.get('page', 1))
    limit = 10

    queryset = Product.objects.all()
    if query:
        queryset = queryset.filter(Q(name__icontains=query) | Q(description__icontains=query))

    total_count = queryset.count()
    start = (page - 1) * limit
    end = start + limit
    products = queryset[start:end]

    data = []
    for p in products:
        image_url = None
        if p.id_image:
            image_path = os.path.join(settings.MEDIA_ROOT, p.id_image)
            if os.path.exists(image_path):
                image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{p.id_image}")

        data.append({
            'id': p.id,
            'name': p.name,
            'category': p.category,
            'short_description': p.short_description,
            'image': image_url
        })

    return JsonResponse({
        'products': data,
        'total': total_count,
        'page': page,
        'has_more': end < total_count
    })


# Product browsing
def get_product_by_id(request, product_id):
    """Возвращает подробности продукта по id, выбирая случайную реферальную ссылку."""
    try:
        product = Product.objects.get(id=product_id)

        image_url = None
        if product.id_image:
            image_path = os.path.join(settings.MEDIA_ROOT, product.id_image)
            if os.path.exists(image_path):
                image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{product.id_image}")

        cities_entries = CityList.objects.filter(product=product).select_related('city')
        cities_names = [entry.city.name for entry in cities_entries]

        target_link = None
        links_qs = Refferals.objects.filter(product=product)

        if links_qs.exists():
            links_list = list(links_qs)
            target_link = random.choice(links_list)

        data = {
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'short_description': product.short_description,
            'image': image_url,
            'category': product.category,
            'cities': cities_names,
            'source_url': target_link.referral_link if target_link else None,
            'referral_id': target_link.id if target_link else None,
            'data': product.data.isoformat() if product.data else None,
        }

        return JsonResponse(data, status=200)

    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)


def create_product(request):
    """Создает продукт сотрудником (с городами и опциональной реферальной ссылкой)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    employee, error_resp = verify_employee(request)
    if error_resp:
        return error_resp

    try:
        name = request.POST.get('name', '').strip()
        category = request.POST.get('category', '').strip()
        short_desc = request.POST.get('short_description', '').strip()
        description = request.POST.get('description', '').strip()
        source_url = request.POST.get('source_url', '').strip()
        cities_list = request.POST.getlist('cities')

        if not all([name, category, short_desc, cities_list]):
            return JsonResponse({'error': 'Заполните название, категорию, описание и выберите города'}, status=400)

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

        with transaction.atomic():
            product = Product.objects.create(
                name=name,
                category=category,
                short_description=short_desc,
                description=description,
                id_image=image_filename,
            )

            for city_val in cities_list:
                city_obj = City.objects.filter(name=city_val).first() or City.objects.filter(id=city_val).first()
                if city_obj:
                    CityList.objects.get_or_create(product=product, city=city_obj)

            if source_url:
                Refferals.objects.create(
                    product=product,
                    client=employee,
                    referral_link=source_url
                )

        return JsonResponse({
            'message': 'Продукт успешно добавлен',
            'product_id': product.id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# Catalog filters / lists
def get_filtered_product_ids(request):
    """Возвращает список id продуктов по фильтрам category/city/search/sort."""
    category = request.GET.get('category', 'all')
    city_id = request.GET.get('city_id', 'all')
    search = request.GET.get('search', '')
    sort = request.GET.get('sort', 'newest')

    queryset = Product.objects.all()

    if category and category != 'all':
        queryset = queryset.filter(category=category)

    if city_id and city_id != 'all':
        queryset = queryset.filter(citylist__city_id=city_id)

    if search:
        queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))

    if sort == 'newest':
        queryset = queryset.order_by('-data')
    else:
        queryset = queryset.order_by('data')

    ids_list = list(queryset.values_list('id', flat=True))
    return JsonResponse({'ids': ids_list})


def get_all_cities(request):
    """Возвращает список всех городов (id, name)."""
    cities = list(City.objects.values('id', 'name'))
    return JsonResponse(cities, safe=False)


def get_popular_products(request):
    """Возвращает id самых популярных продуктов (топ-3)."""
    popular_products = Product.objects.order_by('-data')[:3]
    data = []
    for p in popular_products:
        data.append(p.id)
    return JsonResponse(data, safe=False)


# Auth helpers / user management
def check_is_employee(request):
    """Проверяет, является ли текущий пользователь сотрудником."""
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '')

    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        return JsonResponse({'is_employee': user.is_employee}, status=200)
    except User.DoesNotExist:
        return JsonResponse({'is_employee': False, 'error': 'User not found'}, status=404)
    except Exception as e:
        print(e)
        return JsonResponse({'is_employee': False, 'error': str(e)}, status=500)


def verify_employee(request):
    """Верифицирует сотрудника по токену из Authorization и возвращает (user, error_response)."""
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


def get_cities(request):
    """Возвращает список городов (для фронтенда)."""
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    cities = list(City.objects.values('id', 'name'))
    return JsonResponse(cities, safe=False)


def delete_referral_link(request):
    """Удаляет реферальную ссылку (только сотрудник и только свои записи)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '').strip()

    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        if not user.is_employee:
            return JsonResponse({'error': 'Access denied'}, status=403)

        data = json.loads(request.body)
        referral_id = data.get('referral_id')

        if not referral_id:
            return JsonResponse({'error': 'Referral ID required'}, status=400)

        referral = Refferals.objects.get(id=referral_id, client=user)
        referral.delete()

        return JsonResponse({'message': 'Referral deleted'}, status=200)

    except Refferals.DoesNotExist:
        return JsonResponse({'error': 'Referral not found or access denied'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_user_by_token(request):
    """Возвращает пользователя по токену из заголовка Authorization."""
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Token ', '').strip()

    if not token:
        return None

    try:
        return User.objects.get(token=token)
    except User.DoesNotExist:
        return None


def login_view(request):
    """Аутентификация пользователя (email/phone + password) и выдача токена."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        identifier = data.get('identifier', '').strip()
        password = data.get('password', '')

        if not identifier or not password:
            return JsonResponse({'error': 'Заполните все поля'}, status=400)

        user = None
        if '@' in identifier:
            user = User.objects.filter(email=identifier).first()
        else:
            user = User.objects.filter(phone=identifier).first()

        if not user:
            return JsonResponse({'error': 'Пользователь не найден'}, status=401)

        if not check_password(password, user.password):
            return JsonResponse({'error': 'Неверный пароль'}, status=401)

        new_token = secrets.token_hex(32)
        user.token = new_token
        user.save()

        avatar_url = ""
        if user.id_image:
            avatar_url = request.build_absolute_uri(f'{settings.MEDIA_URL}{user.id_image}')

        return JsonResponse({
            'token': new_token,
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'city': user.city,
            'is_employee': user.is_employee,
            'avatar_url': avatar_url
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def logout_view(request):
    """Выход пользователя: очищает токен."""
    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    user.token = ""
    user.save()

    return JsonResponse({'message': 'Successfully logged out'})


def validate_token_view(request):
    """Проверяет токен и возвращает данные пользователя (если валиден)."""
    user = get_user_by_token(request)

    if not user:
        return JsonResponse({'valid': False})

    avatar_url = ""
    if user.id_image:
        avatar_url = request.build_absolute_uri(f'{settings.MEDIA_URL}{user.id_image}')

    return JsonResponse({
        'valid': True,
        'user': {
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': user.phone,
            'city': user.city,
            'is_employee': user.is_employee,
            'avatar_url': avatar_url
        }
    })


def verify_employee(request):
    """Проверка: является ли пользователь работником (дублирует verify_employee, оставлено как отдельная вьюха)."""
    user = get_user_by_token(request)

    if not user:
        return None, JsonResponse({'error': 'Unauthorized'}, status=401)

    if not user.is_employee:
        return None, JsonResponse({'error': 'Access denied. Employees only.'}, status=403)

    return user, None


def update_profile(request):
    """Обновляет профиль пользователя (имя, фамилия, город, пароль, аватар)."""
    if request.method not in ['POST', 'PUT', 'PATCH']:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    user = get_user_by_token(request)
    if not user:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    first_name = request.POST.get('first_name', user.first_name)
    last_name = request.POST.get('last_name', user.last_name)
    city = request.POST.get('city', user.city)

    user.first_name = first_name
    user.last_name = last_name
    user.city = city

    new_password = request.POST.get('newPassword')
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

    avatar_url = ""
    if user.id_image:
        avatar_url = request.build_absolute_uri(f'{settings.MEDIA_URL}{user.id_image}')

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
            'avatar_url': avatar_url,
        }
    })


def register_init_view(request):
    """Шаг 1: Валидация, создание записи, отправка письма."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        phone = data.get('phone', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        password = data.get('password', '')
        city = data.get('city', '').strip()

        if not all([email, phone, first_name, last_name, password]):
            return JsonResponse({'error': 'Заполните все обязательные поля'}, status=400)

        if len(password) < 6:
            return JsonResponse({'error': 'Пароль должен быть не менее 6 символов'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Пользователь с такой почтой уже существует'}, status=400)

        if User.objects.filter(phone=phone).exists():
            return JsonResponse({'error': 'Этот номер телефона уже зарегистрирован'}, status=400)

        code = str(random.randint(100000, 999999))

        if RegisterUser.objects.filter(email=email).exists():
            RegisterUser.objects.filter(email=email).delete()

        RegisterUser.objects.create(
            email=email,
            phone=phone,
            first_name=first_name,
            last_name=last_name,
            password=make_password(password),
            city=city,
            code=code
        )

        try:
            subject = 'Код подтверждения для BankOffers'
            message = (
                f'Здравствуйте, {first_name}!\n\n'
                f'Ваш код для подтверждения регистрации: {code}\n\n'
                f'Введите его на сайте.'
            )

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            print(f"Письмо с кодом {code} отправлено на {email}")
            return JsonResponse({'message': 'Код успешно отправлен на почту', 'email': email})

        except Exception as e:
            print(f"Ошибка отправки письма: {e}")
            return JsonResponse(
                {'error': 'Код сохранен, но не удалось отправить письмо (проверьте настройки сервера)'},
                status=500
            )

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def register_verify_view(request):
    """Шаг 2: Проверка кода и создание реального пользователя."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        code = data.get('code', '').strip()

        if not email or not code:
            return JsonResponse({'error': 'Введите почту и код'}, status=400)

        try:
            pending = RegisterUser.objects.get(email=email, code=code)
        except RegisterUser.DoesNotExist:
            return JsonResponse({'error': 'Неверный код или почта'}, status=400)

        if timezone.now() > pending.created_at + timedelta(minutes=15):
            pending.delete()
            return JsonResponse({'error': 'Код устарел. Попробуйте зарегистрироваться снова.'}, status=400)

        User.objects.create(
            email=pending.email,
            phone=pending.phone,
            first_name=pending.first_name,
            last_name=pending.last_name,
            password=pending.password,
            city=pending.city,
            is_employee=False,
            token=''
        )

        pending.delete()
        return JsonResponse({'message': 'Регистрация успешна! Теперь вы можете войти.'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def reset_password_view(request):
    """Сброс пароля: генерация нового пароля и отправка на email."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()

        if not email:
            return JsonResponse({'error': 'Введите почту'}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({'error': 'Пользователь с такой почтой не найден'}, status=404)

        new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(10))

        user.password = make_password(new_password)
        user.save()

        try:
            subject = 'Восстановление пароля для BankOffers'
            message = (
                f'Здравствуйте, {user.first_name}!\n\n'
                f'Ваш новый пароль для входа: {new_password}\n\n'
                f'Рекомендуем сменить его после входа в личный кабинет.\n'
                f'Если вы не запрашивали сброс пароля — проигнорируйте это письмо.'
            )

            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            print(f"Письмо с новым паролем отправлено на {email}")
            return JsonResponse({'message': 'Новый пароль отправлен на вашу почту'})

        except Exception as mail_error:
            print(f"Ошибка отправки письма: {mail_error}")
            return JsonResponse({'error': 'Не удалось отправить письмо. Попробуйте позже.'}, status=500)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
