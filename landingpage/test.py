
import time
t = time.time()
from pytrends.request import TrendReq



pytrends = TrendReq(hl='en-US', tz=360)

kw_list = ["Blockchain"]

# pytrends.build_payload(kw_list, cat=0, timeframe='today 5-y', geo='', gprop='')
# pytrends.get_historical_interest(kw_list, cat=0, year_start=2019, month_start=1, day_start=1, hour_start=0, year_end=2019, month_end=1, day_end=7, hour_end=0, geo='', gprop='')

print(pytrends.interest_over_time())

elapsed = time.time() - t
print(elapsed)