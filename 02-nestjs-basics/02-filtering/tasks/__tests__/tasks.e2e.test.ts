import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../app.module";
import { TaskStatus } from "../task.model";

describe("TasksModule (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /tasks (should return all tasks)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks")
      .expect(200);

    expect(response.body.length).toBe(5); // As per hardcoded tasks
  });

  it("GET /tasks?status=pending (should return tasks filtered by status)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?status=pending")
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Task 1" }),
        expect.objectContaining({ title: "Task 4" }),
      ]),
    );
    expect(response.body.length).toBe(2);
  });

  it("GET /tasks?page=1&limit=2 (should return paginated tasks)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?page=1&limit=2")
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ title: "Task 1" }),
      expect.objectContaining({ title: "Task 2" }),
    ]);
    expect(response.body.length).toBe(2);
  });

  it("GET /tasks?status=in_progress&page=1&limit=1 (should return filtered and paginated tasks)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?status=in_progress&page=1&limit=1")
      .expect(200);

    expect(response.body).toEqual([
      expect.objectContaining({ title: "Task 2" }),
    ]);
    expect(response.body.length).toBe(1);
  });

  it("GET /tasks (should return empty array for out-of-bound pagination)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?page=10&limit=5")
      .expect(200);

    expect(response.body).toEqual([]);
  });

  it("GET /tasks?sortBy=title (should return tasks sorted by title)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?sortBy=title")
      .expect(200);

    expect(response.body).toEqual([
                                    expect.objectContaining({ title: "Task 1" }),
                                    expect.objectContaining({ title: "Task 2" }),
                                    expect.objectContaining({ title: "Task 3" }),
                                    expect.objectContaining({ title: "Task 4" }),
                                    expect.objectContaining({ title: "Task 5" }),
                                  ]);
    expect(response.body.length).toBe(5);
  });

  it("GET /tasks?sortBy=status (should return tasks sorted by status)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?sortBy=status")
      .expect(200);

    expect(response.body).toEqual([
                                    expect.objectContaining({ title: "Task 3" }),
                                    expect.objectContaining({ title: "Task 2" }),
                                    expect.objectContaining({ title: "Task 5" }),
                                    expect.objectContaining({ title: "Task 1" }),
                                    expect.objectContaining({ title: "Task 4" }),
                                  ]);
    expect(response.body.length).toBe(5);
  });

  it("GET /tasks?sortBy=status&page=1&limit=3 (should return tasks sorted by status and paginated)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?sortBy=status&page=1&limit=3")
      .expect(200);

    expect(response.body).toEqual([
                                    expect.objectContaining({ title: "Task 3" }),
                                    expect.objectContaining({ title: "Task 2" }),
                                    expect.objectContaining({ title: "Task 5" }),
                                  ]);
    expect(response.body.length).toBe(3);
  });

  it("GET /tasks?sortBy=status&status=pending&page=1&limit=2 (should return filtered and sorted by status and paginated tasks)", async () => {
    const response = await request(app.getHttpServer())
      .get("/tasks?sortBy=status&status=pending&page=1&limit=3")
      .expect(200);

    expect(response.body).toEqual([
                                    expect.objectContaining({ title: "Task 1" }),
                                    expect.objectContaining({ title: "Task 4" }),
                                  ]);
    expect(response.body.length).toBe(2);
  });
});
