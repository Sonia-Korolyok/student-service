import { jest } from '@jest/globals';
import { describe, expect, test, beforeEach } from '@jest/globals';

// Import the modules after mocking
// import * as studentService from '../service/studentService.js';

// Mock the repository module before importing it

// Repository mocks scaffold
const repoMock = {
  createStudent: jest.fn(),
  findStudentById: jest.fn(),
  deleteStudentById: jest.fn(),
  updateStudent: jest.fn(),
  updateStudentScores: jest.fn(),
  findStudentsByName: jest.fn(),
  countStudentsByName: jest.fn(),
  findStudentsByMinScores: jest.fn(),
};

// IMPORTANT: mock the dependency first, then import the module under test
await jest.unstable_mockModule('../repository/studentRepository.js', () => ({
  ...repoMock,
}));

const studentService = await import('../service/studentService.js');

describe('Student Service Tests', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    Object.values(repoMock).forEach(fn => fn.mockReset());
  });

  describe('addStudent', () => {
    test('should add a student when ID does not exist', async () => {
      // Arrange
      const studentData = { id: 123, name: 'John Doe', password: 'password123' };
      repoMock.findStudentById.mockResolvedValue(null);
      repoMock.createStudent.mockResolvedValue({ _id: 123, name: 'John Doe', password: 'password123' });

      // Act
      const result = await studentService.addStudent(studentData);

      // Assert
      expect(result).toBe(true);
      expect(repoMock.findStudentById).toHaveBeenCalledWith(123);
      expect(repoMock.createStudent).toHaveBeenCalledWith({ _id: 123, name: 'John Doe', password: 'password123' });
    });

    test('should not add a student when ID already exists', async () => {
      // Arrange
      const studentData = { id: 123, name: 'John Doe', password: 'password123' };
      repoMock.findStudentById.mockResolvedValue({ _id: 123, name: 'Existing Student', password: 'existingPassword' });

      // Act
      const result = await studentService.addStudent(studentData);

      // Assert
      expect(result).toBe(false);
      expect(repoMock.findStudentById).toHaveBeenCalledWith(123);
      expect(repoMock.createStudent).not.toHaveBeenCalled();
    });
  });

  describe('findStudent', () => {
    test('should find a student by ID and remove password', async () => {
      // Arrange
      const studentId = 123;
      const mockStudent = { _id: 123, name: 'John Doe', password: 'password123', scores: { math: 90 } };
      repoMock.findStudentById.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.findStudent(studentId);

      // Assert
      expect(result).toEqual({ _id: 123, name: 'John Doe', scores: { math: 90 } });
      expect(result.password).toBeUndefined();
      expect(repoMock.findStudentById).toHaveBeenCalledWith(studentId);
    });

    test('should return null when student is not found', async () => {
      // Arrange
      const studentId = 999;
      repoMock.findStudentById.mockResolvedValue(null);

      // Act
      const result = await studentService.findStudent(studentId);

      // Assert
      expect(result).toBeNull();
      expect(repoMock.findStudentById).toHaveBeenCalledWith(studentId);
    });
  });

  describe('deleteStudent', () => {
    test('should delete a student by ID and remove password', async () => {
      // Arrange
      const studentId = 123;
      const mockStudent = { _id: 123, name: 'John Doe', password: 'password123', scores: { math: 90 } };
      repoMock.deleteStudentById.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.deleteStudent(studentId);

      // Assert
      expect(result).toEqual({ _id: 123, name: 'John Doe', scores: { math: 90 } });
      expect(result.password).toBeUndefined();
      expect(repoMock.deleteStudentById).toHaveBeenCalledWith(studentId);
    });

    test('should return null when student to delete is not found', async () => {
      // Arrange
      const studentId = 999;
      repoMock.deleteStudentById.mockResolvedValue(null);

      // Act
      const result = await studentService.deleteStudent(studentId);

      // Assert
      expect(result).toBeNull();
      expect(repoMock.deleteStudentById).toHaveBeenCalledWith(studentId);
    });
  });

  describe('updateStudent', () => {
    test('should update a student and remove scores', async () => {
      // Arrange
      const studentId = 123;
      const updateData = { name: 'Updated Name' };
      const mockStudent = { 
        _id: 123, 
        name: 'Updated Name', 
        password: 'password123', 
        scores: { math: 90 } 
      };
      repoMock.updateStudent.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.updateStudent(studentId, updateData);

      // Assert
      expect(result).toEqual({ _id: 123, name: 'Updated Name', password: 'password123' });
      expect(result.scores).toBeUndefined();
      expect(repoMock.updateStudent).toHaveBeenCalledWith(studentId, updateData);
    });

    test('should return null when student to update is not found', async () => {
      // Arrange
      const studentId = 999;
      const updateData = { name: 'Updated Name' };
      repoMock.updateStudent.mockResolvedValue(null);

      // Act
      const result = await studentService.updateStudent(studentId, updateData);

      // Assert
      expect(result).toBeNull();
      expect(repoMock.updateStudent).toHaveBeenCalledWith(studentId, updateData);
    });
  });

  describe('addScore', () => {
    test('should add a score to a student', async () => {
      // Arrange
      const studentId = 123;
      const examName = 'math';
      const score = 95;
      const mockUpdatedStudent = { _id: 123, name: 'John Doe', scores: { math: 95 } };
      repoMock.updateStudentScores.mockResolvedValue(mockUpdatedStudent);

      // Act
      const result = await studentService.addScore(studentId, examName, score);

      // Assert
      expect(result).toBe(true);
      expect(repoMock.updateStudentScores).toHaveBeenCalledWith(studentId, examName, score);
    });

    test('should return false when student is not found', async () => {
      // Arrange
      const studentId = 999;
      const examName = 'math';
      const score = 95;
      repoMock.updateStudentScores.mockResolvedValue(null);

      // Act
      const result = await studentService.addScore(studentId, examName, score);

      // Assert
      expect(result).toBe(false);
      expect(repoMock.updateStudentScores).toHaveBeenCalledWith(studentId, examName, score);
    });
  });

  describe('findByName', () => {
    test('should find students by name and remove passwords', async () => {
      // Arrange
      const name = 'John';
      const mockStudents = [
        { _id: 123, name: 'John Doe', password: 'password123', scores: { math: 90 } },
        { _id: 124, name: 'John Smith', password: 'password456', scores: { math: 85 } }
      ];

      repoMock.findStudentsByName.mockResolvedValue(mockStudents);

      // Act
      const result = await studentService.findByName(name);

      // Assert
      expect(result).toEqual([
        { _id: 123, name: 'John Doe', scores: { math: 90 } },
        { _id: 124, name: 'John Smith', scores: { math: 85 } }
      ]);
      result.forEach(student => {
        expect(student.password).toBeUndefined();
      });
      expect(repoMock.findStudentsByName).toHaveBeenCalledWith(name);
    });

    test('should return empty array when no students match the name', async () => {
      // Arrange
      const name = 'NonExistent';
      repoMock.findStudentsByName.mockResolvedValue([]);

      // Act
      const result = await studentService.findByName(name);

      // Assert
      expect(result).toEqual([]);
      expect(repoMock.findStudentsByName).toHaveBeenCalledWith(name);
    });
  });

  describe('countByNames', () => {
    test('should count students by multiple names', async () => {
      // Arrange
      const names = ['John', 'Jane'];
      const expectedCount = 5;
      repoMock.countStudentsByName.mockResolvedValue(expectedCount);

      // Act
      const result = await studentService.countByNames(names);

      // Assert
      expect(result).toBe(expectedCount);
      expect(repoMock.countStudentsByName).toHaveBeenCalledWith(names);
    });

    test('should handle single name as string', async () => {
      // Arrange
      const name = 'John';
      const expectedCount = 3;
      repoMock.countStudentsByName.mockResolvedValue(expectedCount);

      // Act
      const result = await studentService.countByNames(name);

      // Assert
      expect(result).toBe(expectedCount);
      expect(repoMock.countStudentsByName).toHaveBeenCalledWith([name]);
    });
  });

  describe('findByMinScore', () => {
    test('should find students with minimum score and remove passwords', async () => {
      // Arrange
      const exam = 'math';
      const minScore = 90;
      const mockStudents = [
        { _id: 123, name: 'John Doe', password: 'password123', scores: { math: 95 } },
        { _id: 124, name: 'Jane Smith', password: 'password456', scores: { math: 92 } }
      ];
      repoMock.findStudentsByMinScores.mockResolvedValue(mockStudents);

      // Act
      const result = await studentService.findByMinScore(exam, minScore);

      // Assert
      expect(result).toEqual([
        { _id: 123, name: 'John Doe', scores: { math: 95 } },
        { _id: 124, name: 'Jane Smith', scores: { math: 92 } }
      ]);
      result.forEach(student => {
        expect(student.password).toBeUndefined();
      });
      expect(repoMock.findStudentsByMinScores).toHaveBeenCalledWith(exam, minScore);
    });

    test('should return empty array when no students meet the minimum score', async () => {
      // Arrange
      const exam = 'math';
      const minScore = 95;
      repoMock.findStudentsByMinScores.mockResolvedValue([]);

      // Act
      const result = await studentService.findByMinScore(exam, minScore);

      // Assert
      expect(result).toEqual([]);
      expect(repoMock.findStudentsByMinScores).toHaveBeenCalledWith(exam, minScore);
    });
  });
});