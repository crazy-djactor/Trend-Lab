from GoogleNews import GoogleNews
import json


def get_top_news(term, limit=5):
    googlenews = GoogleNews()
    googlenews.search(term)
    googlenews.setlang('en')
    googlenews.setperiod('d')
    result = googlenews.result()
    try:
        result = result
    except:
        pass

    return json.dumps(result)
