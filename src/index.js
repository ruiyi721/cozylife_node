const express = require('express');  //express是原本建服務器的功能都可以用在額外添加新功能
const url = require('url');
const multer = require('multer');
const upload = multer({dest:'tmp_uploads'});
const fs = require('fs'); 
const uuid = require('uuid');

const app = express();  // express所有都有順序性
// 註冊樣版引擎
app.set('view engine', 'ejs');
// 設定views路徑 (選擇性設定)，如果命名都對就不用寫
// app.set('views', __dirname + '/../views');
// const urlencodedParser = express.urlencoded({extended: false}); // 中介軟體
//encoded 是這個格式?a=2&b=bill
app.use(express.urlencoded({extended: false}))
app.use(express.json());

app.get('/', (req, res) => {            //  '/'根目錄
    // res.send(`<h2>Hello World</h2>`)   
    res.render('home', {name: 'Hi'});      // send rander end json 只能用一個

});
app.get('/xxx', (req, res) => {     
    res.send(`<h2>XXX</h2>`)   

});

app.get('/sales', (req, res) => {     
    const data = require(__dirname + '/../data/sales');
    // res.send(`<h2>${data[0].name}</h2>`);
    res.render('sales-table', {sales: data});
});

app.get('/try-qs', (req, res)=>{   // req用途告訴後端資料
    const urlParts = url.parse(req.url, true);  // true的話會把網址?後面打的東西，parse會把JSON裡面的query變OBJ
    console.log(urlParts); // 在 server 端查看
    res.json(urlParts);
});

app.get('/try-post', (req, res)=>{
    res.render('try-post-form');
});

app.get('/my-params2/:action?/:id?', (req, res)=>{
    res.json(req.params);
});
app.get(/^\/mobile\/09\d{2}-?\d{3}-?\d{3}$/, (req,res)=>{
    let m = req.url.slice(8);
    m = m.split('?')[0];
    m = m.split('-').join('');
    res.json({
        url: m
    });
});

app.post('/try-post', (req, res) => {   // , urlencodedParser中介 放在第二個位置
    res.json(req.body);   // 要透過urlencodedParser才有這個可以用req.body
    console.log(req.body);
});

app.post('/try-upload', upload.single('avatar'), (req, res)=>{

    console.log(req.file);
    if(req.file && req.file.originalname){
        let ext = ''; //副檔名
        switch(req.file.mimetype){
            case 'image/jpeg':
                ext = '.jpg';
                break;
            case 'image/png':
                ext = '.png';
                break;
            case 'image/gif':
                ext = '.gif';
                break;
        }
        if(ext){
            let filename = uuid.v4() + ext;
            fs.rename(
                req.file.path,
                './public/img/' + filename,
                error=>{}
            );
        } else {
            fs.unlink(req.file.path, error=>{});
        }
    }
    res.json({
        body: req.body,
        file: req.file,
    });
});

app.use(  require(__dirname + '/admins/admin2')  );


app.use(express.static('public'));  // 靜態表示不會再動，放所有動態路由後面
// app.use(express.static(__dirname + '/../public'));

app.use((req, res)=>{  // 只要是use和static裡面都是中介軟體，可以全域也可以放在繞死(英文)
    res.type('text/html');
    res.status(404);               // 404要放在所有路由的後面，因為他會直接結束
    res.send(`                        
        path: ${req.url}</br>
        <h2>404 - 找不到網頁</h2>
    `);
});



app.listen(3000, ()=>{          // 正常啟動會寫這個
    console.log("Run");
    
})