const querystring = require("querystring");
const { getDb } = require("../mongoDB/mongoManager.js"); // Assurez-vous que le chemin est correct
// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
function manageRequest(request, response) {
  if (request.method === "POST" && request.url === "/api/signin") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString(); // get elements from form
    });
    request.on("end", async () => {
      const parsedData = querystring.parse(body);
      console.log(parsedData); // display elements

      try {
        const db = getDb();
        const collection = db.collection("utilisateurs");
        await collection.insertOne(parsedData);
        response.setHeader("Content-Type", "text/html");
        response.end(
          `<script>window.location.href = "/connexion.html"; alert("Inscription effectuée");</script>`
        );
      } catch (error) {
        console.error("Erreur lors de l’insertion des données", error);
        response.statusCode = 500;
        response.end(`Erreur serveur`);
      }
    });
  } else {
    response.end(`Thanks for calling ${request.url}`);
  }
}

/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
 ** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
 ** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
 ** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
 ** are probably not the ones you will need. */
function addCors(response) {
  // Website you wish to allow to connect to your server.
  response.setHeader("Access-Control-Allow-Origin", "*");
  // Request methods you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  // Request headers you wish to allow.
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // Set to true if you need the website to include cookies in the requests sent to the API.
  response.setHeader("Access-Control-Allow-Credentials", true);
}

exports.manage = manageRequest;
