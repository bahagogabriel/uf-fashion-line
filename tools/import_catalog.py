#!/usr/bin/env python3
"""Import verified merchant product records from CSV into UF Fashion Line's static store.
No network calls or external packages required. Does not fabricate merchandise.
Usage: python tools/import_catalog.py path/to/verified-products.csv
"""
import csv
import json
import re
import sys
import unicodedata
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import urlparse

BASE = Path(__file__).resolve().parents[1]
REQUIRED = {'name', 'category', 'price', 'image'}
COLUMNS = {'id','name','category','price','image','model_image','extra_images','description','tag','sizes'}


def slug(text):
    ascii_text = unicodedata.normalize('NFKD', str(text)).encode('ascii','ignore').decode()
    return re.sub('-+', '-', re.sub('[^a-z0-9]+', '-', ascii_text.lower())).strip('-') or 'product'


def safe_image(raw, rownum, required=True):
    raw = str(raw or '').strip()
    if not raw:
        if required: raise ValueError(f'Line {rownum}: an actual product photo URL/path is required.')
        return ''
    if re.match(r'^https://', raw, re.I):
        parsed=urlparse(raw)
        if not parsed.hostname: raise ValueError(f'Line {rownum}: invalid image URL')
        return raw
    if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:',raw) or raw.startswith('//') or raw.startswith(('/', '\\')):
        raise ValueError(f'Line {rownum}: image must be HTTPS or a safe relative local path')
    local=Path(raw)
    if '..' in local.parts or not (BASE / local).is_file():
        raise ValueError(f'Line {rownum}: local image not found inside project: {raw}')
    return raw.replace('\\','/')


def parse_price(raw,rownum):
    text=str(raw or '').strip()
    if not text:
        return None
    cleaned=re.sub(r'(?i)(NGN|₦|Naira|\s|,)', '', text)
    try:
        val=Decimal(cleaned)
        if not val.is_finite() or val <= 0 or val != val.to_integral_value(): raise ValueError()
        return int(val)
    except (InvalidOperation, ValueError):
        raise ValueError(f'Line {rownum}: price should be an exact naira amount, e.g. 15000.')


def main():
    if len(sys.argv)!=2: raise SystemExit('Usage: python tools/import_catalog.py products.csv')
    csv_path=Path(sys.argv[1])
    if not csv_path.is_file(): raise SystemExit(f'CSV file not found: {csv_path}')
    with csv_path.open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f)
        headers=set(reader.fieldnames or [])
        if REQUIRED-headers: raise SystemExit(f'CSV missing required headers: {sorted(REQUIRED-headers)}')
        products=[]
        ids=set()
        for lineno,row in enumerate(reader,2):
            if not any(v and v.strip() for v in row.values() if isinstance(v,str)): continue
            name=(row.get('name') or '').strip()
            category=(row.get('category') or '').strip()
            if not name or not category: raise ValueError(f'Line {lineno}: name and category required')
            pid=slug(row.get('id') or name)
            if pid in ids: raise ValueError(f'Line {lineno}: duplicated product ID {pid}')
            ids.add(pid)
            img=safe_image(row.get('image'),lineno)
            model=safe_image(row.get('model_image'),lineno,required=False)
            gallery=[safe_image(x,lineno) for x in (row.get('extra_images') or '').split('|') if x.strip()]
            sizes=[i.strip() for i in (row.get('sizes') or '').split('|') if i.strip()]
            products.append({
                'id':pid,'name':name,'category':category,'tag':(row.get('tag') or '').strip() or 'THE COLLECTION',
                'description':(row.get('description') or '').strip(),
                'price':parse_price(row.get('price'),lineno),
                'images':{'product':img,'gallery':gallery,'model':model},'concept':False,
                'modelConcept':bool(model), 'sizes':sizes
            })
    if not products: raise SystemExit('No products found; the existing catalog is unchanged.')
    target=BASE/'catalog.js'
    if target.exists(): (BASE/'catalog.backup.js').write_text(target.read_text(encoding='utf-8'),encoding='utf-8')
    target.write_text('/* Verified merchant catalogue, imported from CSV. Review stock, prices and image permissions. */\nwindow.UF_PRODUCTS = '+json.dumps(products,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(f'Imported {len(products)} product(s). Wrote catalog.js; previous file backed up as catalog.backup.js.')
    print('Check products and prices with the shop owner before publishing.')

if __name__=='__main__':
    try: main()
    except ValueError as e: raise SystemExit(str(e))
