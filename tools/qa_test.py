#!/usr/bin/env python3
"""
Hot Meal Bar - automated QA harness.

Runs static analysis + data integrity + HTTP smoke tests without any
external dependencies (stdlib only). Run from the project root:

    python tools/qa_test.py            # static + data checks
    python tools/qa_test.py --http     # also hit the running dev server

Exit code is non-zero if any check fails, so it can gate a deploy.
"""
import os, re, json, sys, urllib.request

ROOT = os.getcwd()
DO_HTTP = '--http' in sys.argv
BASE = 'http://127.0.0.1:5500'

passes, warnings, errors = [], [], []
def P(m): passes.append(m)
def W(m): warnings.append(m)
def E(m): errors.append(m)

# ---- Gather source ----
js_files, html_files = [], [os.path.join(ROOT, 'index.html')]
for dp, _, files in os.walk(os.path.join(ROOT, 'src')):
    for f in files:
        if f.endswith('.js'):
            js_files.append(os.path.join(dp, f))

code = {}
for fp in js_files + html_files:
    with open(fp, encoding='utf-8') as fh:
        code[fp] = fh.read()

def rel(fp): return os.path.relpath(fp, ROOT).replace('\\', '/')

# ---- 1. window.app handlers: referenced vs defined ----
ref_re = re.compile(r'window\.app\.([A-Za-z_]\w*)\s*\(')
def_re = re.compile(r'window\.app\.([A-Za-z_]\w*)\s*=')
refs, defs = set(), set()
for c in code.values():
    refs |= set(ref_re.findall(c))
    defs |= set(def_re.findall(c))
missing = sorted(refs - defs)
if missing:
    E(f"window.app handlers referenced in markup but never bound: {missing}")
else:
    P(f"All {len(refs)} window.app.* click handlers are bound.")

# ---- 2. JSON validity ----
data_dir = os.path.join(ROOT, 'data')
for f in sorted(os.listdir(data_dir)):
    if f.endswith('.json'):
        try:
            json.load(open(os.path.join(data_dir, f), encoding='utf-8'))
            P(f"data/{f} is valid JSON")
        except Exception as ex:
            E(f"data/{f} invalid JSON: {ex}")

# ---- 3. Referenced local assets/data exist ----
path_re = re.compile(r'\./((?:assets|data)/[A-Za-z0-9_\-./]+\.[A-Za-z0-9]+)')
missing_files = set()
for c in code.values():
    for m in path_re.findall(c):
        if not os.path.exists(os.path.join(ROOT, m)):
            missing_files.add(m)
if missing_files:
    E(f"Referenced files missing on disk: {sorted(missing_files)}")
else:
    P("Every referenced ./assets and ./data file exists on disk.")

# ---- 4. meals.json deep validation ----
meals = json.load(open(os.path.join(data_dir, 'meals.json'), encoding='utf-8'))
required = ['mealId', 'mealName', 'category', 'price', 'rating', 'image', 'prepTime', 'description', 'ingredients']
bad = [m.get('mealId', '?') for m in meals if any(k not in m for k in required)]
if bad:
    E(f"Meals missing required fields: {bad}")
else:
    P(f"All {len(meals)} meals have the required fields.")
ids = [m['mealId'] for m in meals]
if len(ids) != len(set(ids)):
    E("Duplicate mealId values found.")
else:
    P("All mealId values are unique.")
local_imgs = [m['image'][2:] for m in meals if str(m['image']).startswith('./')]
miss_imgs = sorted({x for x in local_imgs if not os.path.exists(os.path.join(ROOT, x))})
if miss_imgs:
    E(f"Meal images missing: {miss_imgs}")
else:
    P("All local meal images resolve.")
bad_price = [m['mealId'] for m in meals if not isinstance(m['price'], (int, float)) or m['price'] <= 0]
if bad_price:
    E(f"Meals with invalid price: {bad_price}")
else:
    P("All meal prices are positive numbers.")

# ---- 5. Category coverage ----
cats_used = {m['category'] for m in meals}
cust_fp = next(f for f in code if f.endswith('customer.js'))
declared = set()
for arr in re.findall(r"categories\s*=\s*\[([^\]]*)\]", code[cust_fp]):
    declared |= set(re.findall(r"'([^']+)'", arr))
uncovered = sorted(cats_used - declared)
if uncovered:
    E(f"Categories used by meals but absent from filter lists: {uncovered}")
else:
    P("Every meal category appears in the catalog/home filter lists.")

# ---- 6. Template-literal backtick balance ----
unbalanced = []
for fp in js_files:
    c = code[fp].replace('\\`', '')
    if c.count('`') % 2 != 0:
        unbalanced.append(rel(fp))
if unbalanced:
    E(f"Odd backtick count (possible broken template literal): {unbalanced}")
else:
    P("Template-literal backticks balanced across all JS files.")

# ---- 7. Currency consistency (RM, no stray $) ----
stray = [rel(fp) for fp in js_files if re.search(r'\$\$\{', code[fp])]
if stray:
    E(f"Stray $-currency templates found in: {stray}")
else:
    P("No stray $-currency templates - RM used throughout.")

# ---- 8. ES module import targets resolve ----
imp_re = re.compile(r"import\s+.*?from\s+'([^']+)'", re.S)
bad_imports = []
for fp in js_files:
    for spec in imp_re.findall(code[fp]):
        if spec.startswith('.'):
            target = os.path.normpath(os.path.join(os.path.dirname(fp), spec))
            if not os.path.exists(target):
                bad_imports.append(f"{rel(fp)} -> {spec}")
if bad_imports:
    E(f"Unresolved ES module imports: {bad_imports}")
else:
    P("All relative ES module imports resolve to files.")

# ---- 9. HTTP smoke test (optional) ----
if DO_HTTP:
    def get(u):
        try:
            with urllib.request.urlopen(BASE + u, timeout=8) as r:
                return r.status
        except Exception as ex:
            return str(ex)
    for u in ['/', '/src/js/app.js', '/src/js/components/enhance.js',
              '/data/meals.json', '/assets/logo-mark.jpeg', '/assets/dumplings-bowl.jpeg']:
        s = get(u)
        (P if s == 200 else E)(f"HTTP {s} {u}")

# ---- Report ----
print('=' * 64)
print(f"  Hot Meal Bar QA  |  PASS {len(passes)}   WARN {len(warnings)}   FAIL {len(errors)}")
print('=' * 64)
for m in passes:   print("  [PASS]", m)
for m in warnings: print("  [WARN]", m)
for m in errors:   print("  [FAIL]", m)
print('=' * 64)
sys.exit(1 if errors else 0)
