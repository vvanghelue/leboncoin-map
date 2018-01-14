const fetch = require('node-fetch')

module.exports = async function(req, res) {
	/*
	req.query.q
	req.query.lat
	req.query.lng
	req.query.category
	req.query.radius

	res.json(req.query.q);
	return;
	*/

	let leboncoinJsonQuery = {
		"filters": {
			"category": {
				//"id": "9" //immo
			},
			"enums": {
				"ad_type": [
					"offer"
				]
			},
			"keywords": {
				"text": "",
				"type": "all"
			},
			"location": {
				"area": {
					"lat": 48.157169459999984,
					"lng": 3.260083209999999,
					"radius": 30000
				}
			},
			"ranges": {
				// "price": {
				// 	"max": 100000,
				// 	"min": 50000
				// }
			}
		},
		"limit": 100,
		"limit_alu": 2,
		"owner_type": "all",
		"pivot": "0,0,0", //"1366813779,1515588477,315000"
		"sort_by": "time",
		"store_id": "",
		"user_id": ""
	}

	if (req.query.category && req.query.category != "0") {
		leboncoinJsonQuery.filters.category.id = req.query.category
	}

	if (req.query.price_min || req.query.price_max) {
		leboncoinJsonQuery.filters.ranges.price = {}
	}
		if (req.query.price_min) {
			leboncoinJsonQuery.filters.ranges.price.min = parseInt(req.query.price_min, 10)
		}

		if (req.query.price_max) {
			leboncoinJsonQuery.filters.ranges.price.max = parseInt(req.query.price_max, 10)
		}

	if (req.query.surface_min || req.query.surface_max) {
		leboncoinJsonQuery.filters.ranges.square = {}
	}
		if (req.query.surface_min) {
			leboncoinJsonQuery.filters.ranges.square.min = parseInt(req.query.surface_min, 10)
		}

		if (req.query.surface_max) {
			leboncoinJsonQuery.filters.ranges.square.max = parseInt(req.query.surface_max, 10)
		}

	if (req.query.q) {
		leboncoinJsonQuery.filters.keywords.text = req.query.q
	}

	if (req.query.radius) {
		leboncoinJsonQuery.filters.location.area.radius = req.query.radius * 1000
	}

	if (req.query.lat) {
		leboncoinJsonQuery.filters.location.area.lat = parseFloat(req.query.lat)
		leboncoinJsonQuery.filters.location.area.lng = parseFloat(req.query.lng)
	}

	if (req.query.start) {
		leboncoinJsonQuery.pivot = req.query.start
	}

	console.log(JSON.stringify(leboncoinJsonQuery))

	let data = await fetch('https://api.leboncoin.fr/api/parrot/v1/search', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			// 'Cookie': 'cookieFrame=2',
			'Accept': 'application/json',
			// 'User-Agent': 'LBC;iOS;11.0.1;iPhone;phone;59176FB8-5FC6-4876-8B5D-FC988B0885C9;wifi;4.2.12;201801041311.34;3.70',
			'Accept-Language': 'fr-FR;q=1',
			'api_key': 'ba0c2dad52b3ec'
		},
		body: JSON.stringify(leboncoinJsonQuery)
	})
	.then(res => res.json())

	res.json(data)
}