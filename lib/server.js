var fs = require("fs");
var path = require("path");

module.exports = function(options) {

	var express = require("express");
	var bodyParser = require("body-parser");
	

	var html = fs.readFileSync(path.resolve(__dirname, "../public/template.html"), "utf-8");

	function SimpleRenderer(options) {
		this.html = html.replace("SCRIPT_URL", options.scriptUrl);
	}

	SimpleRenderer.prototype.render = function(_path, _readItems, callback) {
		callback(null, this.html);
	};


	// require the page rendering logic
	var Renderer =	SimpleRenderer;//	require("../config/SimpleRenderer.js");

	// load bundle information from stats
	var stats = require("../build/stats.json");

	var createPrerenderApi = ()=>{};//require("./mainPrerenderApi");

	var publicPath = stats.publicPath;

	var renderer = new Renderer({
		styleUrl: options.separateStylesheet && (publicPath + "main.css?" + stats.hash),
		scriptUrl: publicPath + [].concat(stats.assetsByChunkName.main)[0],
		commonsUrl: publicPath + [].concat(stats.assetsByChunkName.commons)[0]
	});

	var app = express();

	// serve the static assets
	app.use("/_assets", express.static(path.join(__dirname, "..", "build", "public"), {
		maxAge: "200d" // We can cache them as they include hashes
	}));
	app.use("/", express.static(path.join(__dirname, "..", "public"), {
	}));

	// artifical delay and errors
/*	app.use(function(req, res, next) {
		if(Math.random() < 0.05) {
			// Randomly fail to test error handling
			res.statusCode = 500;
			res.end("Random fail! (you may remove this code in your app)");
			return;
		}
		setTimeout(next, Math.ceil(Math.random() * 1000));
	});*/

	app.use(bodyParser.json());

	// load REST API
	//require("./api")(app);

	// application
	app.get("/*", function(req, res) {
		renderer.render(
			req.path,
			createPrerenderApi(req),
			function(err, html) {
				if(err) {
					res.statusCode = 500;
					res.contentType = "text; charset=utf8";
					res.end(err.message);
					return;
				}
				res.header("Content-Type", "text/html; charset=utf8");
				//res.contentType = "text/html; charset=utf8";
				res.end(html);
			}
		);
	});


	var port = process.env.PORT || options.defaultPort || 8080;
	app.listen(port, function() {
		console.log("Server listening on port " + port);
	});
};
