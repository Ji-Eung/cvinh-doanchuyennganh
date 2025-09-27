import { initTestDb, clearDatabase, closeDatabase, api } from "./helpers";

let accessToken: string;
let refreshToken: string;

describe("Auth Flow", () => {
  beforeAll(async () => {
    await initTestDb();
  });
  afterAll(async () => {
    await closeDatabase();
  });
  afterEach(async () => {
    await clearDatabase();
  });

  it("register -> login -> refresh -> logout", async () => {
    const registerRes = await api()
      .post("/api/auth/register")
      .send({ name: "User A", email: "a@example.com", password: "secret123" })
      .expect(201);

    expect(registerRes.body.success).toBe(true);

    const loginRes = await api()
      .post("/api/auth/login")
      .send({ email: "a@example.com", password: "secret123" })
      .expect(200);
    accessToken = loginRes.body.data.accessToken;
    refreshToken = loginRes.body.data.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const refreshRes = await api()
      .post("/api/auth/refresh")
      .send({ refreshToken })
      .expect(200);
    expect(refreshRes.body.data.accessToken).toBeTruthy();

    await api().post("/api/auth/logout").send({ refreshToken }).expect(200);
  });
});
