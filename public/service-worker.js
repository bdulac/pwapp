/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/install.js',
  '/scripts/luxon-1.11.4.js',
  '/styles/inline.css',
  '/images/add.svg',
  '/images/clear-day.svg',
  '/images/clear-night.svg',
  '/images/cloudy.svg',
  '/images/fog.svg',
  '/images/hail.svg',
  '/images/install.svg',
  '/images/partly-cloudy-day.svg',
  '/images/partly-cloudy-night.svg',
  '/images/rain.svg',
  '/images/refresh.svg',
  '/images/sleet.svg',
  '/images/snow.svg',
  '/images/thunderstorm.svg',
  '/images/tornado.svg',
  '/images/wind.svg',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // CODELAB: Add fetch event handler here.
  if (evt.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }
  
access_time
14 mins remaining
6. Provide a full offline experience
Take a moment and put your phone into airplane mode, and try running some of your favorite apps. In almost all cases, they provide a fairly robust offline experience. Users expect that robust experience from their apps. And the web should be no different. Progressive Web Apps should be designed with offline as a core scenario.

Designing for offline-first can drastically improve the performance of your web app by reducing the number of network requests made by your app, instead resources can be precached and served directly from the local cache. Even with the fastest network connection, serving from the local cache will be faster!

Service worker life cycle
The life cycle of the service worker is the most complicated part. If you don't know what it's trying to do and what the benefits are, it can feel like it's fighting you. But once you know how it works, you can deliver seamless, unobtrusive updates to users, mixing the best of the web and native patterns.

Dive Deeper: This codelab only covers the very basics of the service worker life cycle. To dive deeper, refer to The Service Worker Lifecycle article on WebFundamentals.

install event
The first event a service worker gets is install. It's triggered as soon as the worker executes, and it's only called once per service worker. If you alter your service worker script the browser considers it a different service worker, and it'll get its own install event.



Typically the install event is used to cache everything you need for your app to run.

activate event
The service worker will receive an activate event every time it starts up. The main purpose of the activate event is to configure the service worker's behavior, clean up any resources left behind from previous runs (e.g. old caches), and get the service worker ready to handle network requests (for example the fetch event described below).

fetch event
The fetch event allows the service worker to intercept any network requests and handle requests. It can go to the network to get the resource, it can pull it from its own cache, generate a custom response or any number of different options. Check out the Offline Cookbook for different strategies that you can use.

Updating a service worker
The browser checks to see if there is a new version of your service worker on each page load. If it finds a new version, the new version is downloaded and installed in the background, but it is not activated. It's sits in a waiting state, until there are no longer any pages open that use the old service worker. Once all windows using the old service worker are closed, the new service worker is activated and can take control. Refer to the Updating the service worker section of the Service Worker Lifecycle doc for further details.

Choosing the right caching strategy
Choosing the right caching strategy depends on the type of resource you're trying to cache and how you might need it later. For our weather app, we'll split the resources we need to cache into two categories: resources we want to precache and the data that we'll cache at runtime.

Caching static resources
Precaching your resources is a similar concept to what happens when a user installs a desktop or mobile app. The key resources needed for the app to run are installed, or cached on the device so that they can be loaded later whether there's a network connection or not.

For our app, we'll precache all of our static resources when our service worker is installed so that everything we need to run our app is stored on the user's device. To ensure our app loads lightning fast, we'll use the cache-first strategy; instead of going to the network to get the resources, they're pulled from the local cache; only if it's not available there will we try to get it from the network.



Pulling from the local cache eliminates any network variability. No matter what kind of network the user is on (WiFi, 5G, 3G, or even 2G), the key resources we need to run are available almost immediately.

Caution: In this sample, static resources are served using a cache-first strategy, which results in a copy of any cached content being returned without consulting the network. While a cache-first strategy is easy to implement, it can cause challenges in the future.

Caching the app data
The stale-while-revalidate strategy is ideal for certain types of data and works well for our app. It gets data on screen as quickly as possible, then updates that once the network has returned the latest data. Stale-while-revalidate means we need to kick off two asynchronous requests, one to the cache and one to the network.



Under normal circumstances, the cached data will be returned almost immediately providing the app with recent data it can use. Then, when the network request returns, the app will be updated using the latest data from the network.

For our app, this provides a better experience than the network, falling back to cache strategy because the user does not have to wait until the network request times out to see something on screen. They may initially see older data, but once the network request returns, the app will be updated with the latest data.

Update app logic
As mentioned previously, the app needs to kick off two asynchronous requests, one to the cache and one to the network. The app uses the caches object available in window to access the cache and retrieve the latest data. This is an excellent example of progressive enhancement as the caches object may not be available in all browsers, and if it's not the network request should still work.

