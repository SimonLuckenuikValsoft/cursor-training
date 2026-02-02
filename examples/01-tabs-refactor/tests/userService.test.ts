/**
 * Tests for User Service
 * 
 * These tests validate the current behavior and will help ensure
 * refactoring doesn't break functionality.
 */

import {
  validateUserName,
  validateUserEmail,
  validateUserRole,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  listUsers,
  formatUserForDisplay,
  formatUserForLog,
  formatUserForExport,
  clearUsers,
  User,
} from '../src/userService';

describe('Validation Functions', () => {
  describe('validateUserName', () => {
    it('should accept valid names', () => {
      expect(validateUserName('Alice')).toEqual({ valid: true });
      expect(validateUserName('Bob Smith')).toEqual({ valid: true });
      expect(validateUserName("Mary O'Brien")).toEqual({ valid: true });
    });

    it('should reject empty names', () => {
      expect(validateUserName('')).toEqual({ valid: false, error: 'Name is required' });
    });

    it('should reject names that are too short', () => {
      expect(validateUserName('A')).toEqual({ valid: false, error: 'Name must be at least 2 characters' });
    });

    it('should reject names with invalid characters', () => {
      expect(validateUserName('Alice123')).toEqual({ valid: false, error: 'Name contains invalid characters' });
    });
  });

  describe('validateUserEmail', () => {
    it('should accept valid emails', () => {
      expect(validateUserEmail('test@example.com')).toEqual({ valid: true });
      expect(validateUserEmail('user.name@domain.org')).toEqual({ valid: true });
    });

    it('should reject empty emails', () => {
      expect(validateUserEmail('')).toEqual({ valid: false, error: 'Email is required' });
    });

    it('should reject invalid email formats', () => {
      expect(validateUserEmail('notanemail')).toEqual({ valid: false, error: 'Email format is invalid' });
      expect(validateUserEmail('missing@domain')).toEqual({ valid: false, error: 'Email format is invalid' });
    });
  });

  describe('validateUserRole', () => {
    it('should accept valid roles', () => {
      expect(validateUserRole('admin')).toEqual({ valid: true });
      expect(validateUserRole('editor')).toEqual({ valid: true });
      expect(validateUserRole('viewer')).toEqual({ valid: true });
    });

    it('should reject invalid roles', () => {
      expect(validateUserRole('superuser')).toEqual({ valid: false, error: 'Role must be admin, editor, or viewer' });
    });
  });
});

describe('CRUD Operations', () => {
  beforeEach(() => {
    clearUsers();
  });

  describe('createUser', () => {
    it('should create a valid user', () => {
      const result = createUser({
        name: 'Test User',
        email: 'test@example.com',
        role: 'viewer',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test User');
      expect(result.data?.email).toBe('test@example.com');
      expect(result.data?.role).toBe('viewer');
    });

    it('should reject invalid input', () => {
      const result = createUser({
        name: '',
        email: 'test@example.com',
        role: 'viewer',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name is required');
    });
  });

  describe('getUserById', () => {
    it('should retrieve an existing user', () => {
      const createResult = createUser({
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
      });

      const getResult = getUserById(createResult.data!.id);
      expect(getResult.success).toBe(true);
      expect(getResult.data?.name).toBe('Test User');
    });

    it('should return error for non-existent user', () => {
      const result = getUserById('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user properties', () => {
      const createResult = createUser({
        name: 'Original Name',
        email: 'original@example.com',
        role: 'viewer',
      });

      const updateResult = updateUser(createResult.data!.id, {
        name: 'Updated Name',
        role: 'editor',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.name).toBe('Updated Name');
      expect(updateResult.data?.role).toBe('editor');
      expect(updateResult.data?.email).toBe('original@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', () => {
      const createResult = createUser({
        name: 'To Delete',
        email: 'delete@example.com',
        role: 'viewer',
      });

      const deleteResult = deleteUser(createResult.data!.id);
      expect(deleteResult.success).toBe(true);

      const getResult = getUserById(createResult.data!.id);
      expect(getResult.success).toBe(false);
    });
  });

  describe('listUsers', () => {
    it('should return all users', () => {
      createUser({ name: 'User One', email: 'one@example.com', role: 'viewer' });
      createUser({ name: 'User Two', email: 'two@example.com', role: 'editor' });

      const result = listUsers();
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
    });
  });
});

describe('Formatting Functions', () => {
  const mockUser: User = {
    id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-02T00:00:00Z'),
  };

  it('formatUserForDisplay should format correctly', () => {
    const output = formatUserForDisplay(mockUser);
    expect(output).toContain('User: Test User');
    expect(output).toContain('Email: test@example.com');
    expect(output).toContain('Role: admin');
  });

  it('formatUserForLog should format correctly', () => {
    const output = formatUserForLog(mockUser);
    expect(output).toContain('[USER LOG]');
    expect(output).toContain('name=Test User');
    expect(output).toContain('email=test@example.com');
  });

  it('formatUserForExport should format correctly', () => {
    const output = formatUserForExport(mockUser);
    expect(output).toContain('--- USER EXPORT ---');
    expect(output).toContain('"name","Test User"');
  });
});
