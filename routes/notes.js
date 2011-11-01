
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
	app.get("/view/:id/:format?", function (req, res) {

		// define default params
		req.params.format = req.params.format || 'download';

		switch(req.params.format) {

			case 'download':
				res.setHeader('Content-disposition', 'attachment; filename=' + req.note._id + '.md');
				res.setHeader('Content-type', 'text/x-web-markdown');
				res.send(req.note.content);
				break;

			case 'json':
				res.send(req.note);
				break;

			case 'plain':
				res.send(req.note.content);
				break;

		}

	});
	
};