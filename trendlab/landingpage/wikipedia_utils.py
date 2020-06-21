import wikipedia

def get_wikipedia_summary(term,char_limit=280):
    try:
        summary = wikipedia.summary(term)
    except wikipedia.DisambiguationError as e:
        print(e.options)
        count = 0
        return_string = "<ul id='disambig-items'>"
        for option in e.options:
            if count > 15:
                break
            page = wikipedia.page(option)
            try:
                return_string += ("<li onclick='showItemSummary(this)'><a>" + page.title + "</a></li>")
                count += 1
            except:
                pass

        return_string += "</ul>"
        return [return_string, "links"]
    except:
        return ['', "empty"]

    try:
        summary = summary[0:char_limit]
    except:
        pass
    return [summary, "summary"]