Update the getForecastFromCache() function, to check if the caches object is available in the global window object, and if it is, request the data from the cache.

public/scripts/app.js
// CODELAB: Add code to get weather forecast from the caches object.
if (!('caches' in window)) {
  return null;
}
const url = `${window.location.origin}/forecast/${coords}`;
return caches.match(url)
    .then((response) => {
      if (response) {
        return response.json();
      }
      return null;
    })
    .catch((err) => {
      console.error('Error getting data from cache', err);
      return null;
    });
Then, we need to modify updateData() so that it makes two calls, one to getForecastFromNetwork() to get the forecast from the network, and one to getForecastFromCache() to get the latest cached forecast:

public/scripts/app.js
// CODELAB: Add code to call getForecastFromCache.
getForecastFromCache(location.geo)
    .then((forecast) => {
      renderForecast(card, forecast);
    });
Our weather app now makes two asynchronous requests for data, one from the cache and one via a fetch. If there's data in the cache, it'll be returned and rendered extremely quickly (tens of milliseconds). Then, when the fetch responds, the card will be updated with the freshest data direct from the weather API.

Notice how the cache request and the fetch request both end with a call to update the forecast card. How does the app know whether it's displaying the latest data? This is handled in the following code from renderForecast():

public/scripts/app.js
// If the data on the element is newer, skip the update.
if (lastUpdated >= data.currently.time) {
  return;
}
Every time that a card is updated, the app stores the timestamp of the data on a hidden attribute on the card. The app just bails if the timestamp that already exists on the card is newer than the data that was passed to the function.

Pre-cache our app resources
In the service worker, let's add a DATA_CACHE_NAME so that we can separate our applications data from the app shell. When the app shell is updated and older caches are purged, our data will remain untouched, ready for a super fast load. Keep in mind, if your data format changes in the future, you'll need a way to handle that and ensure the app shell and content stay in sync.

public/service-worker.js
// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';
Don't forget to also update the CACHE_NAME; we'll be changing all of our static resources as well.

In order for our app to work offline, we need to precache all of the resources it needs. This will also help our performance. Instead of having to get all of the resources from the network, the app will be able to load all of them from the local cache, eliminating any network instability.

Update the FILES_TO_CACHE array with the list of files:

public/service-worker.js
// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/scripts/install.js',
  '/scripts/luxon-1.11.4.js',
  '/styles/inline.css',
  '/images/add.svg',
  '/images/clear-day.svg',
  '/images/clear-night.svg',
  '/images/cloudy.svg',
  '/images/fog.svg',
  '/images/hail.svg',
  '/images/install.svg',
  '/images/partly-cloudy-day.svg',
  '/images/partly-cloudy-night.svg',
  '/images/rain.svg',
  '/images/refresh.svg',
  '/images/sleet.svg',
  '/images/snow.svg',
  '/images/thunderstorm.svg',
  '/images/tornado.svg',
  '/images/wind.svg',
];
Since we are manually generating the list of files to cache, every time we update a file we must update the CACHE_NAME. We were able to remove offline.html from our list of cached files because our app now has all the necessary resources it needs to work offline, and won't ever show the offline page again.

Caution: In this sample, we hand-rolled our own service worker. Each time we update any of the static resources, we need to re-roll the service worker and update the cache, otherwise the old content will be served. In addition, when one file changes, the entire cache is invalidated and needs to be re-downloaded. That means fixing a simple single character spelling mistake will invalidate the cache and require everything to be downloaded again—not exactly efficient. Workbox handles this gracefully, by integrating it into your build process, only changed files will be updated, saving bandwidth for users and easier maintenance for you!

Update the activate event handler
To ensure our activate event doesn't accidentally delete our data, in the activate event of service-worker.js, replace if (key !== CACHE_NAME) { with:

public/service-worker.js
if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
Update the fetch event handler
We need to modify the service worker to intercept requests to the weather API and store their responses in the cache, so we can easily access them later. In the stale-while-revalidate strategy, we expect the network response to be the ‘source of truth', always providing us with the most recent information. If it can't, it's OK to fail because we've already retrieved the latest cached data in our app.

Update the fetch event handler to handle requests to the data API separately from other requests.

public/service-worker.js
// CODELAB: Add fetch event handler here.
if (evt.request.url.includes('/forecast/')) {
  console.log('[Service Worker] Fetch (data)', evt.request.url);
  evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
              return response;
            }).catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
      }));
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request)
          .then((response) => {
            return response || fetch(evt.request);
          });
    })
  );
