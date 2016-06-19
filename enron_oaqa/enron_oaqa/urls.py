from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'enron_oaqa.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^enron/', include('enron.urls')),

    url(r'^admin/', include(admin.site.urls)),
)
