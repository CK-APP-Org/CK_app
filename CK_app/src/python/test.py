# Import necessary libraries
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from bs4 import BeautifulSoup
from time import sleep
import pandas as pd
import os
import json

# Start a Chrome browser instance with remote debugging
os.system(r'start chrome --remote-debugging-port=9527 --user-data-dir="E:\code\Chrome"')

# Generate Classes list
classes=[]
for i in range(1,4):
    for j in range(1,29):
        if j != 24:
            classes.append(i*100+j)

data={}

# Set up Chrome options to connect to the running Chrome instance
options = Options()
options.add_experimental_option("debuggerAddress", "127.0.0.1:9527")
driver = webdriver.Chrome(options=options)

# Navigate to the web pages
driver.get("http://210.71.78.185/clash/")
for class_num in classes:
    driver.get(f"http://210.71.78.185/clash/down.asp?sqlstr={class_num}&type=class&selArrange=L&selWindow=Right&yt=112,1")

    # Sleep to allow the pages to fully load
    sleep(2)

    # Get the page source
    content = driver.page_source

    # Parse the page source with BeautifulSoup
    soup = BeautifulSoup(content, 'html.parser')

    # Extract elements with the class 'focus'
    elements_with_focus_class = soup.find_all(class_='focus')

    # Extract and store the text content of these elements

    element_text = []

    for element in range(len(elements_with_focus_class)):
        if element %5 == 0:
            temp = []
            if element != 0:
                element_text.append(temp)
        temp.append(elements_with_focus_class[element].text)

    # Add data into json file
    data[class_num] = element_text

    print(f'Currently on {class_num}')

print(data)

# Close the WebDriver
driver.close()
