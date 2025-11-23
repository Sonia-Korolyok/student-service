import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import express from 'express';
import studentRouter from '../routes/studentsRoutes.js';
import Student from '../model/students.js';
import { describe, expect, test, afterEach, afterAll, beforeAll } from '@jest/globals';
// Create Express app for testing
const app = express();
app.use(express.json());
app.use(studentRouter);

// Global variables for MongoDB server
let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {});

  console.log(`MongoDB successfully connected to ${mongoUri}`);
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections after each test
  await Student.deleteMany({});
});

// Clean up after all tests
afterAll(async () => {
  // Disconnect from MongoDB and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('MongoDB connection closed');
});

// Helper function to create a test student
async function createTestStudent(studentData = { id: 123, name: 'Test Student', password: 'password123' }) {
  const student = new Student({
    _id: studentData.id,
    name: studentData.name,
    password: studentData.password,
    scores: studentData.scores || {}
  });

  await student.save();
  return student;
}

describe('Student Controller Integration Tests', () => {

  describe('POST /student', () => {
    it('should create a new student with valid data', async () => {
      // Arrange
      const studentData = {
        id: 123,
        name: 'John Doe',
        password: 'password123'
      };

      // Act
      const response = await request(app)
        .post('/student')
        .send(studentData)
        .expect(201);

      // Assert
      // Check that the student was created in the database
      const student = await Student.findById(123);
      expect(student).not.toBeNull();
      expect(student.name).toBe('John Doe');
      expect(student.password).toBe('password123');
    });

    test('should return 400 with invalid data (missing required fields)', async () => {
      // Arrange
      const invalidStudentData = {
        id: 123,
        // Missing name and password
      };

      // Act & Assert
      const response = await request(app)
        .post('/student')
        .send(invalidStudentData)
        .expect(400);

      // Check that the error message is returned
      expect(response.body.error).toBeDefined();
    });

    test('should return 409 when student with same ID already exists', async () => {
      // Arrange
      await createTestStudent({ id: 123, name: 'Existing Student', password: 'existingPassword' });

      const studentData = {
        id: 123, // Same ID as existing student
        name: 'John Doe',
        password: 'password123'
      };

      // Act & Assert
      await request(app)
        .post('/student')
        .send(studentData)
        .expect(409);
    });
  });

  describe('GET /student/:id', () => {
    test('should return a student by ID', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123',
        scores: { math: 90 }
      });

      // Act
      const response = await request(app)
        .get('/student/123')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        id: "123",
        name: 'John Doe',
        scores: { math: 90 }
      });
      // Password should not be returned
      expect(response.body.password).toBeUndefined();
    });

    test('should return 404 when student is not found', async () => {
      // Act & Assert
      await request(app)
        .get('/student/999')
        .expect(404);
    });
  });

  describe('PATCH /student/:id', () => {
    test('should update a student with valid data', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      const updateData = {
        name: 'Updated Name',
        password: 'updatedPassword'
      };

      // Act
      const response = await request(app)
        .patch('/student/123')
        .send(updateData)
        .expect(200);

      // Assert
      expect(response.body.name).toBe('Updated Name');
      // Check that the student was updated in the database
      const updatedStudent = await Student.findById(123);
      expect(updatedStudent.name).toBe('Updated Name');
      expect(updatedStudent.password).toBe('updatedPassword');
    });

    test('should return 400 with invalid data', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      const invalidUpdateData = {
        name: 123 // Name should be a string
      };

      // Act & Assert
      const response = await request(app)
        .patch('/student/123')
        .send(invalidUpdateData)
        .expect(400);

      // Check that the error message is returned
      expect(response.body.error).toBeDefined();
    });

    test('should return 404 when student is not found', async () => {
      // Arrange
      const updateData = {
        name: 'Updated Name'
      };

      // Act & Assert
      await request(app)
        .patch('/student/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /student/:id', () => {
    test('should delete a student by ID', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      // Act
      const response = await request(app)
        .delete('/student/123')
        .expect(200);

      // Assert
      // Check that the student was deleted from the database
      const student = await Student.findById(123);
      expect(student).toBeNull();

      // Check that the response contains the deleted student
      expect(response.body.name).toBe('John Doe');
      // Password should not be returned
      expect(response.body.password).toBeUndefined();
    });

    test('should return 404 when student is not found', async () => {
      // Act & Assert
      await request(app)
        .delete('/student/999')
        .expect(404);
    });
  });

  describe('PATCH /score/student/:id', () => {
    test('should add a score to a student', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      const scoreData = {
        examName: 'math',
        score: 95
      };

      // Act
      await request(app)
        .patch('/score/student/123')
        .send(scoreData)
        .expect(204);

      // Assert
      // Check that the score was added to the student in the database
      const student = await Student.findById(123);
      expect(student.scores.get('math')).toBe(95);
    });

    test('should return 400 with invalid score data', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      const invalidScoreData = {
        // Missing examName
        score: 95
      };

      // Act & Assert
      const response = await request(app)
        .patch('/score/student/123')
        .send(invalidScoreData)
        .expect(400);

      // Check that the error message is returned
      expect(response.body.error).toBeDefined();
    });

    test('should return 404 when student is not found', async () => {
      // Arrange
      const scoreData = {
        examName: 'math',
        score: 95
      };

      // Act & Assert
      await request(app)
        .patch('/score/student/999')
        .send(scoreData)
        .expect(404);
    });
  });

  describe('GET /students/name/:name', () => {
    test('should return students with matching name', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John',
        password: 'password123',
        scores: { math: 90 }
      });

      await createTestStudent({
        id: 124,
        name: 'John',
        password: 'password456',
        scores: { math: 85 }
      });

      await createTestStudent({
        id: 125,
        name: 'Jane',
        password: 'password789',
        scores: { math: 95 }
      });

      // Act
      const response = await request(app)
        .get('/students/name/John')
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(2);
      response.body.forEach(student => {
        expect(student.name).toBe('John');
        // Passwords should not be returned
        expect(student.password).toBeUndefined();
      });
    });

    test('should return empty array when no students match the name', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      // Act
      const response = await request(app)
        .get('/students/name/NonExistent')
        .expect(200);

      // Assert
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /quantity/students', () => {
    test('should count students by names', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John',
        password: 'password123'
      });

      await createTestStudent({
        id: 124,
        name: 'John',
        password: 'password456'
      });

      await createTestStudent({
        id: 125,
        name: 'Jane',
        password: 'password789'
      });

      // Act
      const response = await request(app)
        .get('/quantity/students?names=John&names=Jane')
        .expect(200);

      // Assert
      expect(response.body).toBe(3);
    });

    test('should handle single name parameter', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John',
        password: 'password123'
      });

      await createTestStudent({
        id: 124,
        name: 'John',
        password: 'password456'
      });

      await createTestStudent({
        id: 125,
        name: 'Jane',
        password: 'password789'
      });

      // Act
      const response = await request(app)
        .get('/quantity/students?names=John')
        .expect(200);

      // Assert
      expect(response.body).toBe(2);
    });

    test('should return 0 when no students match the names', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123'
      });

      // Act
      const response = await request(app)
        .get('/quantity/students?names=NonExistent')
        .expect(200);

      // Assert
      expect(response.body).toBe(0);
    });
  });

  describe('GET /students/exam/:exam/minscore/:minScore', () => {
    test('should return students with minimum score for the exam', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123',
        scores: { math: 95, physics: 85 }
      });

      await createTestStudent({
        id: 124,
        name: 'Jane Smith',
        password: 'password456',
        scores: { math: 85, physics: 90 }
      });

      await createTestStudent({
        id: 125,
        name: 'Bob Johnson',
        password: 'password789',
        scores: { math: 75, physics: 80 }
      });

      // Act
      const response = await request(app)
        .get('/students/exam/math/minscore/85')
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toBe('John Doe');
      expect(response.body[1].name).toBe('Jane Smith');
      // Passwords should not be returned
      response.body.forEach(student => {
        expect(student.password).toBeUndefined();
      });
    });

    test('should return empty array when no students meet the minimum score', async () => {
      // Arrange
      await createTestStudent({
        id: 123,
        name: 'John Doe',
        password: 'password123',
        scores: { math: 75 }
      });

      // Act
      const response = await request(app)
        .get('/students/exam/math/minscore/80')
        .expect(200);

      // Assert
      expect(response.body).toEqual([]);
    });
  });
});
