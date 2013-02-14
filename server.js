var port = process.env.PORT || 4000,
    app = require('./app').init(port),
    image = require('./image'),
    dirty = require('dirty');
	
var locals = {
	author:'in1'
	// add other vars here
};

//var userDb = dirty('user.db');

app.get('*', function(req,res,next){
	if (req.session) {
		locals.session=req.session;
		locals.once="";
	}
	
	next();
});

app.get('/', function(req,res){
	console.log("show home page");

    locals.date = new Date().toLocaleDateString();
	
	res.render('index.ejs', {locals:locals});
});

app.get('/login', function(req,res){
	console.log("show login page");

	var appDb = dirty('app.db'),
		sectionsDb;
		
	appDb.on('load', function() {
		sectionsDb = dirty('sections.db');
		sectionsDb.on('load', function() {
			res.render('login', {locals:locals,sections:sectionsDb,app:appDb.get('app'),page:appDb.get('page'),err:req.query["err"]});
		});
	});
});

app.post('/login', function(req,res){
	console.log("logging in");
		
	var userDb = dirty('user.db'),
		username = req.body["username"],
		password = req.body["password"];
		
	if (typeof username=="undefined" || typeof password=="undefined") {
		res.redirect('/login?err=You need to enter a username and password.');
	}
	else {
		userDb.on('load', function() {
			var user = userDb.get(username);
			if (typeof user=="undefined" || user.password!=password) {
				res.redirect('/login?err=User not found or wrong password.');
			}
			else if (!user.admin && user.admin!=1) {
				res.redirect('/login?err=You do not have permission to access this page.');
			}
			else {
				/* set session login here*/
				req.session.loggedIn=true;
				req.session.username=username;
				res.redirect('/admin');
			}
		});
	}
});

app.get('/logout', function(req,res){
	console.log("logging out");
	
	delete req.session.loggedIn;
	res.redirect('/');
});


app.get('/img/:url', function(req,res){
    console.log("image");
	
    var urlToFetch = req.param["url"] ? req.param["url"] : "http://www.google.com";
    
    new Image({ url: urlToFetch }).convert (function (err, data) {
        if (err) {
            console.log(err);
        }
        if (data) {
            res.writeHead(200, {'Content-Type' : 'image/png', 'Content-Size' : data.length }); 
            res.write(data);
            res.end ();
            
        } else {
            res.writeHead(200, {'Content-Type' : 'text/html' }); 
            res.write("error:"+err);
            res.end ();
        }
    });
    
    
	res.redirect('/');
});


app.get('/admin', function(req,res){
	console.log("getting admin page..");

    locals.date = new Date().toLocaleDateString();
		
	if (req.session.loggedIn) {
		 res.render('admin', {locals:locals});
	}
	else {
		res.redirect('/login');
	}
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});


/* utils */
function validateEmail (value) {
  var isValid = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(value);
  return isValid;
}

