const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();

app.use(express.static("public"));

// 세션 설정
const session = require("express-session");
app.use(
  session({
    secret: "암호화키",
    resave: false,
    saveUninitialized: false,
  })
);

// 쿠키 설정
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// body-parser 설정
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB 연결 설정
const url = process.env.MONGO_DB_URL;
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
let mydb; // mydb 변수를 전역 범위에서 정의

async function setup() {
  try {
    await client.connect();
    mydb = client.db(process.env.MONGO_DB);
    console.log("MongoDB에 연결되었습니다.");
  } catch (err) {
    console.error("MongoDB 연결 오류:", err);
  }
}

app.get('/search', async function(req, res){
  // 검색어를 받아와서 MongoDB에서 해당 게시물을 찾음
  const searchValue = req.query.value;
  console.log('검색어:', searchValue);
  
  try {
    const result = await mydb.collection("post").find({ title: searchValue }).toArray();
    console.log('검색 결과:', result);
    res.render("../views/post/sresult.ejs", { data: result }); // 클라이언트에게 결과를 보낼 수도 있음
  } catch (err) {
    console.error('검색 오류:', err);
    res.status(500).send('검색 중 오류가 발생했습니다.');
  }
});

// 기타 라우팅 및 서버 설정
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.use('/', require('./routes/account.js')); 
app.use('/', require('./routes/post'));

// 서버 시작 시 MongoDB 연결 설정
app.listen(process.env.WEB_PORT, async () => {
  await setup(); // 서버 시작 전에 MongoDB 연결 설정
  console.log("서버가 준비되었습니다...");
});