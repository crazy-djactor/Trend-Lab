
import time
t = time.time()
from pytrends.request import TrendReq
from GoogleNews import GoogleNews



kw_list = ["Blockchain"]

# Google Trends
#
# pytrends = TrendReq(hl='en-US', tz=360)
# pytrends.build_payload(kw_list, cat=0, timeframe='today 5-y', geo='', gprop='')
# pytrends.get_historical_interest(kw_list, cat=0, year_start=2019, month_start=1, day_start=1, hour_start=0, year_end=2019, month_end=1, day_end=7, hour_end=0, geo='', gprop='')
# print(pytrends.interest_over_time())

# Google News
#
# i.g. "canned wine" after:2019-03-29 before:2019-04-07
googlenews = GoogleNews()
googlenews.search('APPL')
print(googlenews.result())

# googlenews.getpage(1)

exit()
elapsed = time.time() - t
print(elapsed)