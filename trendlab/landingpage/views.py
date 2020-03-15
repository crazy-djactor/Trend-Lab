import time

from django.shortcuts import render
from django.core.exceptions import SuspiciousOperation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .decorators import login_required, login_optional
import requests
import json
from .google_trends_utils import fetch_interest_over_time, get_related_queries, get_related_topics, \
    get_interest_by_region
import datetime
from .wikipedia_utils import get_wikipedia_summary
from .google_news_utils import get_top_news
import pycountry
import requests
from lxml.html import fromstring


# def get_proxies():
#     url = 'https://free-proxy-list.net/'
#     response = requests.get(url)
#     parser = fromstring(response.text)
#     proxies = []
#     for i in parser.xpath('//tbody/tr')[:10]:
#         if i.xpath('.//td[7][contains(text(),"yes")]'):
#             #Grabbing IP and corresponding PORT
#             proxy = "https://" + ":".join([i.xpath('.//td[1]/text()')[0], i.xpath('.//td[2]/text()')[0]])
#             proxies.append(proxy)
#     return proxies
# proxies = get_proxies()

# Create your views here.
@login_optional
def index(request, username, idtoken):
    context = {
        "username": username
    }
    return render(request, 'landingpage.html', context)


@csrf_exempt
def get_search_result(request):
    s_query_term = request.POST.get('q', None)
    # query_term = json_data['q']
    if request.POST.get('geo') is not None and request.POST.get('geo') != '':
        location = request.POST.get('geo')
    else:
        location = 'US'
    if request.POST.get('originalTerm') is not None and request.POST.get('originalTerm') != '':
        original_term = request.POST.get('originalTerm')
    else:
        original_term = ''
    if request.POST.get('timeperiod') is not None and request.POST.get('timeperiod') != '':
        timespan = request.POST.get('timeperiod')
    else:
        timespan = ''

    print(s_query_term, location, original_term)
    # return JsonResponse(response_data)
    # prep datetime strings for now and 1 year ago
    year_filter = ''
    # # get interest data
    try:
        if s_query_term != '':
            # if timespan is not defined default to 5 years
            if timespan == '' or timespan == ' ':
                response_data = {
                    'query_term': s_query_term,
                    'location': location
                }
                return JsonResponse(response_data)
            # getting related queries
            if timespan == 'yearfilter':
                stop = datetime.datetime.utcnow().strftime('%Y-%m-%d')
                start_obj = datetime.datetime.utcnow() - datetime.timedelta(days=1 * 365)
                start = start_obj.strftime('%Y-%m-%d')
                year_filter = start + " " + stop
                time_frame = year_filter
            else:
                time_frame = timespan
            chart_interest_data, session_trends = fetch_interest_over_time(term=s_query_term, geo=location,
                                                                               timeframe=time_frame)
            time.sleep(1)
            related_queries = get_related_queries(sessiontrend=session_trends, term=s_query_term, geo=location,
                                                  timeframe=time_frame)
            time.sleep(1)
            related_topics = get_related_topics(sessiontrend=session_trends, term=s_query_term, geo=location,
                                                timeframe=time_frame)
            time.sleep(1)
            region_interest = get_interest_by_region(sessiontrend=session_trends, term=s_query_term, geo=location,
                                                     timeframe=time_frame)
            time.sleep(1)
            wiki_summary = get_wikipedia_summary(original_term)
            top_news = get_top_news(original_term)
        else:
            chart_interest_data = None
            related_queries, related_topics, wiki_summary, region_interest, top_news = None, None, None, None, None

        # loading current country name in server  - easier that way
        cur_country_name = pycountry.countries.get(alpha_2=location)

        if cur_country_name is None:
            cur_country_name = 'Worldwide'
        else:
            # print(cur_country_name)
            cur_country_name = cur_country_name.name

        response_data = {
            "chart_data": chart_interest_data,
            "related_queries": related_queries,
            "query_term": s_query_term,
            "search_term_name": original_term,
            "related_topics": related_topics,
            "wikipedia_summary": wiki_summary,
            "region_interest": region_interest,
            "top_news": top_news,
            "countries": list(pycountry.countries),
            "current_country": location,
            "current_country_name": cur_country_name,
            "timespan": timespan,
            "yearfilter": year_filter,
        }
        return JsonResponse(response_data)
    except (RuntimeError, TypeError, NameError):
        pass
        raise SuspiciousOperation("Invalid request; incorrect parameters/headers supplied")


