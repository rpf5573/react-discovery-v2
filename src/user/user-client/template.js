module.exports = function (initialState = {}, srcPath = { style: 'style.css', js: 'main.js' }, dcv='v1', message = ''){
  let page = `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
                <title> MIR ADVENTURE </title>
                <link href="${srcPath.style}" rel="stylesheet">
              </head>
              <body>
                <div id="app">
                </div>

                <script>
                  window.__PRELOADED_STATE__ = ${JSON.stringify(initialState)};
                  window.__dcv__ = '${dcv}';
                  var message = '${message}';
                  if ( message ) {
                    alert(message);
                  }
                </script>
                <script src="${srcPath.js}"></script>
              </body>
              `;

  return page;
}