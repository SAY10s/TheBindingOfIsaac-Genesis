const USERS: Record<string, string> = {
  admin: "admin",
  test: "test",
};
export const isValidPassword = (data: {
  username: string;
  password: string;
}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username] === data.password);
    }, 10);
  });
};
export const isUsernameTaken = (data: { username: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(USERS[data.username]);
    }, 10);
  });
};
export const addUser = (data: { username: string; password: string }) => {
  setTimeout(() => {
    USERS[data.username] = data.password;
  }, 10);
};

export default {
  isValidPassword,
  isUsernameTaken,
  addUser,
};
