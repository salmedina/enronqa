from sys import stderr

from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from enron.models import HistoryQuestion
from enron.serializers import HistoryQuestionSerializer


def index(request):
    context = {
        'name': 'Zhong'
    }
    return render(request, 'enron/index.html', context)

class HistoryQuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = HistoryQuestion.objects.all()
    serializer_class = HistoryQuestionSerializer

@api_view(['GET', 'POST'])
def history_questions(request):
    if request.method == 'GET':
        history_questions = HistoryQuestion.objects.all().order_by('-id')
        serializer = HistoryQuestionSerializer(history_questions[:10], many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = HistoryQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)