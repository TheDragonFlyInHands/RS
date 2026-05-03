from django.db import models

class City(models.Model):
    """Таблица: City"""
    name = models.CharField(max_length=100, verbose_name="Название")

    class Meta:
        db_table = 'City'
        verbose_name = 'Город'
        verbose_name_plural = 'Города'

    def __str__(self):
        return self.name


class User(models.Model):
    """Таблица: User"""
    email = models.EmailField(max_length=100, verbose_name="Email", unique=True)
    phone = models.CharField(max_length=20, verbose_name="Телефон", unique=True)
    last_name = models.CharField(max_length=50, verbose_name="Фамилия")
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    password = models.CharField(max_length=100, verbose_name="Пароль")
    city = models.CharField(max_length=50, blank=True, null=True, verbose_name="Город")
    is_employee = models.BooleanField(default=False, verbose_name="Является работником (is_employeee)")
    token = models.CharField(max_length=255, blank=True, null=True, verbose_name="Токен")
    id_image = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ссылка на изображение")

    class Meta:
        db_table = 'User'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.surname} {self.first_name}"


class Product(models.Model):
    """Таблица: Product"""
    name = models.CharField(max_length=100, verbose_name="Название")
    description = models.TextField(verbose_name="Описание")
    # Связь с работником (employeey_id)
    id_image = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ссылка на фото")
    short_description = models.CharField(max_length=255, verbose_name="Краткое описание")
    data = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания (data)")
    category = models.CharField(max_length=50, blank=True, verbose_name="Категория")

    class Meta:
        db_table = 'Product'
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'

    def __str__(self):
        return self.name


class Refferals(models.Model):
    """Таблица: Refferals"""
    # Связь с клиентом (client_id)
    client = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='referrals', 
        verbose_name="Клиент (client_id)"
    )
    # Связь с продуктом (product_id)
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='referrals', 
        verbose_name="Продукт (product_id)"
    )
    referral_link = models.URLField(verbose_name="Ссылка на рефералку")

    class Meta:
        db_table = 'Refferals'
        verbose_name = 'Реферал'
        verbose_name_plural = 'Рефералы'

    def __str__(self):
        return f"Реферал от {self.client} для {self.product}"


class CityList(models.Model):
    """Таблица: CityList (Связь продукта с городами)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Продукт (id_product)")
    city = models.ForeignKey(City, on_delete=models.CASCADE, verbose_name="Город (id_city)")

    class Meta:
        db_table = 'CityList'
        verbose_name = 'Доступность продукта в городе'

    def __str__(self):
        return f"{self.product} в городе {self.city}"


class Requests(models.Model):
    """Таблица: Заявки"""
    client = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Клиент (client_id)")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Продукт (product_id)")
    ref = models.ForeignKey(
        Refferals, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        verbose_name="Реферал (ref_id)"
    )

    class Meta:
        db_table = 'Заявки'
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'

    def __str__(self):
        return f"Заявка #{self.id}"


class Statistics(models.Model):
    """Таблица: Statistics"""
    ref = models.ForeignKey(
        Refferals, 
        on_delete=models.CASCADE, 
        related_name='stats', 
        verbose_name="Реферал (id_ref)"
    )
    views_count = models.IntegerField(default=0, verbose_name="Просмотрено")
    clicks_count = models.IntegerField(default=0, verbose_name="Переходов")

    class Meta:
        db_table = 'Statistics'
        verbose_name = 'Статистика'
        verbose_name_plural = 'Статистика'

    def __str__(self):
        return f"Статистика для {self.ref}"

class RegisterUser(models.Model):
    """Таблица: Ожидающие регистрации пользователи"""
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Телефон", unique=True)
    last_name = models.CharField(max_length=50, verbose_name="Фамилия")
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    password = models.CharField(max_length=128, verbose_name="Пароль (хешированный)")
    city = models.CharField(max_length=50, blank=True, null=True, verbose_name="Город")
    code = models.CharField(max_length=10, verbose_name="Код подтверждения")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        db_table = 'RegisterUser'
        verbose_name = 'Ожидающий регистрации пользователь'
        verbose_name_plural = 'Ожидающие регистрации'

    def __str__(self):
        return f"{self.email} (код: {self.code})"