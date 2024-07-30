"""
使用前須把教務處課表檔(.xls)另存新檔成raw_data.xlsx(然後放在同個資料夾)
之後用這個python檔可以轉成json
"""
import pandas as pd
import json
import openpyxl

# Read the Excel file, skipping the header row
df = pd.read_excel('raw_data.xlsx', header=0, engine="openpyxl")

# Create a dictionary to store the processed data
processed_data = {}

# Map day numbers to day names
day_map = {1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday'}

# Map class numbers to Chinese characters
class_map = {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七'}

# Process each row in the dataframe
for _, row in df.iterrows():
    class_no = str(row.iloc[2])  # Class number (column C)
    day = day_map[row.iloc[6]]  # Day of the week (column G)
    class_time = class_map[row.iloc[7]]  # Which class of the day (column H)
    subject = row.iloc[5]  # Subject (column F)

    # If the class number doesn't exist in the processed data, create it
    if class_no not in processed_data:
        processed_data[class_no] = {
            "schedule": [
                {"name": class_name, 
                 "Monday": {"subject": "", "note": "", "color": "Default"},
                 "Tuesday": {"subject": "", "note": "", "color": "Default"},
                 "Wednesday": {"subject": "", "note": "", "color": "Default"},
                 "Thursday": {"subject": "", "note": "", "color": "Default"},
                 "Friday": {"subject": "", "note": "", "color": "Default"}
                } for class_name in class_map.values()
            ] + [{"name": "課後", 
                  "Monday": {"subject": "", "note": "", "color": "Default"},
                  "Tuesday": {"subject": "", "note": "", "color": "Default"},
                  "Wednesday": {"subject": "", "note": "", "color": "Default"},
                  "Thursday": {"subject": "", "note": "", "color": "Default"},
                  "Friday": {"subject": "", "note": "", "color": "Default"}}]
        }

    # Update the subject for the specific class and day
    for schedule in processed_data[class_no]["schedule"]:
        if schedule["name"] == class_time:
            schedule[day]["subject"] = subject
            break

# Write the processed data to a JSON file
with open('ProcessedClassesSchedule.json', 'w', encoding='utf-8') as f:
    json.dump(processed_data, f, ensure_ascii=False, indent=2)

print("Processing complete. Data saved to ProcessedClassesSchedule.json")
