import { randomUUID } from "node:crypto";
import request from "supertest";
import { SUCCESS_STATUS_CODE } from "../../constants.ts";
import app from "../../index.ts";

const uniqueId = randomUUID();
const password = "password123";
const userCredentials = {
  username: `integration-${uniqueId}`,
  email: `integration-${uniqueId}@example.com`,
  password,
  confirmPassword: password,
};
const expectedUserResponse = {
  _id: expect.any(String),
  username: userCredentials.username,
  email: userCredentials.email,
  role: expect.any(String),
  dateCreated: expect.any(String),
  systemManaged: false,
};

let userId: string;
let accessToken: string;
let refreshToken: string;

beforeAll(async () => {
  const response = await request(app)
    .post("/api/v1/auth/register")
    .send(userCredentials);

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    user: expectedUserResponse,
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    accessTokenExpireTime: expect.any(String),
    refreshTokenExpireTime: expect.any(String),
  });

  userId = response.body.user._id;
  accessToken = response.body.accessToken;
  refreshToken = response.body.refreshToken;
});

afterAll(async () => {
  const response = await request(app)
    .delete(`/api/v1/auth/close-account/${userId}`)
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(SUCCESS_STATUS_CODE);
  expect(response.body).toEqual(expectedUserResponse);
});

test("POST /login should return a user and token pair", async () => {
  const response = await request(app).post("/api/v1/auth/login").send({
    email: userCredentials.email,
    password,
  });

  expect(response.status).toBe(SUCCESS_STATUS_CODE);
  expect(response.body).toEqual({
    user: expectedUserResponse,
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    accessTokenExpireTime: expect.any(String),
    refreshTokenExpireTime: expect.any(String),
  });

  accessToken = response.body.accessToken;
  refreshToken = response.body.refreshToken;
});

test("POST /secure should return the authenticated user", async () => {
  const response = await request(app)
    .post("/api/v1/auth/secure")
    .set("Authorization", `Bearer ${accessToken}`);

  expect(response.status).toBe(SUCCESS_STATUS_CODE);
  expect(response.body).toEqual(expectedUserResponse);
});

test("POST /tokens/new should return a new token pair", async () => {
  const response = await request(app)
    .post("/api/v1/auth/tokens/new")
    .send({ refreshToken });

  expect(response.status).toBe(SUCCESS_STATUS_CODE);
  expect(response.body).toEqual({
    accessToken: expect.any(String),
    refreshToken: expect.any(String),
    accessTokenExpireTime: expect.any(String),
    refreshTokenExpireTime: expect.any(String),
  });

  accessToken = response.body.accessToken;
  refreshToken = response.body.refreshToken;
});
