'use-strict';
// ===PACKAGE
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// ===GLOBAL
const PORT = process.env.PORT;
const app = express();
app.use(cors());

// ===KEYS
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const TRAIL_API_KEY = process.env.TRAIL_API_KEY;

// const YELP_API_KEY = process.env.YELP_API_KEY;

// const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

// ===ROUTE

// ===ONE
app.get('/location', sendLocationData);

function sendLocationData(req, res){
  const lookFor = req.query.city
  const urlSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${lookFor}&format=json`;

  superagent.get(urlSearch)
    .then(someReturned => {
      const superagentResultArr = someReturned.body;
      const constLocations = new Location(superagentResultArr);
      res.send(constLocations);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}

// ===TWO
app.get('/weather', sendWeerData);

function sendWeerData(req, res) {
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  const urlZoekWeer = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${latitude}&lon=${longitude}&key=${WEATHER_API_KEY}`;

  superagent.get(urlZoekWeer)
    .then(weerTerug => {
      const weerPass = weerTerug.body.data;
      const weerArr = weerPass.map(index => new Weather(index));
      res.send(weerArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}

// ===THREE
app.get('/trails', sendTrailData);

function sendTrailData(req, res) {
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  const urlToTrails = `https://www.hikingproject.com/data/get-trails?&lat=${latitude}&lon=${longitude}&maxDistance=10&key=${TRAIL_API_KEY}`;

  superagent.get(urlToTrails)
    .then(trailData => {
      console.log(trialData.body);
      const trailPass = trailData.body.trails;
      const trailArr = trailPass.map(index => new Trail(index));
      res.send(trailArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });

}
// ===EVERYTHING ELSE MAYBE

function Location(jsonObject) {
  this.formatted_query = jsonObject[0].display_name;
  this.latitude = jsonObject[0].lat;
  this.longitude = jsonObject[0].lon;
}

function Weather(jsonObject) {
  this.forecast = jsonObject.weather.description;
  this.time = jsonObject.valid_date;
}

function Trail(jsonObject){
  this.name = jsonObject.name;
  this.location = jsonObject.location;
  this.length = jsonObject.length;
  this.stars = jsonObject.stars;
  this.star_votes = jsonObject.starVotes;
  this.summary = jsonObject.summary;
  this.trail_url = jsonObject.url;
  this.conditions = jsonObject.conditionDetails;
  this.condition_date = jsonObject.conditionDate.split(' ',1);
  this.condition_time = jsonObject.conditionDate.split(' ')[1];

}

//===Start Server
app.listen(PORT, () => console.log(`listening on PORT : ${PORT}`));
