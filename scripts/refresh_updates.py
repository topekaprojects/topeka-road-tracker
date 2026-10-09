"""Scheduled public RSS headline digest, not a live road-closure API."""
import json, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
query=urllib.parse.quote('Topeka road closure construction when:7d')
url='https://news.google.com/rss/search?q='+query+'&hl=en-US&gl=US&ceid=US:en'
path=Path('data/community-updates.json')
try:
    req=urllib.request.Request(url,headers={'User-Agent':'TopekaCommunityTracker/1.0'})
    with urllib.request.urlopen(req,timeout=20) as response: root=ET.fromstring(response.read())
    items=[]
    for item in root.findall('./channel/item')[:10]:
        title=item.findtext('title','').strip()
        link=item.findtext('link','').strip()
        date=item.findtext('pubDate','').strip()
        publisher=item.findtext('source','News feed').strip()
        if title and link.startswith('https://'):
            items.append({'title':title[:220],'url':link,'date':date,'publisher':publisher[:100]})
    if not items: raise ValueError('Empty news feed')
    path.write_text(json.dumps({'generated_at':datetime.now(timezone.utc).isoformat(),'items':items},indent=2))
    print('Updated',len(items),'news headlines')
except Exception as exc:
    print('Feed refresh failed; preserving previous data:',exc)
