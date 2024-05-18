import { Client } from "pg";
const client = new Client({
  host: "db",
  port: 5432,
  user: "postgres",
  password: "moje_haslo",
  database: "postgres",
});

client.connect((err: Error) => {
  if (err) {
    console.error("Connection error", err.stack);
  } else {
    console.log("Connected");
  }
});

const getUsers = async () => {
  try {
    const res = await client.query("SELECT * FROM users");
    return res.rows;
  } catch (err) {
    console.error(err);
  }
};
getUsers()
  .then((users) => console.log("Users:" + users))
  .catch((err) => console.error(err));

const isValidPassword = async (data: {
  username: string;
  password: string;
}) => {
  try {
    const res = await client.query(
      "SELECT password FROM users WHERE username = $1",
      [data.username],
    );
    return res.rows.length > 0 && res.rows[0].password === data.password;
  } catch (err) {
    console.error(err);
  }
};

const isUsernameTaken = async (data: { username: string }) => {
  try {
    const res = await client.query(
      "SELECT username FROM users WHERE username = $1",
      [data.username],
    );
    return res.rows.length > 0;
  } catch (err) {
    console.error(err);
  }
};

const addUser = async (data: { username: string; password: string }) => {
  try {
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [data.username, data.password],
    );
  } catch (err) {
    console.error(err);
  }
};
