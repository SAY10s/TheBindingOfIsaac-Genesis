const USERS = {
  // username:password
  admin: "admin",
  test: "test",
  say10s: "say10s",
};
export const isValidPassword = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username] === data.password);
    }, 10);
  });
};
export const isUsernameTaken = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username]);
    }, 10);
  });
};
export const addUser = (data) => {
  setTimeout(() => {
    USERS[data.username] = data.password;
  }, 10);
};

export default {
  isValidPassword,
  isUsernameTaken,
  addUser,
};
