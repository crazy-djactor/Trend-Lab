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


# Create your views here.
@login_optional
def index(request, username, idtoken):
    context = {
        "username": username
    }
    return render(request, 'landingpage.html', context)


# @login_required
# def search_results(request, username, idtoken):
#     query_term = request.GET.get('q', '')
#     location = request.GET.get('geo', '')
#     original_term = request.GET.get('originalTerm', '')
#     timespan = request.GET.get('timeperiod', '')
#     print(query_term, location, original_term)
#
#     # prep datetime strings for now and 1 year ago
#     stop = datetime.datetime.utcnow().strftime('%Y-%m-%d')
#     start_obj = datetime.datetime.utcnow() - datetime.timedelta(days=1 * 365)
#     start = start_obj.strftime('%Y-%m-%d')
#     year_filter = start + " " + stop
#     # get interest data
#     if query_term != '':
#         # getting related queries
#         # if timespan is not defined default to 5 years
#         if timespan == '' or timespan == ' ':
#             timespan = "today 5-y"
#
#         init_session()
#         build_pload(query_term, geo=location, timeframe=timespan)
#         related_queries = get_related_queries(query_term)
#         related_topics = get_related_topics(query_term)
#         region_interest = get_interest_by_region(query_term)
#
#         init_session()
#         interest_data_5y = fetch_interest_over_time(query_term, timeframe='today 5-y')
#         init_session()
#         interest_data_12m = fetch_interest_over_time(query_term, timeframe=year_filter)
#         init_session()
#         interest_data_1m = fetch_interest_over_time(query_term, timeframe='today 1-m')
#
#         wikipedia_summary = get_wikipedia_summary(original_term)
#         top_news = get_top_news(original_term)
#     else:
#         interest_data_5y, interest_data_1m, interest_data_12m = None, None, None
#         related_queries, related_topics, wikipedia_summary, region_interest, top_news = None, None, None, None, None
#
#     chart_data_dump = json.dumps({
#         "interest_data_5y": interest_data_5y,
#         "interest_data_12m": interest_data_12m,
#         "interest_data_1m": interest_data_1m
#     })
#     # loading current country name in server  - easier that way
#     cur_country_name = pycountry.countries.get(alpha_2=location)
#     if cur_country_name == None:
#         cur_country_name = 'Worldwide'
#     else:
#         # print(cur_country_name)
#         cur_country_name = cur_country_name.name
#
#     # print(type(related_queries), related_queries)
#     # print(type(related_topics), related_topics)
#     context = {
#         "username": username,
#         "chart_data": chart_data_dump,
#         "related_queries": related_queries,
#         "search_term_name": original_term,
#         "related_topics": related_topics,
#         "wikipedia_summary": wikipedia_summary,
#         "region_interest": region_interest,
#         "top_news": top_news,
#         "countries": pycountry.countries,
#         "current_country": location,
#         "current_country_name": cur_country_name,
#         "year_filter": year_filter,
#         "timespan": timespan
#     }
#     return render(request, 'search_results.html', context)


@login_required
def search_results(request, username=None, idtoken=None):
    query_term = request.GET.get('q', '')
    location = request.GET.get('geo', '')
    original_term = request.GET.get('originalTerm', '')
    timespan = request.GET.get('timeperiod', '')
    print(query_term, location, original_term)

    # prep datetime strings for now and 1 year ago
    stop = datetime.datetime.utcnow().strftime('%Y-%m-%d')
    start_obj = datetime.datetime.utcnow() - datetime.timedelta(days=1 * 365)
    start = start_obj.strftime('%Y-%m-%d')
    year_filter = start + " " + stop
    # get interest data
    if query_term != '':
        interest_data_5y = fetch_interest_over_time(query_term, geo=location, timeframe='today 5-y')

        interest_data_12m = fetch_interest_over_time(query_term, geo=location, timeframe=year_filter)
        interest_data_1m = fetch_interest_over_time(query_term, geo=location, timeframe='today 1-m')

        # getting related queries
        # if timespan is not defined default to 5 years
        if timespan == '' or timespan == ' ':
            timespan = "today 5-y"

        related_queries = get_related_queries(query_term, geo=location, timeframe=timespan)
        related_topics = get_related_topics(query_term, geo=location, timeframe=timespan)
        region_interest = get_interest_by_region(query_term, geo=location, timeframe=timespan)
        wikipedia_summary = get_wikipedia_summary(original_term)
        top_news = get_top_news(original_term)
    else:
        interest_data_5y, interest_data_1m, interest_data_12m = None, None, None
        related_queries, related_topics, wikipedia_summary, region_interest, top_news = None, None, None, None, None

    chart_data_dump = json.dumps({
        "interest_data_5y": interest_data_5y,
        "interest_data_12m": interest_data_12m,
        "interest_data_1m": interest_data_1m
    })
    # loading current country name in server  - easier that way
    cur_country_name = pycountry.countries.get(alpha_2=location)
    if cur_country_name == None:
        cur_country_name = 'Worldwide'
    else:
        print(cur_country_name)
        cur_country_name = cur_country_name.name

    print(type(related_queries), related_queries)
    print(type(related_topics), related_topics)
    context = {
        "username": username,
        "chart_data": chart_data_dump,
        "related_queries": related_queries,
        "search_term_name": original_term,
        "related_topics": related_topics,
        "wikipedia_summary": wikipedia_summary,
        "region_interest": region_interest,
        "top_news": top_news,
        "countries": pycountry.countries,
        "current_country": location,
        "current_country_name": cur_country_name,
        "year_filter": year_filter,
        "timespan": timespan
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
