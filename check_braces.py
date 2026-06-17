import re

with open('components/admin/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
# Handle \r line endings
if len(lines) == 1 and '\r' in content:
    lines = content.split('\r')

balance = 0
in_string = None
in_comment = False
for i, line in enumerate(lines, 1):
    j = 0
    while j < len(line):
        ch = line[j]
        if in_comment:
            if ch == '*' and j + 1 < len(line) and line[j+1] == '/':
                in_comment = False
                j += 2
                continue
            j += 1
            continue
        if in_string:
            if ch == '\\':
                j += 2
                continue
            if ch == in_string:
                in_string = None
            j += 1
            continue
        if ch == '/' and j + 1 < len(line):
            if line[j+1] == '/':
                break
            if line[j+1] == '*':
                in_comment = True
                j += 2
                continue
        if ch in ('"', "'", '`'):
            in_string = ch
            j += 1
            continue
        if ch == '{':
            balance += 1
            if balance <= 5 or i > 1150:
                print(f'{i}:{j+1}  {{  balance={balance}')
        elif ch == '}':
            balance -= 1
            if balance <= 5 or i > 1150:
                print(f'{i}:{j+1}  }}  balance={balance}')
        j += 1

print(f'Final balance: {balance}')
