var spawn = require('child_process').spawn;
var fs = require('fs');

var Image = function Image(document) {
    this.objects = document ? [document] : [];
}

Image.prototype.convert = function(callback, filename) {    
    var cmdOptions = []; 
    cmdOptions = cmdOptions.concat(buildOptions(this.objects[0], filename));
    var wkhtmltoimage_path = process.env.PORT ? './bin/wkhtmltoimage-amd64' : 'wkhtmltoimage';
    //var wkhtmltoimage_path = process.env.PORT ? './bin/wkhtmltoimage-i396' : 'wkhtmltoimage';
    
    var convert = spawn(wkhtmltoimage_path,cmdOptions); 
    
    // direct stdin html
    /*
    if (this.objects[0].html) {
    var inputHtml = spawn ("echo",this.objects[0].html);
    inputHtml.stdout.on('data', function (data) {
        convert.stdin.write(data);
    });
    inputHtml.on ('exit', function () {
        convert.stdin.end();
    });
    }
    */
    
    var image = [];
    var err;
    
    convert.stdout.on('data', function (data) {
        image.push(data);
    });
    
    convert.stderr.on('data', function (data) {
        err += data;
    });
    
    convert.on ('exit', function (code) {
        if (code) {
            console.log ('child process exited with code ' + code);
        }
        else { 
            if(!filename) {
                var size = 0;
                for (var i=0; i < image.length; ++i) {
                    size+= image[0].length;
                }
                var buffer = new Buffer (size);
                var pos = 0;
                for (var i=0; i < image.length; ++i) {
                    if (pos > size) {
                        break;
                    }
                    image[i].copy(buffer, pos, 0, image[i].length);
                    pos += image[i].length;
                }
                callback (err, buffer);
            } else {
                callback (err);
            }
        }
    });
}

var buildOptions = function (objects, filename) {
    
    // wkhtml options
    var options = [];
    if (objects.options) {
        options = objects.options;
    }
    
    // input filename or url
    if (objects.html) {
        options.push('-');
    } else if (objects.filename) {
        options.push(objects.filename);
    } else {
        options.push(objects.url);
    }
    
    // output filename or -
    if (filename) {
        options.push(filename);
    } else {
        options.push('-');
    }
    
    return options;
};

module.exports.getImage = function (req,res,url) {
  new Image({ url: url, options:['--width','760','--height','400','--javascript-delay','300','--quality','100'] }).convert (function (err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        //see if we have a callback function
        res.writeHead(200, {'Content-Type' : 'image/png','Content-Size' : data.length }); 
        res.write(data);
        res.end ();
      } else {
        res.writeHead(200, {'Content-Type' : 'text/plain'}); 
        res.write("error");
        res.end ();
      }
  });
}
