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

    path('dashboard/stats/', views.get_employee_dashboard, name='dashboard_stats'),
    path('dashboard/add-referral/', views.add_referral_link, name='add_referral'),
    path('dashboard/track/view/', views.track_view, name='track_view'),
    path('dashboard/track/click/', views.track_click, name='track_click'),
    path('dashboard/search-products/', views.search_products_for_referral, name='search_products'),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)