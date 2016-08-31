from __future__ import division
import json
import re
from sys import stderr

from django.shortcuts import render
import requests
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser
from rest_framework.response import Response

from enron.models import HistoryQuestion
from enron.serializers import HistoryQuestionSerializer

import solr
from textblob import TextBlob
from textblob.taggers import NLTKTagger
from nltk.corpus import stopwords

import datetime as dt

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
        # display 10 unique questions
        questions_to_display = []
        for q in history_questions:
            if len(questions_to_display) < 10 and q.question not in [qq.question for qq in questions_to_display]:
                questions_to_display.append(q)
        serializer = HistoryQuestionSerializer(questions_to_display, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = HistoryQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@parser_classes((JSONParser,))
def get_answers(request):
    useEnron = request.data['options']['useEnron']
    useLiveQA = request.data['options']['useLiveQA']

    result = {}
    result['answerResource'] = 'Enron'
    result['answerText'] = ''
    result['candidates'] = []

    # Requesting info from LIVE-QA
    if useLiveQA:
        url = "http://gold.lti.cs.cmu.edu:18072/liveqa"
        data = {"qid":"20130828153959AAtXAEs",
                "title":request.data['title'],
                "body":"",
                "category":""}
        headers = {'Content-type': 'application/json', 'Accept': 'application/json'}
        r = requests.post(url, data=json.dumps(data), headers=headers)
        result = json.loads("".join(r))
        for answer in result['candidates']:
            answer['shortUrl'] = 'LiveQA - {}'.format(re.search(r"https?://([^/]+)/", answer['url']).group(1))

    if useEnron:
        if not useLiveQA:
            # Create empty answer template
            result = {}
            result['answerResource'] = 'Enron'
            result['answerText'] = ''
            result['candidates'] = []

        # Requesting info from Enron Solr index
        core_url = 'http://metal.lti.cs.cmu.edu:7574/solr/enron_shard1_replica1'
        core = solr.SolrConnection(core_url)
        solr_query = '{} & fl=*,score'.format(request.data['title'])
        solr_res = core.query(solr_query)


        for solr_result in solr_res.results:
            tmp_formatted_input = {}
            tmp_formatted_input['url'] = '#'
            tmp_formatted_input['shortUrl'] = 'Enron Corpus - {}'.format(solr_result['file'][0])
            tmp_formatted_input['score'] = solr_result['score']
            tmp_formatted_input['bestAnswer'] = solr_result['body'][0].replace('\n','<br/>')

            result['candidates'].append(tmp_formatted_input)

    result['candidates'] = sorted(result['candidates'], key=lambda k: k['score'], reverse=True)

    # Highlighting the results
    # Consider only nouns, verbs, adjectives and adverbs
    valid_pos_tags = ['FW','JJ','JJR','JJS','NN','NNS','NNP','NNPS', 'RB', 'RBR', 'RBS', 'VB','VBD','VBG','VBN','VBZ','']
    # Remove the stopwords from the english dictionary
    stop = set(stopwords.words('english'))
    # Filter out the terms to highlight
    nltk_tagger = NLTKTagger()
    query_blob = TextBlob(request.data['title'], pos_tagger=nltk_tagger)
    highlight_terms = []
    for word, word_pos in query_blob.pos_tags:
        if word_pos in valid_pos_tags and word not in stop:
            highlight_terms.append(str(word))

    # Tag them with HTML spans
    for term in highlight_terms:
        highlight_regex = re.compile(r"\b{}\b".format(term), re.IGNORECASE)
        for i in range(len(result['candidates'])):
            result['candidates'][i]['bestAnswer'] = highlight_regex.sub('<span class="relevantEntity">'+term+'</span>', result['candidates'][i]['bestAnswer'])

    # Normalize scores
    score_sum = 0
    for i in range(len(result['candidates'])):
        score_sum += result['candidates'][i]['score']
    for i in range(len(result['candidates'])):
        result['candidates'][i]['rank'] = i + 1
        result['candidates'][i]['score'] = '%.4f'%(result['candidates'][i]['score']/score_sum)

    result['candidates'] = result['candidates'][:20]

    return Response({'answers': result})
