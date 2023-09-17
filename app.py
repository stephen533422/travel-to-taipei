from flask import *
import mysql.connector
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

db_config = {
  'host': 'localhost',
  'user': 'root',
  'password': '1234',
  'database': 'taipei_day_trip',
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name="pool",
    pool_size=5,
    pool_reset_session=True,
    **db_config
)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html", id=id)
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/attractions", methods=["GET"])
def api_attractions():
	page = int(request.args.get("page"))
	keyword = request.args.get("keyword")
	num = 12
	col_name= "attractions.id, name, categories.cat_name, description, address, direction, mrts.mrt_name, latitude, longitude, images"
	count_name = "COUNT(*)"
	select_base = "SELECT %s from attractions INNER JOIN categories ON categories.id=category_id INNER JOIN mrts ON mrts.id=mrt_id"
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor = connection.cursor(dictionary=True)
		if keyword:
			select_stmt = "SELECT mrt_name from mrts WHERE mrt_name = %s;"
			print(select_stmt)
			cursor.execute(select_stmt, (keyword,))
			isfind = cursor.fetchone()
			print(isfind)
			if isfind != None:
				select_stmt =  select_base%(count_name) + " WHERE mrt_name = %s;"
				print(select_stmt)
				cursor.execute(select_stmt, ( keyword,))
				total=cursor.fetchone()[count_name]
				select_stmt = select_base%(col_name) + " WHERE mrt_name = %s ORDER BY id ASC LIMIT %s,%s;"
				print(select_stmt)
				cursor.execute(select_stmt, ( keyword, page*num, num,))
			else:
				select_stmt =  select_base%(count_name) + " WHERE name LIKE %s;"
				search = "%"+keyword+"%"
				print(search)
				print(select_stmt)
				cursor.execute(select_stmt, ( search,))
				total=cursor.fetchone()[count_name]
				select_stmt = select_base%(col_name) + " WHERE name LIKE %s ORDER BY id ASC LIMIT %s,%s;"
				print(select_stmt)
				cursor.execute(select_stmt, ( search, page*num, num,))
		else:
			select_stmt =  select_base%(count_name)
			cursor.execute(select_stmt)
			total=cursor.fetchone()[count_name]
			select_stmt = select_base%(col_name) + " ORDER BY id ASC LIMIT %s,%s;"
			cursor.execute(select_stmt, (page*num, num,))
		datas = cursor.fetchall()
		cursor.close()
		connection.close()
		for data in datas:
			data=attractions_data(data)
		return_data={"data":datas}
		if(total>(page+1)*num):
			return_data.update({"nextPage":page+1})
		else:
			return_data.update({"nextPage":None})
		return jsonify(return_data), 200
	else:
		return_data={"error":True, "message":"connection failed"}
		return jsonify(return_data), 500


@app.route("/api/attraction/<attractionId>", methods=["GET"])
def api_attraction(attractionId):
	attraction_id=int(attractionId)
	col_name= "attractions.id, name, categories.cat_name, description, address, direction, mrts.mrt_name, latitude, longitude, images"
	select_base = "SELECT %s from attractions INNER JOIN categories ON categories.id=category_id INNER JOIN mrts ON mrts.id=mrt_id"
	select_stmt = select_base%(col_name) + " WHERE attractions.id = %s"
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor = connection.cursor(dictionary=True)
		cursor.execute(select_stmt, (attraction_id,))
		data=cursor.fetchone()
		cursor.close()
		connection.close()
		if data!=None:
			data=attractions_data(data)
			return_data={"data":data}
			return jsonify(return_data), 200
		else:
			return_data={"error": True, "message":"wrong attractionId"}
			return jsonify(return_data), 400
	else:
		return_data={"error": True, "message":"connection failed"}
		return jsonify(return_data), 500

def attractions_data(data):
	data["images"]=json.loads(data["images"])
	data.update({"category":data.pop("cat_name")})
	data.update({"transport":data.pop("direction")})
	data.update({"mrt":data.pop("mrt_name")})
	data.update({"lat":float(data.pop("latitude"))})
	data.update({"lng":float(data.pop("longitude"))})
	return data

@app.route("/api/mrts")
def api_mrts():
	select_stmt="SELECT mrts.mrt_name, COUNT(mrt_id) from attractions INNER JOIN mrts ON mrts.id=mrt_id GROUP BY mrt_id ORDER BY COUNT(mrt_id) DESC;"
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor = connection.cursor(dictionary=True)
		cursor.execute(select_stmt)
		datas = cursor.fetchall()
		cursor.close()
		connection.close()
	else:
		return_data={"error": True, "message": "connection failed"}
		return jsonify(return_data), 500
	mrts=[]
	for data in datas:
		mrts.append(data["mrt_name"])
	return_data={"data":mrts}
	return jsonify(return_data), 200

app.run(host="0.0.0.0", port=3000)