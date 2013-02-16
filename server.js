var port = process.env.PORT || 4000,
    app = require('./app').init(port),
    img = require('./lib/image')
	
var locals = {
	author:'in1'
	// add other local vars here
};

app.get('*', function(req,res,next){
	if (req.session) {
		locals.session=req.session;
		locals.once="";
	}
	
	next();
});

app.get('/', function(req,res){
	console.log("show home page");
	res.render('index.ejs', locals);
});

app.get('/img', function(req,res){
    console.log("image");
    var urlToFetch = req.query["url"];
    if (!urlToFetch) {
        urlToFetch = "http://www.google.com";
    }
    img.getImage(req,res,urlToFetch);
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});
