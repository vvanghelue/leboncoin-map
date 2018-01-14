const express = require('express')
const app = express()

app.use(express.static('public'));

//http://localhost:4000/search?q=&category=9&lat=48.4&lng=2.3&radius=20&price_min=16000&price_max=30000&surface_min=24&surface_max=35
app.get('/search', require('./search'))

//http://localhost:4000/get_phone_number?ad_id=1160195765
app.get('/get_phone_number', require('./getPhoneNumber'))

app.listen(process.env.PORT || 4000);
