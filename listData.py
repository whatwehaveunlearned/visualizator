#Simple Script for creating json object with datasets name.
#Add your dataset to datasets folder and then run this command $python listData.py
import os
list=os.listdir("./datasets")
text="databasesList=["
for name in list:
	if name != ".DS_Store":
		text=text+"{name:'"+name+"'},"
print text[:-1]
file = open("datasets.json", "w")
file.write(text[:-1]+"]" );
