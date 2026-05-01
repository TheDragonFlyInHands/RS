from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('products/filter/', views.get_filtered_product_ids, name='filter_products'),
    path('product/<int:product_id>/', views.get_product_by_id, name='product_detail'),
    path('products/popular/', views.get_popular_products, name='popular_products'),

    path('auth/login/', views.login_view, name='login'),
    path('auth/reset-password/', views.reset_password_view, name='reset_password'),
    path('auth/validate/', views.validate_token_view, name='validate_token'),

    path('auth/update-profile/', views.update_profile, name='update_profile'),

    path('auth/check-employee/', views.check_is_employee, name='check_employee'),

    path('cities/', views.get_cities, name='get_cities'),
    path('cities/', views.get_all_cities, name='get_all_cities'),          
    path('products/new/', views.create_product, name='create_product'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)