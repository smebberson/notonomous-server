var md = require( "markdown" ).markdown;

module.exports = function (app, log, db) {
	
	app.param('id', function (req, res, next, id) {
		
		if (db) {

			db.collection('documents', function (err, collection) {

				if (!err) {
					collection.findOne({_id: new db.bson_serializer.ObjectID(id)}, function (err, result) {
						
						if (err) return next(err);
						if (!result) return next(new Error('Failed to find note'));
						req.note = result;
						next();
						
					});
				}

			});

		}
		
	});
	
	// define view route
	app.get("/view/:id/:format?/:inline?", function (req, res) {

		// define default params
		req.params.format = req.params.format || 'markdown';
		
		// define default inline param
		switch (req.params.format) {

			case 'markdown':
				req.params.inline = req.params.inline || 'download';
				break;
			case 'json':
				req.params.inline = req.params.inline || 'download';
				break;
			case 'html':
				req.params.inline = req.params.inline || 'inline';
				break;
			case 'plain':
				req.params.inline = req.params.inline || 'inline';
				break;

		}

		switch(req.params.format + '-' + req.params.inline) {

			case 'markdown-download':
				res.setHeader('Content-disposition', 'attachment; filename=' + req.note._id + '.md');
				res.setHeader('Content-type', 'text/x-web-markdown');
				res.send(req.note.content);
				break;

			case 'markdown-inline':
				res.send(req.note.content);
				break;

			case 'json-download':
				res.setHeader('Content-disposition', 'attachment; filename=' + req.note._id + '.json');
				res.setHeader('Content-type', 'application/json');
				res.send(req.note);
				break;

			case 'json-inline':
				res.send(req.note);
				break;
			
			case 'html-download':
				res.setHeader('Content-disposition', 'attachment; filename=' + req.note._id + '.html');
				res.setHeader('Content-type', 'text/html');
				res.send(md.toHTML(req.note.content));
				break;

			case 'html-inline':
				res.send(md.toHTML(req.note.content));
				break;

			case 'plain-download':
				res.setHeader('Content-disposition', 'attachment; filename=' + req.note._id + '.txt');
				res.setHeader('Content-type', 'text/plain');
				res.send(req.note.content);
				break;

			case 'plain-inline':
				res.send(req.note.content);
				break;

		}

	});
	
};
