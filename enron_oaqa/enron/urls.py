from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from rest_framework.urlpatterns import format_suffix_patterns

from enron import views


# router = routers.DefaultRouter()
# router.register(r'historyquestions', views.HistoryQuestionViewSet)


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'enron_oaqa.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^$', views.index, name='index'),

#     url(r'^api/', include(router.urls)),
    
    url(r'^api/history_questions/', views.history_questions),

    url(r'^api/get_answers/', views.get_answers),

    url(r'^admin/', include(admin.site.urls)),
)
