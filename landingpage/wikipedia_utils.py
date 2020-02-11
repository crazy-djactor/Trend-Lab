import wikipedia

def get_wikipedia_summary(term,char_limit=280):
    try:
        summary = wikipedia.summary(term)
    except wikipedia.DisambiguationError as e:
        print(e.options)
        count = 0
        return_string = "<ul>"
        for option in e.options:
            if count > 4:
                break
            page = wikipedia.page(option)
            try:
                return_string += ("<li><a href=" + page.url +">" + page.title + "</a></li>")
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
