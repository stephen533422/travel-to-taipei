import json
import mysql.connector

db_config={
'host':'localhost',
'database':'taipei_day_trip',
'user':'root',
'password':'1234'
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="pool",
    pool_size=5,
    pool_reset_session=True,
    **db_config
)

with open("./taipei-day-trip/data/taipei-attractions.json","r",encoding="utf-8") as f:
    file = json.load(f)
    datas = file["result"]["results"]

mrts={}
categories={}
i=1
j=1
for data in datas:
    if data["MRT"] not in mrts and data["MRT"] != None:
        temp_dict={data["MRT"]:i}
        mrts.update(temp_dict)
        i=i+1
    if data["CAT"] not in categories:
        temp_dict={data["CAT"].replace(u'\u3000',u''):j}
        data["CAT"] = data["CAT"].replace(u'\u3000',u'')
        categories.update(temp_dict)
        j=j+1

connection=connection_pool.get_connection()
if connection.is_connected():
    cursor=connection.cursor()
    insert_stmt="INSERT INTO mrts( mrt_name, id) VALUES( %s, %s)"
    for item in mrts.items():
        cursor.execute(insert_stmt, item)
    insert_stmt="INSERT INTO categories( cat_name, id) VALUES( %s, %s)"
    for item in categories.items():
        cursor.execute(insert_stmt, item)
    connection.commit()
    cursor.close()
    connection.close()

connection=connection_pool.get_connection()
for data in datas:    
    image=data["file"].split("https://")
    images=[]
    for k in range(0, len(image)):
        if".JPG" in image[k] or ".jpg" in image[k] or ".png" in image[k] or ".PNG" in image[k]:
            images.append("https://" + image[k])


    if connection.is_connected():
        cursor=connection.cursor()
        insert_stmt="INSERT INTO attractions( id, name, category_id, description, address, direction, mrt_id, longitude, latitude) VALUES( %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        if data["MRT"]==None:
            attraction_data = (data["_id"], data["name"], categories[data["CAT"]], data["description"], data["address"], data["direction"], None, float(data["longitude"]), float(data["latitude"]))
        else:
            attraction_data = (data["_id"], data["name"], categories[data["CAT"]], data["description"], data["address"], data["direction"], mrts[data["MRT"]], float(data["longitude"]), float(data["latitude"]))
        cursor.execute(insert_stmt, attraction_data)

        placeholders = ', '.join(['%s']* len(images))
        update_stmt="UPDATE attractions SET images=JSON_ARRAY( %s) where id= %s;" % (placeholders, data["_id"])
        cursor.execute(update_stmt, images)
        connection.commit()
if connection.is_connected():
    cursor.close()
    connection.close()
