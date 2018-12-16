module.exports = function (initialState = {}, message = false){
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
                <div id="app">
                </div>

                <script>
                  window.__PRELOADED_STATE__ = ${JSON.stringify(initialState)};
                  var message = ${message};
                  if ( message ) {
                    alert(${message});
                  }
                </script>
                <script src="admin/main.js"></script>
              </body>
              `;

  return page;
}