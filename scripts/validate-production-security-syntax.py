#!/usr/bin/env python3
"""Local PG17 grammar check; never connects to a database.

Install the pinned, free parser into the excluded output directory:
scripts/codex-free-tools/.venv/bin/python -m pip install --only-binary=:all: \
  --no-deps --target output/production-release/sql-parser pglast==7.21
"""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'output/production-release/sql-parser'))
import pglast
from pglast import parser

FILES = sorted((ROOT / 'scripts').glob('security-*-policy.sql'))
FILES += sorted((ROOT / 'output/production-release/rpc-backup/proposed').glob('*.sql'))
results = []
for file in FILES:
    source = file.read_text()
    result = {'file': str(file.relative_to(ROOT)), 'sha256': hashlib.sha256(source.encode()).hexdigest()}
    try:
        result['sqlStatements'] = len(pglast.parse_sql(source))
        pglast.parse_plpgsql(source)
        result['passed'] = True
    except Exception as error:
        result.update(passed=False, error=str(error))
    results.append(result)
summary = {
    'passed': all(result['passed'] for result in results),
    'parser': f'pglast {pglast.__version__}', 'postgresGrammar': parser.get_postgresql_version(),
    'parserSource': 'https://github.com/lelit/pglast', 'parserLicense': 'GPL-3.0-or-later',
    'scope': 'Local SQL and PL/pgSQL grammar; no database connection or schema mutation',
    'limitations': 'Catalog types, grants, policy behavior and dynamic EXECUTE still require a server rollback dry run.',
    'results': results,
}
destination = ROOT / 'output/production-release/sql-syntax-verification.json'
destination.write_text(json.dumps(summary, indent=2) + '\n')
print(f"[production-security-syntax] {'PASS' if summary['passed'] else 'FAIL'} {sum(r['passed'] for r in results)}/{len(results)} files; PG{parser.get_postgresql_version()[0]} grammar")
for result in results:
    if not result['passed']:
        print(result['file'], result['error'])
sys.exit(0 if summary['passed'] else 1)
