const querystring = require("querystring");
const jwt = require("jsonwebtoken");
const { getDb } = require("../mongoDB/mongoManager.js");

function manageRequest(request, response) {
  if (request.method === "POST" && request.url === "/api/signin") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", async () => {
      const parsedData = querystring.parse(body);

      try {
        const db = getDb();
        const collection = db.collection("users");

        const tokenPayload = {
          email: parsedData.mail,
          password: parsedData.password,
        };
        const token = jwt.sign(tokenPayload, parsedData.username);

        const existingUser = await collection.findOne({
          $or: [{ mail: parsedData.mail }, { username: parsedData.username }],
        });

        if (existingUser) {
          response.setHeader("Content-Type", "text/html");
          response.end(
            `<script>alert("Mail or username already used"); window.location.href = "/connexion.html";</script>`
          );
          return;
        }

        const encodedData = {
          username: parsedData.username,
          mail: parsedData.mail,
          token: token,
        };

        await collection.insertOne(encodedData);
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
