#!/usr/bin/env python3
import requests
import sys
import os

API_BASE = os.environ.get('API_BASE', 'http://181.140.119.7:8000')
API_KEY = os.environ.get('API_KEY', '1027801124J')
HEADERS = {'x-api-key': API_KEY}


def call_action(arg):
    if arg in ('1', 'on', 'true', 'encender'):
        path = '/rele/1'
    elif arg in ('0', 'off', 'false', 'apagar'):
        path = '/rele/0'
    else:
        print('Unknown action', arg)
        return 2
    try:
        r = requests.post(API_BASE + path, headers=HEADERS, timeout=(5,10))
        r.raise_for_status()
        try:
            print(r.json())
        except Exception:
            print(r.text)
        return 0
    except Exception as e:
        print('Error calling remote API:', e, file=sys.stderr)
        return 1


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: control_call.py <1|0|on|off>')
        sys.exit(2)
    code = call_action(sys.argv[1])
    sys.exit(code)
