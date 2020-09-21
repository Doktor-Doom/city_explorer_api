'use-strict';
// ===PACKAGE===
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
// ===GLOBAL===
const PORT = process.env.PORT || 3003;
const app = express();
// ===KEYS===
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const YELP_API_KEY = process.env.YELP_API_KEY;
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;
//===EXPRESS CONFIG===
app.use(cors());
const client = new pg.Client(DATABASE_URL);
client.on('error', (error) => console.error(error));
// ===ROUTE
app.get('/', (req, res) => res.status(200).send('PINEAPPLE!!!'));
// ===ONE
app.get('/location', sendLocationData);
function sendLocationData(req, res){
  console.log(req.query);
  const sqlStatement = 'SELECT * FROM locations;';
  const locationSearch = req.query.city;
  client.query(sqlStatement)
    .then(sqlResult => {
      // console.log(sqlResult.rows);
      let existingVal = sqlResult.rows.map(element => element.search_query);
      if(existingVal.includes(locationSearch)){
        client.query(`SELECT * FROM locations WHERE search_query = '${locationSearch}'`)
          .then(storeData => {
            console.log('pulling stuff');
            res.send(storeData.rows[0]);
          });
      } else {
        const urlSearch = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${locationSearch}&format=json`;
        console.log(urlSearch);
        superagent.get(urlSearch)
          .then(resultAPI => {
            const superagentResultArr = resultAPI.body;
            // console.log(superagentResultArr[0].display_name);
            const queryString = ('INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1,$2,$3,$4)');
            const valArr = [locationSearch, superagentResultArr[0].display_name, superagentResultArr[0].lat, superagentResultArr[0].lon];
            client.query(queryString, valArr)
              .then( () => {
                res.send(new Location(locationSearch, superagentResultArr[0]));
              });
            // const superagentResultArr = someReturned.body;
            // const constLocations = new Location(superagentResultArr);
            // res.send(constLocations);
          })
          .catch(error => {
            console.log(error);
            res.status(500).send(error.message);
          });
      }
    });
  // const lookFor = req.query.city;
  // .catch(error => {
  //   console.log(error);
  //   res.status(500).send(error.message);
  // });
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
      console.log(trailData.body);
      const trailPass = trailData.body.trails;
      const trailArr = trailPass.map(index => new Trail(index));
      res.send(trailArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}

// ===FOUR
app.get('/movies', sendMovies);
function sendMovies(req, res){
  let filmTitle =req.query.search_query;
  const urlAPIMovies = `https://api.themoviedb.org/3/search/movie?api_key=${MOVIE_API_KEY}&language=en-US&query=${filmTitle}&page=1&include_adult=false`;
  superagent.get(urlAPIMovies)
    .then(movieAPIDB => {
      const movieArr = movieAPIDB.body.results.map(movieData => 
        new Movie(movieData));
      res.send(movieArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}
// ===FIVE
app.get('/yelp', sendYelp);
function sendYelp(req, res){
  let yelpQuery = req.query.search_query;
  const urlToYelpAPI = `https://api.yelp.com/v3/businesses/search?location=${yelpQuery}&limit=5&total=1000`;
  superagent.get(urlToYelpAPI)
    .set('Authorization', `Bearer ${YELP_API_KEY}`)
    .then(yelpAPIData => {
      const yelpArr = yelpAPIData.body.businesses.map(yelpData => new Yelp(yelpData));
      res.send(yelpArr);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send(error.message);
    });
}
// ===EVERYTHING ELSE MAYBE
function Location(city, jsonObject) {
  this.search_query = city;
  this.formatted_query = jsonObject.display_name;
  this.latitude = jsonObject.lat;
  this.longitude = jsonObject.lon;
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
function Movie(jsonObject){
  this.title = jsonObject.title;
  this.overview = jsonObject.overview;
  this.avergage_votes = jsonObject.vote_average;
  this.total_votes = jsonObject.vote_count;
  this.popularity = jsonObject.popularity;
  this.released_on = jsonObject.release_date;
}
function Yelp(jsonObject){
  this.name = jsonObject.name;
  this.image_url = jsonObject.image_url;
  this.price = jsonObject.price;
  this.rating = jsonObject.rating;
  this.url = jsonObject.url;
}
//===Start Server

client.connect()
  .then(() => { app.listen(PORT, () => console.log(`listening on PORT : ${PORT}`));
  });

