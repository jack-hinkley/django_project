#!/usr/bin/python
# -*- coding: utf-8 -*-

# import csv, sqlite3

# con = sqlite3.connect("smartbasket_items.db")
# cur = con.cursor()
# cur.execute("CREATE TABLE smartbasket_sqlite3 (grp_id, upc14, upc12, brand, name);") # use your column names here

# with open('Grocery_UPC_Database.csv','rb') as fin: # `with` statement available in 2.5+
#     # csv.DictReader uses first line in file for column headings by default
#     dr = csv.DictReader(fin) # comma is default delimiter
#     to_db = [(unicode(i['grp_id'], "utf8"), unicode(i['upc14'], "utf8"), unicode(i['upc12'], "utf8"), unicode(i['brand'], "utf8"), unicode(i['name'], "utf8")) for i in dr]

# cur.executemany("INSERT INTO smartbasket_sqlite3 (grp_id, upc14, upc12, brand, name) VALUES (?, ?, ?, ?, ?);", to_db)
# con.commit()
# con.close()
