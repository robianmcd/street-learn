import os
os.environ['TF_CPP_MIN_LOG_LEVEL']='2'

import pyrebase
import pandas as pd

import matplotlib.pyplot as plt

from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasClassifier

from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler

import random
from random import randint

import threading
import time

config = {
  "apiKey": "AIzaSyAJSZBAjK50MlZEfOE_6KF81abSLCpX8xg",
  "authDomain": "street-learn.firebaseapp.com",
  "databaseURL": "https://street-learn.firebaseio.com",
  "storageBucket": "street-learn.appspot.com",
  "serviceAccount": "./serviceAccountCredentials.json"
}

firebase = pyrebase.initialize_app(config)

db = firebase.database()

columns = ['lat', 'lng', 'heading', 'isMatch']
places = []

def stream_handler(message):
  print('recieved message from firebase')
  event = message['event']  # put
  path = message['path']  # /-K7yGTTEp7O549EzTYtI
  data = message['data']  # {'title': 'Pyrebase', 'body': 'etc...'}

  if event == 'put' and data != None:
    if path == "/":
      for fbPlace in data.values():
        addPlace(fbPlace)
    else:
      addPlace(data)

    on_place_added()

def addPlace(fbPlace):
  if fbPlace['isMatch'] == False and randint(0, 4) != 0:
    return

  places.append([
    fbPlace['lat'],
    fbPlace['lng'],
    fbPlace['heading'],
    fbPlace['isMatch']
  ])

def on_place_added():
  random.shuffle(places)
  df = pd.DataFrame(data=places, columns=columns)
  df = min_max_normalize(df)

  # plt.scatter(df['lat'], df['lng'], c=df['isMatch'])
  # plt.show()

  #df.lat = min_max_normalize(df.lat)
  ##could graph this with df.lng.hist(range=[-80,0], bins=100)
  #df.lng = min_max_normalize(df.lng)
  #df.heading = min_max_normalize(df.heading)

  #inputMatrix = df[['lat', 'lng', 'heading']].as_matrix()
  inputMatrix = df[['lat', 'lng']].as_matrix()
  target = df['isMatch'].as_matrix()


  print('Starting in ' + threading.current_thread().name)

  # evaluate model with standardized dataset
  threading.current_thread().name = 'MainThread'
  estimator = KerasClassifier(build_fn=get_model, nb_epoch=200, batch_size=10, verbose=0)
  kfold = StratifiedKFold(n_splits=2, shuffle=True)
  results = cross_val_score(estimator, inputMatrix, target, cv=kfold)
  print('Results: %.2f%% (%.2f%%)' % (results.mean()*100, results.std()*100))

  # Fit the model
  model = get_model()
  training_data = model.fit(inputMatrix, target, validation_split=0.3, epochs=200, batch_size=10)
  # print('test')
  plt.plot(training_data.history['val_loss'], 'g', training_data.history['loss'], 'r', training_data.history['val_acc'], 'g')
  plt.show()

def get_model():
  model = Sequential()
  model.add(Dense(8, input_dim=2, activation='relu'))
  model.add(Dense(8, activation='relu'))
  model.add(Dense(1, activation='sigmoid'))

  model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['binary_accuracy', 'accuracy'])

  return model

def min_max_normalize(series):
  return (series - series.min()) / (series.max()-series.min())


my_stream = db.child('places').stream(stream_handler)
print('reached end of file')
