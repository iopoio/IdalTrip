import docx
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
    
    doc = docx.Document(file_path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

# Path to the manual
manual_path = r"c:\Projects\Automation\IdalTrip\download\개방데이터_활용매뉴얼(국문)\한국관광공사_개방데이터_활용매뉴얼(국문)_v4.4.docx"

print("--- Extracting Manual Text ---")
text = read_docx(manual_path)

# Look for keyword context (Service Key, API Key, etc.)
lines = text.split('\n')
target_keywords = ['ServiceKey', '서비스키', '인증키', 'API', '호출']

relevant_lines = []
for i, line in enumerate(lines):
    if any(key in line for key in target_keywords):
        # Grab some context lines
        context = lines[max(0, i-2):min(len(lines), i+3)]
        relevant_lines.append("\n".join(context))
        relevant_lines.append("-" * 30)

if relevant_lines:
    print("\n".join(relevant_lines[:30])) # Show first 30 matches for speed
else:
    print("No relevant keywords found in the first pass.")
