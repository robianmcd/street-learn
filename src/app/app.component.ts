import {Component} from "@angular/core";
import {} from '@types/googlemaps';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import StreetViewService = google.maps.StreetViewService;
import {Place} from "./place";
import StreetViewPanorama = google.maps.StreetViewPanorama;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [`
    #street-view {
      height: calc(100vh - 150px);
      width: 100%
    }

    .button-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 150px;
    }

    button {
      margin: 20px;
      padding: 10px;
      width: 150px;
      font-size: 18px;
      border: 1px solid black;
    }

    button:focus {
      outline: none;
    }

    .match-btn {
      color: white;
      background: #1f1f1f;
    }

    .match-btn:hover {
      background: #292929;
    }

    .match-btn:active {
      background: black;
    }

    .miss-btn {
      color: black;
      background: white;
    }

    .miss-btn:hover {
      background: #f7f7f7;
    }

    .miss-btn:active {
      background: #e6e6e6;
    }
  `]
})
export class AppComponent {
  minLat = 43.643603;
  maxLat = 43.646692;
  minLng = -79.402897;
  maxLng = -79.389699;

  streetService: StreetViewService;
  places: FirebaseListObservable<Place[]>;
  curPanorama: StreetViewPanorama;

  constructor(private db: AngularFireDatabase) {
    this.places = db.list('/places');

    if (window['googleMapsLoaded']) {
      //ლ(ಠ益ಠლ)
      setTimeout(() => this.onGoogleMapsLoaded());
    } else {
      window['onGoogleMapsLoaded'] = () => this.onGoogleMapsLoaded();
    }

    //this.getStreet();

  }

  onGoogleMapsLoaded() {
    this.streetService = new google.maps.StreetViewService();
    this.loadNextPanorama();
  }

  onMatch() {
    this.addPlace(true);
    this.loadNextPanorama();
  }

  onMiss() {
    this.addPlace(false);
    this.loadNextPanorama();
  }

  addPlace(isMatch: boolean) {
    const loc = this.curPanorama.getLocation();

    this.places.push({
      lat: loc.latLng.lat(),
      lng: loc.latLng.lng(),
      heading: this.curPanorama.getPov().heading,
      isMatch: isMatch
    });
  }

  loadNextPanorama() {
    const latRange = this.maxLat - this.minLat;
    const lngRange = this.maxLng - this.minLng;
    const lat = this.minLat + (Math.random() * latRange);
    const lng = this.minLng + (Math.random() * lngRange);

    const locationRequest = {
      location: new google.maps.LatLng(lat, lng),
      preference: google.maps.StreetViewPreference.NEAREST,
      radius: 500,
      source: google.maps.StreetViewSource.OUTDOOR
    };

    this.streetService.getPanorama(locationRequest, (data, status) => {
      this.curPanorama = new google.maps.StreetViewPanorama(
        document.getElementById('street-view'),
        {
          pano: data.location.pano
        }
      )
    });

  }

  numStreets = 0;
  streets = {};
  getStreet() {
    let geocoder = new google.maps.Geocoder();

    const latRange = this.maxLat - this.minLat;
    const lngRange = this.maxLng - this.minLng;
    const lat = this.minLat + (Math.random() * latRange);
    const lng = this.minLng + (Math.random() * lngRange);

    geocoder.geocode({'location': {lat, lng}}, (results, status) => {
      console.log(status);
      if(results && results[0]) {
        for (let i = 0; i < results[0].address_components.length; i++) {
          let comp = results[0].address_components[i];

          let resultLat = results[0].geometry.location.lat();
          let resultLng = results[0].geometry.location.lng();

          if(comp.types.includes('route')) {
              //console.log(comp.short_name);
              this.streets[comp.short_name] = this.streets[comp.short_name] || 0;
              this.streets[comp.short_name]++;
              this.db.list('/multiClassPlaces').push({lat: resultLat, lng: resultLng, streetName: comp.short_name});
              break;
          }
        }

      }

      this.numStreets++;

      if(this.numStreets < 1000) {
        setTimeout(() => this.getStreet(), 12000 + Math.random() * 12000);
      } else {
        console.log(this.streets);
      }
    });
  }
}
