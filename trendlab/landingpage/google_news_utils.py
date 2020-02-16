from GoogleNews import GoogleNews



def get_top_news(term, limit=3):
    googlenews = GoogleNews()
    googlenews.search(term)
    result = googlenews.result()
    try:
        result = result
    except:
        pass

    return result
