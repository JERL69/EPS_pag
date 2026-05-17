with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace spans containing the blue heart logo with image tags pointing to their logo file
content = content.replace('<span class="logo-symbol">💙</span>', '<img class="logo-sns-img" src="Logo SNS.png" alt="Sanitas Logo">')
content = content.replace('<span class="brand-symbol">💙</span>', '<img class="brand-sns-img" src="Logo SNS.png" alt="Sanitas Logo">')
content = content.replace('<span class="brand-symbol-white">💙</span>', '<img class="sidebar-sns-img" src="Logo SNS.png" alt="Sanitas Logo">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement completed successfully!")
