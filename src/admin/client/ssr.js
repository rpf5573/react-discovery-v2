// defaults
import React from 'react';
import ReactDOM from 'react-dom/server';
import App from './components/app';
import configureStore from './store';

export default (initialSettings) => {
  let store = configureStore(initialSettings);
  const app = (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
  const appString = ReactDOM.renderToString(app);
  return template(store.getState(), appString);
}

function template(initialState = {}, content = ""){
  let page = `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
                <title> Discovery </title>
                <link href="admin/style.css" rel="stylesheet">
              </head>
              <body>
                <div class="content">
                   <div id="app" class="wrap-inner">
                      <!--- magic happens here -->  ${content}
                   </div>
                </div>

                <script>
                  window.__STATE__ = ${JSON.stringify(initialState)}
                </script>
                <script src="admin/main.js"></script>
              </body>
              `;

  return page;
}
