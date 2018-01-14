const fetch = require('node-fetch')

module.exports = async function(req, res) {
	let data = await fetch('https://api.leboncoin.fr/api/utils/phonenumber.json', {
		method: 'POST',
		headers: {
			'Host': 'api.leboncoin.fr',
			'Content-Type': 'application/x-www-form-urlencoded',
			'Origin': 'leboncoin_iphone',
			'Cookie': 'cookieFrame=2',
			'Accept': '*/*',
			'User-Agent': 'LBC;iOS;11.0.1;iPhone;phone;59176FB8-5FC6-4876-8B5D-FC988B0885C9;wifi;4.2.12;201801041311.34;3.70',
			'Accept-Language': 'fr-FR;q=1',
			'URLEncoded': 'form'
		},
		body: [
			'app_id=leboncoin_iphone',
			'key=c17d5009f2de512fae68880ea4375ef8adbc34e56a7444c0248fcb63bd0ffaed9995200a46cee0176654b244c9b9f2934d935576650b15c6792621e94cbec163',
			'list_id=' + req.query.ad_id,
			'text=1'
		].join('&')
	})
	.then(res => res.json())
	
	if (!data.utils.phonenumber) {
		return res.json(false)
	}

	res.json(data.utils.phonenumber)
}