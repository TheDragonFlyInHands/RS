from django.db import models

# ===========================
# Справочники и основные сущности
# ===========================

class City(models.Model):
    """города"""
    name = models.CharField(max_length=100, verbose_name="Название города")

    class Meta:
        db_table = 'cities'
        verbose_name = 'Город'
        verbose_name_plural = 'Города'

    def __str__(self):
        return self.name


class Employee(models.Model):
    """работники"""
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    surname = models.CharField(max_length=50, verbose_name="Фамилия")
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    password = models.CharField(max_length=255, verbose_name="Пароль")

    class Meta:
        db_table = 'employees'
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'

    def __str__(self):
        return f"{self.surname} {self.first_name}"


class User(models.Model):
    """пользователи"""
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Телефон")
    surname = models.CharField(max_length=50, verbose_name="Фамилия")
    first_name = models.CharField(max_length=50, verbose_name="Имя")
    password = models.CharField(max_length=255, verbose_name="Пароль")
    address = models.TextField(blank=True, null=True, verbose_name="Адрес проживания")

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return f"{self.surname} {self.first_name}"


class Product(models.Model):
    """продукты (предложения банка)"""
    name = models.CharField(max_length=150, verbose_name="Название продукта")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    employee = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True,
        db_column='employee_id', verbose_name="Ответственный сотрудник"
    )
    id_image = models.CharField(max_length=255, blank=True, null=True, verbose_name="Ссылка на изображение")
    short_description = models.TextField(blank=True, null=True, verbose_name="Краткое описание")
    city = models.ForeignKey(
        City, on_delete=models.SET_NULL, null=True, blank=True,
        db_column='address', verbose_name="Город (address)"
    )
    date = models.DateField(db_column='data', verbose_name="Дата создания/актуальности")
    category = models.CharField(max_length=100, blank=True, null=True, verbose_name="Категория")

    class Meta:
        db_table = 'products'
        verbose_name = 'Банковский продукт'
        verbose_name_plural = 'Продукты'

    def __str__(self):
        return self.name


class ProductCity(models.Model):
    """список городов (доступность продукта в городах)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='id_product', verbose_name="Продукт")
    city = models.ForeignKey(City, on_delete=models.CASCADE, db_column='id_city', verbose_name="Город")

    class Meta:
        db_table = 'product_cities'
        unique_together = ('product', 'city')
        verbose_name = 'Доступность в городе'
        verbose_name_plural = 'Доступность продуктов'

    def __str__(self):
        return f"{self.product.name} - {self.city.name}"


# ===========================
# Реферальная система и заявки
# ===========================

class Referral(models.Model):
    """рефералки"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column='employee_id', verbose_name="Сотрудник")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id', verbose_name="Продукт")
    referral_url = models.URLField(blank=True, null=True, db_column='referral_url', verbose_name="Ссылка на рефералку")

    class Meta:
        db_table = 'referrals'
        verbose_name = 'Реферальная ссылка'
        verbose_name_plural = 'Рефералки'

    def __str__(self):
        return f"Рефералка {self.id}"


class Request(models.Model):
    """заявки"""
    client = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='client_id', verbose_name="Клиент")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column='product_id', verbose_name="Продукт")
    referral = models.ForeignKey(Referral, on_delete=models.SET_NULL, null=True, blank=True, db_column='ref_id', verbose_name="Реферальная ссылка")

    class Meta:
        db_table = 'requests'
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'

    def __str__(self):
        return f"Заявка #{self.id}"


# ===========================
# Поддержка и аналитика
# ===========================

class TechSupport(models.Model):
    """тех поддержка"""
    client = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Клиент")
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, verbose_name="Сотрудник поддержки")

    class Meta:
        db_table = 'tech_support'
        verbose_name = 'Тикет поддержки'
        verbose_name_plural = 'Техподдержка'

    def __str__(self):
        return f"Тикет #{self.id}"


class Chat(models.Model):
    """чат"""
    technical_specialist = models.ForeignKey(
        Employee, on_delete=models.CASCADE, 
        db_column='technical_specialist_id', verbose_name="Специалист поддержки"
    )
    message = models.TextField(verbose_name="Сообщение")
    number_message = models.IntegerField(verbose_name="Номер сообщения")

    class Meta:
        db_table = 'chat'
        verbose_name = 'Сообщение чата'
        verbose_name_plural = 'Чат'

    def __str__(self):
        return f"Сообщение #{self.number_message}"


class Dashboard(models.Model):
    """деш-борд (статистика)"""
    request = models.ForeignKey(Request, on_delete=models.CASCADE, db_column='id_ref', verbose_name="Заявка/Рефералка")
    views_count = models.IntegerField(default=0, db_column='view_count', verbose_name="Количество просмотров")
    clicks_count = models.IntegerField(default=0, db_column='click_count', verbose_name="Количество переходов")

    class Meta:
        db_table = 'dashboard'
        verbose_name = 'Запись статистики'
        verbose_name_plural = 'Дашборд'

    def __str__(self):
        return f"Статистика для #{self.request_id}"