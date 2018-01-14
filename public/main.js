var map;

var isLoading = false;

var formInput = {
	category: 0,
	textSearch: '',
	coordinates: { "lat":48.864, "lng":2.29 },
	zoom: 11,
	radius: 10,
	priceMin: '',
	priceMax: ''
}

if (localStorage.getItem('form_input')) {
	formInput = JSON.parse(localStorage.getItem('form_input'))
}

var updateFormInput = function () {
	formInput = Object.assign(formInput, {
		textSearch: document.querySelector('.form input.textSearch').value,
		category: document.querySelector('.form select.category').value,
		priceMin: document.querySelector('.form input.priceMin').value,
		priceMax: document.querySelector('.form input.priceMax').value,
		coordinates: { 
			lat: map.getCenter().lat(), 
			lng: map.getCenter().lng()
		},
		zoom: map.getZoom(),
		radius: map.getCircleRadius()
	})
}

var saveToLocalStorage = function () {
	localStorage.setItem('form_input', JSON.stringify(formInput))
}

var setLoading = function (loading) {
	isLoading = loading

	var button = document.querySelector('.button-search')

	if (isLoading) {
		button.classList.add('button-search--loading')
		return;
	}

	button.classList.remove('button-search--loading')
}

//http://localhost:4000/search?q=&category=9&lat=48.4&lng=2.3&radius=20&price_min=16000&price_max=30000&surface_min=24&surface_max=35

var onSearchResult

var goSearch = debounce(function () {
	document.querySelector('.form').scrollTop = 0;
	
	onSearchResult = function(data) {
		setLoading(false)

		var resultsContainerElement = document.querySelector('.form .results')

		if (!data.ads || data.ads.length == 0) {
			resultsContainerElement.innerHTML = '<div class="no-results">Pas de résultats 🤔</div>';
			return;
		}

		resultsContainerElement.innerHTML = '';

		data.ads.forEach(function (ad) {

			var backgroundImageStyle = `background: #ddd')`;
			if (ad.images && ad.images.small_url) {
				backgroundImageStyle = `background-image: url('${ad.images.small_url}')`;
			}

			var priceDisplay = ad.price ? accounting.formatMoney(ad.price, "", 0, " ", ",") + ' €' : '';

			var resultElement = new DOMParser().parseFromString(`
				<div class="item" style="${backgroundImageStyle}">
					<div class="overlay">
						<div class="bottom">
						  <div class="price">${priceDisplay}</div>
						  <div class="title">${ad.subject}</div>
						</div>
					</div>
				</div>
			`, "text/html").body.firstChild

			resultElement.addEventListener('click', function () {
				window.open(`https://www.leboncoin.fr/annonce/${ad.list_id}.htm`, '_blank')
			})

			resultsContainerElement.appendChild(resultElement)
		})
	}

	setLoading(true)

	/*
	setLoading(true)

	setTimeout(() => {
		setLoading(false)
	}, 1000 + Math.random() * 2000)
	*/

	var serialize = function(obj) {
		var str = []
		for(var p in obj)
		if (obj.hasOwnProperty(p)) {
			if (obj[p]) {
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
			}
		}
		return str.join("&")
	}

	var query = {
		q: formInput.textSearch,
		category: formInput.category,
		lat: formInput.coordinates.lat,
		lng: formInput.coordinates.lng,
		radius: formInput.radius,
		price_min: formInput.priceMin,
		price_max: formInput.priceMax
	}

	fetch('/search?' + serialize(query))
		.then(function(res) { return res.json() })
		.then(onSearchResult)
}, 500)

var onFormChange = function () {
	updateFormInput()
	saveToLocalStorage()
	goSearch()
}

var renderForm = function () {
	document.querySelector('.form input.priceMin').value = 
		formInput.priceMin

	document.querySelector('.form input.priceMax').value = 
		formInput.priceMax

	document.querySelector('.form input.textSearch').value = 
		formInput.textSearch

	document.querySelector('.form select.category').value = 
		formInput.category
}

var getRadiusFromZoom = function (zoom) {
	if (zoom < 9) {
		return 40
	}

	if (zoom < 10) {
		return 30
	}

	if (zoom > 14) {
		return .5
	}

	if (zoom > 13) {
		return 1
	}

	if (zoom > 12) {
		return 2
	}

	if (zoom > 11) {
		return 4
	}
	return 10
}

document.addEventListener('DOMContentLoaded', function() {
	//insert google maps script
	var script = document.createElement('script')
	script.type = 'text/javascript'
	script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA3PKwJ5qHgxj7LXs-IWPyWi4Ykav7oXJE&libraries=places&callback=initMap'
	document.body.appendChild(script);

	//when its done
	window.initMap = function () {

		var center = { lat: formInput.coordinates.lat, lng: formInput.coordinates.lng };

		map = new google.maps.Map(document.querySelector('.map-container'), {
			zoom: formInput.zoom,
			center: center
		});

		var circle

		var setCenterCircle = function () {
			if (circle) {
				//circle.setMap(null)
				circle.setCenter(map.getCenter())
				return
			}

			circle = new google.maps.Circle({
				strokeColor: '#0000FF',
				strokeOpacity: 0.8,
				strokeWeight: 5,
				fillColor: '#0000FF',
				fillOpacity: 0.35,
				map: map,
				center: map.getCenter(),
				radius: formInput.radius * 1000
			})
		}

		map.getCircleRadius = function () {
			return circle.getRadius() / 1000
		}

		map.addListener('drag', function () {
			//marker.setCenter(map.getCenter())
			setCenterCircle()
		})

		map.addListener('dragend', function () {
			document.querySelector('input.autocomplete-address').value = ''
			onFormChange()
			renderForm()
		})

		map.addListener('zoom_changed', function () {
			var zoom = map.getZoom()
			radius = getRadiusFromZoom(zoom)
			circle.setRadius(radius * 1000)

			formInput.zoom = zoom;
			formInput.radius = radius;
			onFormChange();
		})

		map.addListener('center_changed', function () {
			setCenterCircle()
			onFormChange();
		})

		var autocomplete = new google.maps.places.Autocomplete(
			document.querySelector('input.autocomplete-address')
		);
        autocomplete.bindTo('bounds', map);

		autocomplete.addListener('place_changed', function() {
			var place = autocomplete.getPlace()
			map.setCenter({
				lat: place.geometry.location.lat(),
				lng: place.geometry.location.lng()
			})
		})

		setCenterCircle()
		renderForm()
		goSearch()
	}

	document.querySelector('.form input.textSearch').addEventListener('keyup', onFormChange)
	document.querySelector('.form input.priceMin').addEventListener('keyup', onFormChange)
	document.querySelector('.form input.priceMax').addEventListener('keyup', onFormChange)

	document.querySelector('.form select.category').addEventListener('change', onFormChange)
	document.querySelector('.button-search').addEventListener('click', onFormChange)

	window.addEventListener('scroll', function () {
		// document.querySelector('.form').scrollHeight - document.querySelector('.form').scrollTop - document.querySelector('.form').clientHeight
	})

})