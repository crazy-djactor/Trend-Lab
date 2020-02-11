import wikipedia

def get_wikipedia_summary(term,char_limit=280):
    try:
        summary = wikipedia.summary(term)
    except:
        return ''

    try:
        summary = summary[0:char_limit]
    except:
        pass
    return summary
