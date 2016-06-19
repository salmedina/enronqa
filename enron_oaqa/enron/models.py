from django.db import models


class HistoryQuestion(models.Model):
    question = models.CharField(max_length=255)