/**
 * User Service Module
 * 
 * TRAINING NOTE: This file contains intentional code duplication.
 * Use Cursor's tab completion to identify and refactor the duplicated patterns.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'viewer';
}

// Simulated database
const users: Map<string, User> = new Map();

// DUPLICATION TARGET #1: These validation functions have repeated patterns
export function validateUserName(name: string): { valid: boolean; error?: string } {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { valid: false, error: 'Name contains invalid characters' };
  }
  return { valid: true };
}

export function validateUserEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  if (email.length < 5) {
    return { valid: false, error: 'Email must be at least 5 characters' };
  }
  if (email.length > 255) {
    return { valid: false, error: 'Email must be less than 255 characters' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Email format is invalid' };
  }
  return { valid: true };
}

export function validateUserRole(role: string): { valid: boolean; error?: string } {
  if (!role) {
    return { valid: false, error: 'Role is required' };
  }
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return { valid: false, error: 'Role must be admin, editor, or viewer' };
  }
  return { valid: true };
}

// DUPLICATION TARGET #2: CRUD operations with similar error handling patterns
export function createUser(input: CreateUserInput): { success: boolean; data?: User; error?: string } {
  try {
    const nameValidation = validateUserName(input.name);
    if (!nameValidation.valid) {
      return { success: false, error: nameValidation.error };
    }

    const emailValidation = validateUserEmail(input.email);
    if (!emailValidation.valid) {
      return { success: false, error: emailValidation.error };
    }

    const roleValidation = validateUserRole(input.role);
    if (!roleValidation.valid) {
      return { success: false, error: roleValidation.error };
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const user: User = {
      id,
      name: input.name,
      email: input.email,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };

    users.set(id, user);
    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: 'Failed to create user' };
  }
}

export function getUserById(id: string): { success: boolean; data?: User; error?: string } {
  try {
    if (!id) {
      return { success: false, error: 'User ID is required' };
    }

    const user = users.get(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: 'Failed to get user' };
  }
}

export function updateUser(id: string, input: UpdateUserInput): { success: boolean; data?: User; error?: string } {
  try {
    if (!id) {
      return { success: false, error: 'User ID is required' };
    }

    const user = users.get(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (input.name !== undefined) {
      const nameValidation = validateUserName(input.name);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.error };
      }
      user.name = input.name;
    }

    if (input.email !== undefined) {
      const emailValidation = validateUserEmail(input.email);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }
      user.email = input.email;
    }

    if (input.role !== undefined) {
      const roleValidation = validateUserRole(input.role);
      if (!roleValidation.valid) {
        return { success: false, error: roleValidation.error };
      }
      user.role = input.role;
    }

    user.updatedAt = new Date();
    users.set(id, user);
    return { success: true, data: user };
  } catch (err) {
    return { success: false, error: 'Failed to update user' };
  }
}

export function deleteUser(id: string): { success: boolean; error?: string } {
  try {
    if (!id) {
      return { success: false, error: 'User ID is required' };
    }

    const user = users.get(id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    users.delete(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete user' };
  }
}

export function listUsers(): { success: boolean; data?: User[]; error?: string } {
  try {
    return { success: true, data: Array.from(users.values()) };
  } catch (err) {
    return { success: false, error: 'Failed to list users' };
  }
}

// DUPLICATION TARGET #3: These formatting functions share common structure
export function formatUserForDisplay(user: User): string {
  const lines: string[] = [];
  lines.push('='.repeat(40));
  lines.push(`User: ${user.name}`);
  lines.push('-'.repeat(40));
  lines.push(`ID: ${user.id}`);
  lines.push(`Email: ${user.email}`);
  lines.push(`Role: ${user.role}`);
  lines.push(`Created: ${user.createdAt.toISOString()}`);
  lines.push(`Updated: ${user.updatedAt.toISOString()}`);
  lines.push('='.repeat(40));
  return lines.join('\n');
}

export function formatUserForLog(user: User): string {
  const lines: string[] = [];
  lines.push('[USER LOG]');
  lines.push('-'.repeat(30));
  lines.push(`id=${user.id}`);
  lines.push(`name=${user.name}`);
  lines.push(`email=${user.email}`);
  lines.push(`role=${user.role}`);
  lines.push(`created=${user.createdAt.toISOString()}`);
  lines.push(`updated=${user.updatedAt.toISOString()}`);
  lines.push('-'.repeat(30));
  return lines.join('\n');
}

export function formatUserForExport(user: User): string {
  const lines: string[] = [];
  lines.push('--- USER EXPORT ---');
  lines.push(`"id","${user.id}"`);
  lines.push(`"name","${user.name}"`);
  lines.push(`"email","${user.email}"`);
  lines.push(`"role","${user.role}"`);
  lines.push(`"created","${user.createdAt.toISOString()}"`);
  lines.push(`"updated","${user.updatedAt.toISOString()}"`);
  lines.push('--- END EXPORT ---');
  return lines.join('\n');
}

// Clear all users (for testing)
export function clearUsers(): void {
  users.clear();
}
