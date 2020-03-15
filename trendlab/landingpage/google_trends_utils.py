from pytrends.request import TrendReq
import pandas as pd
import numpy as np
from scipy import signal
import json


def fetch_interest_over_time(term, geo='GB', timeframe='today 5-y',proxies=''):
    """
    Gets data for interest over time
    Args:
        term(str): The search term
        geo(str): The location
    """
    pytrends = None
    try:
        pytrends = TrendReq(hl='en-US', tz=0)

        kw_list = [term]
        pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')
        interest_dataframe = pytrends.interest_over_time()

        interest_values = list(interest_dataframe[term])
        date_values_d64 = list(interest_dataframe.index.values)
        date_values = []
        for date in date_values_d64:
            date_values.append(np.datetime_as_string(date, unit='D'))
    except:
        interest_values = []
        date_values = []

    return_dict = {
        "interest_values": interest_values,
        "date_values": date_values,
    }
    return return_dict, pytrends


def get_related_queries(sessiontrend=None, term='', geo='GB', timeframe='today 5-y'):
    kw_list = [term]

    if sessiontrend is None:
        pytrends = TrendReq(hl='en-US', tz=0)
        pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')
    else:
        pytrends = sessiontrend

    related_queries = pytrends.related_queries()
    #print(related_queries)
    try:
        if 0 < len(related_queries[term]['rising'].index) <= 3:
            related_queries = related_queries[term]['rising'].values.tolist()
        elif len(related_queries[term]['rising'].index) == 0:
            related_queries = []
        else:
            related_queries = related_queries[term]['rising'].values.tolist()
    except:
        related_queries = []

    # return related_queries
    return json.dumps(related_queries)


def get_related_topics(sessiontrend=None, term='', geo='GB', timeframe='today 5-y'):
    kw_list = [term]

    if sessiontrend is None:
        pytrends = TrendReq(hl='en-US', tz=0)
        pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')
    else:
        pytrends = sessiontrend

    related_topics = pytrends.related_topics()
    related_topics = related_topics[term]['rising'].values.tolist()
    #print(len(related_topics), related_topics)
    # return related_topics
    return json.dumps(related_topics)


def get_interest_by_region(sessiontrend=None, term='', geo='GB', timeframe='today 5-y', resolution="COUNTRY"):
    kw_list = [term]
    if sessiontrend is None:
        pytrends = TrendReq(hl='en-US', tz=0)
        pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')
    else:
        pytrends = sessiontrend

    top_regions = pytrends.interest_by_region(resolution=resolution, inc_low_vol=True, inc_geo_code=False)
    region_names = list(top_regions[term])
    region_score = list(top_regions.index.values)
    #print("Debug region stuff: ", region_names, region_score)
    result = []
    for i in range(len(region_names)):
        result.append([region_names[i], region_score[i]])

    result = sorted(result, key=lambda l: l[0], reverse=True)
    i = range(len(result))
    for i in range(len(result)):
        if result[i][0] == 0:
            break

    return result[:i]