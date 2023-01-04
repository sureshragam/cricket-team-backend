const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

function convertSnakeCaseToCamelCase(object) {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
}

const app = express();
app.use(express.json());

const path = require("path");
const dataBasePath = path.join(__dirname, "cricketTeam.db");
let db = null;

// get player details

app.get("/players/", async (request, response) => {
  const playersDetailsQuery = `
        SELECT * FROM cricket_team;
    `;
  try {
    const data = await db.all(playersDetailsQuery);
    const playerList = [];
    for (let obj of data) {
      playerList.push(convertSnakeCaseToCamelCase(obj));
    }
    response.send(playerList);
  } catch (e) {
    console.log(e.message);
  }
});

// post player detail

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  try {
    const playerDetailsToAddQuery = `
        INSERT INTO
            cricket_team (player_name,jersey_number,role)
        VALUES
            (
                '${playerName}',
                ${jerseyNumber},
                '${role}'
            );
    `;

    const dbResponse = await db.run(playerDetailsToAddQuery);
    response.send("Player Added to Team");
  } catch (e) {
    console.log(e.message);
  }
});

// get player detail

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  try {
    const playerDetailQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
        `;
    const singlePlayerDetail = await db.get(playerDetailQuery);

    response.send(convertSnakeCaseToCamelCase(singlePlayerDetail));
  } catch (e) {
    console.log(e.message);
  }
});

// put player data

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const { playerName, jerseyNumber, role } = request.body;
    const playerDetailUpdateQuery = `
            UPDATE cricket_team
            SET 
                player_name = '${playerName}',
                jersey_number = ${jerseyNumber},
                role = '${role}'
            WHERE player_id = ${playerId};
            `;
    await db.run(playerDetailUpdateQuery);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(e.message);
  }
});

// delete player detail

app.delete("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const deletePlayerQuery = `
        DELETE 
        FROM cricket_team
        WHERE player_id = ${playerId};
        `;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (e) {
    console.log(e.message);
  }
});

// starting server and connecting database

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDBAndServer();

module.exports = app;
