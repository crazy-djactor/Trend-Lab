import wikipedia

def get_wikipedia_summary(term,char_limit=280):
    summary = wikipedia.summary(term)

    try:
        summary = summary[0:char_limit]
    except:
        pass
    return summary
