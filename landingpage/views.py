from django.shortcuts import render
from django.core.exceptions import SuspiciousOperation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .decorators import login_required, login_optional
import requests
import json
from .google_trends_utils import fetch_interest_over_time, get_related_queries, get_related_topics, get_interest_by_region
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

@login_required
def detailpage(request, username, idtoken):

	query_term = request.GET.get('q','')
	location = request.GET.get('geo','')
	original_term = request.GET.get('originalTerm', '')
	print(query_term, location, original_term)


	#get interest data
	if query_term != '':
		interest_data_5y = fetch_interest_over_time(query_term,geo=location, timeframe='today 5-y')
		#prep datetime strings for now and 1 year ago
		stop = datetime.datetime.utcnow().strftime('%Y-%m-%d')
		start_obj = datetime.datetime.utcnow() - datetime.timedelta(days=1*365)
		start = start_obj.strftime('%Y-%m-%d')
		year_filter = start + " " + stop
		interest_data_12m = fetch_interest_over_time(query_term,geo=location, timeframe=year_filter)
		interest_data_1m = fetch_interest_over_time(query_term,geo=location, timeframe='today 1-m')

		#getting related queries
		related_queries = get_related_queries(query_term, geo=location)
		related_topics = get_related_topics(query_term, geo=location)
		region_interest = get_interest_by_region(query_term, geo=location)
		wikipedia_summary = get_wikipedia_summary(original_term)
		top_news = get_top_news(original_term)
	else:
		interest_data_5y, interest_data_1m, interest_data_12m = None, None, None
		related_queries, related_topics, wikipedia_summary, region_interest, top_news = None, None, None, None, None



	chart_data_dump = json.dumps({
		"interest_data_5y":interest_data_5y,
		"interest_data_12m": interest_data_12m,
		"interest_data_1m": interest_data_1m
	})
	context = {
		"username": username,
		"chart_data":chart_data_dump,
		"related_queries": related_queries,
		"search_term_name":original_term,
		"related_topics": related_topics,
		"wikipedia_summary": wikipedia_summary,
		"region_interest": region_interest,
		"top_news": top_news,
		"countries": pycountry.countries,
		"current_country": location
	}
	return render(request, 'detailpage.html', context)

@csrf_exempt
def search_autocomplete(request):
	#get posted json
	json_data = json.loads(request.body)
	#call to google api
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
		#return error
		raise SuspiciousOperation("Invalid request; incorrect parameters/headers supplied")


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

def settings(request):
	return render(request, 'settings.html')
