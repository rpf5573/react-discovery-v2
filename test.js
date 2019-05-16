var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8081, 'localhost');
console.log('Server running at http://localhost:8081/');

// Split the base64 string in data and contentType
      // const block = this.props.fileInfo.src.split(";");
      // Get the content type of the image
      // const contentType = block[0].split(":")[1];// In this case "image/gif"
      // get the real base64 content of the file
      /// const realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
      // Convert it to a blob to upload
      // file = utils.b64toBlob(realData, contentType);
      // file.name = this.props.fileInfo.fileName;