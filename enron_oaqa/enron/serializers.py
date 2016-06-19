from rest_framework import serializers

from .models import HistoryQuestion

class HistoryQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoryQuestion