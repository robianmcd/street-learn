import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {AngularFireModule} from "angularfire2";
import {AngularFireDatabaseModule} from "angularfire2/database";

const firebaseConfig =  {
  apiKey: "AIzaSyAJSZBAjK50MlZEfOE_6KF81abSLCpX8xg",
  authDomain: "street-learn.firebaseapp.com",
  databaseURL: "https://street-learn.firebaseio.com",
  projectId: "street-learn",
  storageBucket: "street-learn.appspot.com",
  messagingSenderId: "739820425301"
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
