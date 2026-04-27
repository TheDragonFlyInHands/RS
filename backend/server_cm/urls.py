from django.urls import path
from . import views

urlpatterns = [
    path('products/filter/', views.get_filtered_product_ids, name='filter_products'),
    path('product/<int:product_id>/', views.get_product_by_id, name='product_detail'),
    path('products/popular/', views.get_popular_products, name='popular_products'),

    path('auth/login/', views.login_view, name='login'),
    path('auth/reset-password/', views.reset_password_view, name='reset_password'),
    path('auth/validate/', views.validate_token_view, name='validate_token'),

    path('auth/update-profile/', views.update_profile, name='update_profile'),
]