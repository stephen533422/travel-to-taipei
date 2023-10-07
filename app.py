from flask import *
import mysql.connector
import os
import datetime
import jwt
import requests

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
key = os.urandom(12).hex()

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
	return render_template("attraction.html")
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

@app.route("/api/user", methods=["POST"])
def api_user():
    name = request.json.get("name")
    email = request.json.get("email")
    password = request.json.get("password")
    if (name=="" or name==None) or (email == "" or email==None) or (password == "" or password==None):
        return_data={"error": True, "message": "invalid username or password"}
        return jsonify(return_data), 400
    connection = connection_pool.get_connection()
    if connection.is_connected():
        cursor = connection.cursor(dictionary=True)
        select_stmt = "SELECT * FROM members WHERE email = %s;"
        cursor.execute(select_stmt, (email,))
        issigned = cursor.fetchone()
        if issigned != None:
            return_data={"error": True, "message": "already signedup"}
            cursor.close()
            connection.close()
            return jsonify(return_data), 400
        else:
            insert_stmt = "INSERT INTO members (name, email, password) VALUES( %s, %s, %s);"
            cursor.execute(insert_stmt, (name, email, password,))
            connection.commit()
        cursor.close()
        connection.close()
        return_data={"ok": True}
        return jsonify(return_data), 200
    else:
        return_data={"error": True, "message": "connection failed"}
        return jsonify(return_data), 500

def token_auth():
	if request.headers.get("Authorization"):
		token_type, token = request.headers.get('Authorization').split(" ")
		if token_type == "Bearer":
			try:
				data=jwt.decode(token, key, algorithms='HS256')
				#print(data)
				return data.get("data")
			except jwt.ExpiredSignatureError:
				print('token has expired')
			except:
				pass
	data=None
	return data

@app.route("/api/user/auth", methods=["GET","PUT"])
def api_user_auth():
	if request.method == "GET":
		user=token_auth()
		return jsonify({"data":user}), 200

	if request.method == "PUT":
		email = request.json.get("email")
		password = request.json.get("password")
		if (email == "" or email == None) or (password == "" or password == None):
			return_data={"error": True, "message": "invalid username or password"}
			return jsonify(return_data), 400
		connection = connection_pool.get_connection()
		if connection.is_connected():
			cursor=connection.cursor(dictionary=True)
			select_stmt=("SELECT * from members WHERE email = %s")
			cursor.execute(select_stmt, (email,))
			user = cursor.fetchone()
			cursor.close()
			connection.close()
			if user is not None:
				if email == user["email"] and password == user["password"]:
					exp_time = datetime.datetime.utcnow() + datetime.timedelta(days=7)
					data = {
						"id": user["id"],
						"name": user["name"],
						"email": user["email"]
					}
					payload = {
						"data": data,
						"expire": exp_time.timestamp()
					}
					token=jwt.encode(payload,key,algorithm = 'HS256')
					return jsonify({"token":token}), 200
				else:
					return_data={"error": True, "message": "invalid username or password"}
					return jsonify(return_data), 400
			else:
				return_data={"error": True, "message": "invalid username or password"}
				return jsonify(return_data), 400
		else:			
			return_data={"error": True, "message": "connection failed"}
			return jsonify(return_data), 500

@app.route("/api/booking", methods=["GET", "POST", "DELETE"])
def api_booking():
	user=token_auth()
	if user == None:
		return_data={"error": True, "message": "authentication failed"}
		return jsonify(return_data), 403
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor=connection.cursor(dictionary=True)
		select_stmt = "SELECT * FROM bookings WHERE member_id = %s"
		cursor.execute(select_stmt, (user["id"],))
		isbook = cursor.fetchone()
		if request.method == "GET":
			if isbook != None:
				select_stmt = "SELECT * FROM attractions WHERE id = %s"
				cursor.execute(select_stmt, (isbook["attraction_id"],))
				attraction_data = cursor.fetchone()
				data = {
					"attraction":{
						"id":attraction_data["id"], 
						"name":attraction_data["name"], 
						"address":attraction_data["address"], 
						"image": json.loads(attraction_data["images"])[0]
					},
					"date": isbook["date"].strftime("%Y-%m-%d"),
					"time": isbook["time"],
					"price": isbook["price"]}
				cursor.close()
				connection.close()
				return jsonify({"data":data}), 200
			else:
				cursor.close()
				connection.close()
				return jsonify({"data":None}), 200
		if request.method == "POST":
			booking = request.json
			if isbook != None: 
				update_stmt = "UPDATE bookings SET attraction_id = %s, date = %s, time = %s, price = %s WHERE member_id = %s"
				data =  (booking["attractionId"], booking["date"], booking["time"], booking["price"], user["id"])
				cursor.execute(update_stmt, data)
			else:
				insert_stmt = "INSERT INTO bookings (member_id, attraction_id, date, time, price) VALUES( %s, %s, %s, %s, %s);"
				data = (user["id"], booking["attractionId"], booking["date"], booking["time"], booking["price"])
				cursor.execute(insert_stmt, data)
			connection.commit()
			cursor.close()
			connection.close()
			return jsonify({"ok": True}), 200
		if request.method == "DELETE":
			if isbook != None:
				delete_stmt = "DELETE FROM bookings WHERE member_id = %s"
				cursor.execute(delete_stmt,(user["id"],))
				connection.commit()
			cursor.close()
			connection.close()
			return jsonify({"ok": True}), 200

