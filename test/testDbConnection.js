const USERS = {
  // username:password
  admin: "admin",
  test: "test",
  say10s: "say10s",
};
const isValidPassword = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username] === data.password);
    }, 10);
  });
};
const isUsernameTaken = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username]);
    }, 10);
  });
};
const addUser = (data) => {
  setTimeout(() => {
    USERS[data.username] = data.password;
  }, 10);
};

module.exports = {
  isValidPassword,
  isUsernameTaken,
  addUser,
};
