#!/usr/bin/env python3
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
result = []
inserted_nav = False
inserted_view = False

for i, line in enumerate(lines):
    # Insert analytics nav tab before settings in admin nav
    if not inserted_nav and '"settings"' in line and 'Sliders' in line and i > 0 and '"shop"' in lines[i-1] and 'Store' in lines[i-1]:
        result.append('        { id: "analytics", label: "অ্যানালিটিক্স", icon: BarChart3 },')
        inserted_nav = True
    # Insert analytics view before settings view
    if not inserted_view and 'activeTab === "settings"' in line and 'admin' in line:
        result.append('')
        result.append('            {userRole === "admin" && activeTab === "analytics" && (')
        result.append('              <Analytics />')
        result.append('            )}')
        result.append('')
        inserted_view = True
    result.append(line)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(result))

if inserted_nav:
    print('Nav tab inserted successfully')
else:
    print('Nav tab NOT inserted - check patterns')
if inserted_view:
    print('View rendering inserted successfully')
else:
    print('View rendering NOT inserted - check patterns')