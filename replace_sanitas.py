import os

files_to_check = ['index.html', 'app.js', 'modelo/patrones/Visitor.js', 'modelo/patrones/TemplateMethod.js']

for file in files_to_check:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("Fundación Santa Fe de Bogotá", "Sanitas EPS")
    content = content.replace("Fundación Santa Fe", "Sanitas EPS")
    content = content.replace("Santa Fe - Admin", "Sanitas - Admin")
    content = content.replace("Santa Fe de Bogotá", "Sanitas EPS")
    content = content.replace("Fundación", "EPS")
    content = content.replace("❄", "💙")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