@login_required
def search_results(request, username, idtoken):
    query_term = request.GET.get('q', '')
    location = request.GET.get('geo', '')
    original_term = request.GET.get('originalTerm', '')
    timespan = request.GET.get('timeperiod', '')
    print(query_term, location, original_term)

    # get interest data
    if query_term != '':
        if timespan == '' or timespan == ' ':
            timespan = "today 5-y"

        chart_interest_data, session_trends = fetch_interest_over_time(term=query_term, geo=location, timeframe=timespan)
        time.sleep(1)
        related_queries = get_related_queries(sessiontrend=session_trends, term=query_term, geo=location,
                                              timeframe=timespan)
        time.sleep(1)
        related_topics = get_related_topics(sessiontrend=session_trends, term=query_term, geo=location,
                                            timeframe=timespan)
        time.sleep(1)
        region_interest = get_interest_by_region(sessiontrend=session_trends, term=query_term, geo=location,
                                                 timeframe=timespan)
        time.sleep(1)
        wiki_summary = get_wikipedia_summary(original_term)
        top_news = get_top_news(original_term)
    else:
        chart_interest_data = None
        related_queries, related_topics, wiki_summary, region_interest, top_news = None, None, None, None, None

    # loading current country name in server  - easier that way
    cur_country_name = pycountry.countries.get(alpha_2=location)

    if cur_country_name is None:
        cur_country_name = 'Worldwide'
    else:
        # print(cur_country_name)
        cur_country_name = cur_country_name.name

    # print(type(related_queries), related_queries)
    # print(type(related_topics), related_topics)
    context = {
        "username": username,
        "chart_data": chart_interest_data,
        "related_queries": related_queries,
        "search_term_name": original_term,
        "related_topics": related_topics,
        "wikipedia_summary": wiki_summary,
        "region_interest": region_interest,
        "top_news": top_news,
        "countries": list(pycountry.countries),
        "current_country": location,
        "current_country_name": cur_country_name,
        "timespan": timespan,
        "query_term": query_term,
    }
    return render(request, 'search_results.html', context)


@csrf_exempt
def search_autocomplete(request):
    # get posted json
    json_data = json.loads(request.body)
    # call to google api
    url = "https://trends.google.com/trends/api/autocomplete/" + json_data['term']
    headers = {
        'Authorization': 'Bearer MD97ZG32QL93DJ90',
        'Accept': 'application/json'
    }
    params = {
        "tz": json_data['tz'],
        "hl": json_data['hl']
    }
    resp = requests.get(url, params=params, headers=headers)

    if 200 <= resp.status_code <= 299:
        response_data = json.loads(resp.text.lstrip(")]}\',\n"))
        return JsonResponse(response_data)
    else:
        print(resp.text)
        # return error
        raise SuspiciousOperation("Invalid request; incorrect parameters/headers supplied")


@csrf_exempt
def load_wikipedia_summary(request):
    json_data = json.loads(request.body)
    summary = get_wikipedia_summary(json_data['term'])
    resp_dict = {
        "summary": summary
    }
    return JsonResponse(resp_dict)


def privacy(request):
    return render(request, 'privacy.html')


def termsandconditions(request):
    return render(request, 'terms-and-conditions.html')


def signup(request):
    return render(request, 'signup.html')


def login(request):
    return render(request, 'login.html')


def recoverypassword(request):
    return render(request, 'recovery-password.html')


@login_required
def settings(request, username, idtoken):
    interest_list = ["All Categories", "Brand", "Business", "Company", "Design", "Eco", "Education", "Fashion",
                     "Fitness", "Food", "Gaming", "Health", "Home", "Legal", "Lifestyle", "Luxury", "Marketing",
                     "Media", "Money", "People", "Product", "Sales", "Science", "Social", "Software", "Sports",
                     "Startup", "Technology", "Travel", "Web"]
    interest_data = [dict(id="All_cat", name=interest_list[0])]
    for item in interest_list[1:]:
        interest_data.append(dict(id=item, name=item))

    context = {
        "username": username,
        "interest_list": interest_data,
    }

    return render(request, 'settings.html', context)