@app.route("/api/orders", methods=["POST"])
def orders():
	user=token_auth()
	if user == None:
		return_data={"error": True, "message": "authentication failed"}
		return jsonify(return_data), 403
	orders = request.json
	print(orders)
	if (orders["order"]["contact"]["phone"] == '') or (orders["order"]["contact"]["name"] == '') or (orders["order"]["contact"]["email"] == '') :
		return_data = {"error": True,"message": "incomplete contact data"}
		return jsonify(return_data), 400
	url = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
	headers = {
	"Content-Type": "application/json",
	"x-api-key": "partner_GTwJKK2kHuh7hNXqQUUW3uxo2r2H7s2A3lHpgK9aRCU2pYRxQ6Dchfr1",
	}
	json_data = {
		"partner_key": "partner_GTwJKK2kHuh7hNXqQUUW3uxo2r2H7s2A3lHpgK9aRCU2pYRxQ6Dchfr1",
		"prime": orders["prime"],
		"amount": orders["order"]["price"],
		"merchant_id": "stephen533422_CTBC",
		"details": "taipei-day-trip test payment",
		"cardholder": {
			"phone_number": orders["order"]["contact"]["phone"],
			"name": orders["order"]["contact"]["name"],
			"email": orders["order"]["contact"]["email"],
		}
	}
	web = requests.post(url, json=json_data, headers=headers)
	print(web.json())
	response = web.json()
	if response["status"] != 0:
		return_data = {"error": True,"message": "create orders failed"}
		return jsonify(return_data), 400
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor=connection.cursor(dictionary=True)
		insert_stmt = "INSERT INTO orders (number, status, member_id, attraction_id, date, time, price, name, email, phone) VALUES( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
		data = (response["bank_transaction_id"], response["status"], user["id"], orders["order"]["trip"]["attraction"]["id"], \
				orders["order"]["trip"]["date"], orders["order"]["trip"]["time"], orders["order"]["price"], \
				orders["order"]["contact"]["name"], orders["order"]["contact"]["email"], orders["order"]["contact"]["phone"])
		cursor.execute(insert_stmt, data)
		connection.commit()
		cursor.close()
		connection.close()
	else:
		return_data={"error": True, "message": "connection failed"}
		return jsonify(return_data), 500
	return_data ={
		"data":{
			"number": response.get("bank_transaction_id"),
			"payment": {
			"status": response.get("status"),
			"message": response.get("msg"),
			}
		}
	}
	return return_data, 200 

@app.route("/api/order/<orderNumber>", methods=["GET"])
def check_ordernumber(orderNumber):
	user=token_auth()
	if user == None:
		return_data={"error": True, "message": "authentication failed"}
		return jsonify(return_data), 403
	connection = connection_pool.get_connection()
	if connection.is_connected():
		cursor=connection.cursor(dictionary=True)
		select_stmt = "SELECT * FROM orders WHERE number = %s;"
		cursor.execute(select_stmt, (orderNumber,))
		order = cursor.fetchone()
		print(order)
		if order != None :
			select_stmt = "SELECT * FROM attractions WHERE id = %s;"
			cursor.execute(select_stmt, (order["attraction_id"],))
			attraction_data = cursor.fetchone()
			return_data={"data": {
					"number": order["number"],
					"price": order["price"],
					"trip": {
					"attraction": {
						"id":attraction_data["id"], 
						"name":attraction_data["name"], 
						"address":attraction_data["address"], 
						"image": json.loads(attraction_data["images"])[0],
					},
					"date": order["date"].strftime("%Y-%m-%d"),
					"time": order["time"],
					},
					"contact": {
					"name": order["name"],
					"email": order["email"],
					"phone": order["phone"],
					},
					"status": order["status"],
			}}
		else:
			return_data={"data":None}
		cursor.close()
		connection.close()
	return jsonify(return_data), 200

app.run(host="0.0.0.0", port=3000)