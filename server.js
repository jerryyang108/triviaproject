const express = require('express');
let mongo = require('mongodb');
let db;
let MongoClient = mongo.MongoClient;
let app = express();
let ObjectId = require('mongodb').ObjectID;
app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

app.get("/", function (req, res) {
	res.render("home");
});
app.get("/questions", getQuestions);
app.get("/questions/:qID",getQuestionId);
app.get("/createquiz",createQuiz);
app.get("/quizzes",getQuizzes);
app.get("/quiz/:quizID", getQuizId);

app.post("/quizzes",postQuiz);


function getQuizId(req, res, next) {
	let quizID = req.params.quizID;
	db.collection("quiz").find().toArray(function(err,result){
		if (err){
			throw err;
		}
		res.format({
			'text/html': function () {
				res.render('quizboard', {quizzes: searchId(quizID, result)});
			},
			'application/json' :function(){
				res.send({quizzes: searchId(quizID, result)});
			},
			'default': function () {					
				res.status(406).send('Not Acceptable')
			}
		})
	})
}

function getQuestions(req,res,next){
	var difficulty = req.query.difficulty; // get the difficulty and category query
	var category = req.query.category;	
	console.log("Connected to database.");
	//CASE I, if no query specific 
	if (difficulty == null && category == null){		
		db.collection("questions").find().limit(25).toArray(function(err,result){
		if (err) throw err;
			//send html or json by format
			res.format({
				'text/html': function () {					
					res.render('index',{questions: result})
				},
				'application/json' :function(){
					res.send(result);
				},
				'default': function () {					
					res.status(406).send('Not Acceptable')
				}
			})
		})		
	}
	// CASE 2
	else if(category==null){
		db.collection("questions").find({difficulty: difficulty}).limit(25).toArray(function(err,result){
			if (err) throw err;
			res.format({
				'text/html': function () {
					res.render('index',{questions: result})
				},
				'application/json' :function(){
					res.send(result);
				},
				'default': function () {					
					res.status(406).send('Not Acceptable')
				}
			})
		});
	}
	//CASE 3
	else if(difficulty==null){
		db.collection("questions").find({category: category}).limit(25).toArray(function(err,result){
			if (err) throw err;
			res.format({
				'text/html': function () {
					res.render('index',{questions: result})
				},
				'application/json' :function(){
					res.send(result);
				},
				'default': function () {					
					res.status(406).send('Not Acceptable')
				}
			})
		});
	}
	//CASE 4
	else{
		db.collection("questions").find({difficulty: difficulty, category: category}).limit(25).toArray(function(err, result) {
			if(err) throw err;						
			res.format({
				'text/html': function () {
					res.render('index',{questions: result})
				},
				'application/json' :function(){
					res.send(result);
				},
				'default': function () {					
					res.status(406).send('Not Acceptable')
				}
			})		
		});	
	}
}
// GET QUESITON BY ID
function getQuestionId(req,res,next){
	var id = req.params.qID;
	if(!ObjectId.isValid(id)) {
		res.status(404).send("Invalid ID provided!");
	} else {
		//find specific id by mongo db 
		db.collection("questions").findOne({"_id": ObjectId(id)}, function(err,result){
			if (err) {
				console.log(err);
				throw err
			}
			if(!result){
				res.status(404).send("Id not found");
			}
			// send to web page
			res.format({
				'text/html': function () {
					res.render('question',{ques: result})
				},
				'application/json' :function(){
					res.send(result);
				},
				'default': function () {					
					res.status(406).send('Not Acceptable')
				}
			})		
			
		})
	}
}
//create two drop down list and then send to pug file
function createQuiz(req,res,next){
	db.collection("questions").distinct("difficulty", function(err, difArray){
		db.collection("questions").distinct("category", function(err, catArray){
			let renderData ={};
			renderData.difficulty=difArray;
			renderData.category = catArray;
			res.render('createquiz', renderData);
		});
	})
}

function postQuiz(req,res,next){
	db.collection("quiz").insertOne(req.body);
	res.status(201).send(req.body);
}

function getQuizzes(req,res,next){
	let rejaxObj={};
	if(req.query._id){
		rejaxObj._id = {$regex:".*" + req.query._id + ".*", $options:"i"}	
	}	
	if(req.query.creater){
		rejaxObj.creater = {$regex:".*" + req.query.creator + ".*", $options:"i"}	
	}
	if (req.query.tag){
		rejaxObj.tags = {$regex:".*" + req.query.tag + ".*", $options:"i"}
	}
	db.collection("quiz").find().toArray(function(err,result){
		if (err){
			res.status(404).send("match not found!");
		}
		if(Object.keys(req.query).length === 0 && req.query.constructor === Object) {
			res.render('quizboard', {quizzes: result});
		}
		if(req.query._id){
			res.render('quizboard', {quizzes: searchId(req.query._id, result)});
		}
		if(req.query.creater){
			res.render('quizboard', {quizzes: searchCreater(req.query.creater, result)});
		}
		if (req.query.tag){
			res.render('quizboard', {quizzes: searchTag(req.query.tag, result)});
		}
	})
}
//helper function, return an array that matches all quiz creater name.
function searchCreater(creater, quizzes){
	return quizzes.filter((quiz)=>(quiz.creName.toLowerCase().search(creater.toLowerCase())!=-1))
}
function searchTag(tag,quizzes){
	return quizzes.filter((quiz)=>(quiz.quTag.toLowerCase().search(tag.toLowerCase())!=-1))
}
function searchId(_id,quizzes){
	return quizzes.filter((quiz)=>(quiz._id.toString().search(_id.toString())!=-1))
}

MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;
	console.log("connected to mongo db");
  db = client.db('a4');
  
  // Start server once Mongo is initialized
  app.listen(3000);
  console.log("Listening on port 3000");
});
