from pytrends.request import TrendReq
import pandas as pd
import numpy as np



def fetch_interest_over_time(term, geo='GB', timeframe='today 5-y'):
    """
    Gets data for interest over time
    Args:
        term(str): The search term
        geo(str): The location
    """
    pytrends = TrendReq(hl='en-US', tz=0)

    kw_list = [term]
    pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')
    interest_dataframe = pytrends.interest_over_time()

    interest_values = list(interest_dataframe[term])
    date_values_d64 = list(interest_dataframe.index.values)
    date_values = []
    for date in date_values_d64:
        date_values.append(np.datetime_as_string(date, unit='D'))


    return_dict = {
        "interest_values": interest_values,
        "date_values": date_values,
    }

    return return_dict


def get_related_queries(term, geo='GB', timeframe='today 5-y'):

    pytrends = TrendReq(hl='en-US', tz=0)

    kw_list = [term]
    pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')

    related_queries = pytrends.related_queries()
    related_queries = related_queries[term]['top'][:3].values.tolist()
    return related_queries


def get_related_topics(term, geo='GB', timeframe='today 5-y'):

    pytrends = TrendReq(hl='en-US', tz=0)

    kw_list = [term]
    pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')

    related_topics = pytrends.related_topics()
    related_topics = related_topics[term]['top'][:3].values.tolist()
    return related_topics


def get_interest_by_region(term, geo='GB', timeframe='today 5-y', resolution="COUNTRY"):

    pytrends = TrendReq(hl='en-US', tz=0)

    kw_list = [term]
    pytrends.build_payload(kw_list, cat=0, timeframe=timeframe, geo=geo, gprop='')

    top_regions = pytrends.interest_by_region(resolution=resolution, inc_low_vol=True, inc_geo_code=False)
    region_names = list(top_regions[term])
    region_score = list(top_regions.index.values)
    result = []
    for i in range(len(region_names)):
        result.append([region_names[i], region_score[i]])

    result = sorted(result,key=lambda l:l[0], reverse=True)
    return result[:4]
