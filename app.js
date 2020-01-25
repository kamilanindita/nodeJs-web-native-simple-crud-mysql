//------------------------------------------Module-------------------------------------------
//module bawaan/default atau tidak perlu install
var http  = require('http');
var url   = require('url');
var qString   = require('querystring');
//module yang perlu install terlebih dahulu
var router = require('routes')();
var view  = require('swig');
var mysql = require('mysql');

//----------------------------------------Database-------------------------------------------
//koneksi database
var connection=mysql.createConnection({
    host:"localhost",
    port:3306,
    database:"website_crud",
    user:"root",
    password:""
});

//------------------------------------------Route--------------------------------------------
//index
router.addRoute('/',function(req,res){
    var html=view.compileFile('./templates/index.html')({
        title:"Index",
    });
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.end(html);
});

//buku
router.addRoute('/buku',function(req,res){
    connection.query("select * from buku",function(err,rows){
        if(err) throw err;
        var html=view.compileFile('./templates/buku.html')({
        title:"Buku",
        data : rows,
        });

        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    });

    
});

//tambah
router.addRoute('/buku/tambah',function(req,res){
    if(req.method.toUpperCase()=='POST'){
        var data_post="";
        req.on('data',function(chuncks){
            data_post += chuncks;
        });
        req.on('end',function(){
            data_post =qString.parse(data_post);
            connection.query("insert into buku set ?", data_post,function(err,fields){
                if(err) throw err;
                res.writeHead(302,{"Location" : "/buku"});
                res.end();
            });
        });

    }else{
        var html=view.compileFile('./templates/tambah.html')({
            title:"Tambah",
        });
        res.writeHead(200,{"Content-Type" : "text/html"});
        res.end(html);
    }

});

//edit
router.addRoute('/buku/edit/:id',function(req,res){
    _id=this.params.id;
    connection.query("select * from buku where ?",{id : _id},function(err,rows,fields){
        if(rows.length){
            var data =rows[0];
            if(req.method.toUpperCase()=='POST'){
                var data_post="";
                req.on('data',function(chuncks){
                    data_post += chuncks;
                });
                req.on('end',function(){
                    data_post =qString.parse(data_post);
                    connection.query("update buku set ? where ?",[ data_post, {id : _id} ], function(err,fields){
                        if(err) throw err;
                        res.writeHead(302,{"Location" : "/buku"});
                        res.end();
                    });
                });

            }else{
                var html=view.compileFile('./templates/edit.html')({
                    title:"Edit",
                    data : data,
                });
                res.writeHead(200,{"Content-Type" : "text/html"});
                res.end(html);
            }
        }
    });

});

//hapus
router.addRoute('/buku/delete/:id',function(req,res){
    _id=this.params.id;
    connection.query("delete from buku where ?",{id : _id },function(err,fields){
        if(err) throw err;
        res.writeHead(302,{"Location" : "/buku"});
        res.end();
    });
});
 
 //--------------------------------------End Route-------------------------------------------
 
 //---------------------------------------Server---------------------------------------------
 //membuat server
http.createServer(function(req,res){
    var path =url.parse(req.url).pathname;
    var match=router.match(path);
	//menampilkan request url
	console.log(req.method+' '+req.url);

    if(match){
        match.fn(req,res);
    }else{
        var html=view.compileFile('./templates/404.html')();
        res.writeHead(404,{"Content-Type" : "text/html"});
        res.end(html);
    }
  
}).listen(8000);
 
console.log('Server is running at port 8000');