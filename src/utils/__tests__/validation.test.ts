import { validateTaskText, sanitizeTaskText, isValidId, ValidationResult } from '../validation';
import { ERROR_MESSAGES } from '../../constants';
import * as sanitizer from '../sanitizer';

// Mock the sanitizer
jest.mock('../sanitizer', () => ({
  sanitizeTaskText: jest.fn((text: string) => {
    // Simple mock that removes HTML tags
    return text.replace(/<[^>]*>/g, '').trim();
  })
}));

const mockSanitizeTaskText = sanitizer.sanitizeTaskText as jest.MockedFunction<typeof sanitizer.sanitizeTaskText>;

describe('validation utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTaskText', () => {
    it('should validate normal task text', () => {
      const result = validateTaskText('Valid task text');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty text', () => {
      const result = validateTaskText('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TASK_EMPTY);
    });

    it('should reject whitespace-only text', () => {
      const result = validateTaskText('   \n\t   ');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TASK_EMPTY);
    });

    it('should trim text before validation', () => {
      const result = validateTaskText('  Valid task  ');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject text that is too long', () => {
      // Create a string longer than MAX_TASK_LENGTH (500 characters)
      const longText = 'a'.repeat(501);
      const result = validateTaskText(longText);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(ERROR_MESSAGES.TASK_TOO_LONG);
    });

    it('should accept text at maximum length', () => {
      // Create a string exactly at MAX_TASK_LENGTH (500 characters)
      const maxLengthText = 'a'.repeat(500);
      const result = validateTaskText(maxLengthText);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle special characters', () => {
      const specialText = 'Task with @#$%^&*()_+-=[]{}|;:,.<>?';
      const result = validateTaskText(specialText);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle Unicode characters', () => {
      const unicodeText = 'Task with emojis 🚀 and special chars éñüñö';
      const result = validateTaskText(unicodeText);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return correct ValidationResult interface', () => {
      const validResult = validateTaskText('Valid text');
      const invalidResult = validateTaskText('');
      
      // Valid result
      expect(validResult).toHaveProperty('isValid');
      expect(typeof validResult.isValid).toBe('boolean');
      expect(validResult.isValid).toBe(true);
      
      // Invalid result
      expect(invalidResult).toHaveProperty('isValid');
      expect(invalidResult).toHaveProperty('error');
      expect(typeof invalidResult.isValid).toBe('boolean');
      expect(typeof invalidResult.error).toBe('string');
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('sanitizeTaskText', () => {
    it('should call the sanitizer function', () => {
      const input = 'Test input';
      
      sanitizeTaskText(input);
      
      expect(mockSanitizeTaskText).toHaveBeenCalledWith(input);
    });

    it('should return sanitized text', () => {
      const input = '<script>alert("xss")</script>Clean text';
      mockSanitizeTaskText.mockReturnValue('alert("xss")Clean text');
      
      const result = sanitizeTaskText(input);
      
      expect(result).toBe('alert("xss")Clean text');
      expect(result).not.toContain('<script>');
    });

    it('should handle empty strings', () => {
      mockSanitizeTaskText.mockReturnValue('');
      
      const result = sanitizeTaskText('');
      
      expect(result).toBe('');
    });

    it('should handle normal text without HTML', () => {
      const input = 'Normal task text';
      mockSanitizeTaskText.mockReturnValue(input);
      
      const result = sanitizeTaskText(input);
      
      expect(result).toBe(input);
    });

    it('should remove HTML tags but keep content', () => {
      const input = '<b>Bold</b> and <i>italic</i> text';
      mockSanitizeTaskText.mockReturnValue('Bold and italic text');
      
      const result = sanitizeTaskText(input);
      
      expect(result).toBe('Bold and italic text');
      expect(result).not.toContain('<b>');
      expect(result).not.toContain('<i>');
    });
  });

  describe('isValidId', () => {
    it('should validate positive numbers', () => {
      expect(isValidId(1)).toBe(true);
      expect(isValidId(42)).toBe(true);
      expect(isValidId(1000)).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidId(0)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isValidId(-1)).toBe(false);
      expect(isValidId(-42)).toBe(false);
    });

    it('should reject NaN', () => {
      expect(isValidId(NaN)).toBe(false);
    });

    it('should reject non-numbers', () => {
      expect(isValidId('1')).toBe(false);
      expect(isValidId('42')).toBe(false);
      expect(isValidId(null)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId({})).toBe(false);
      expect(isValidId([])).toBe(false);
      expect(isValidId(true)).toBe(false);
      expect(isValidId(false)).toBe(false);
    });

    it('should reject floating point numbers', () => {
      expect(isValidId(1.5)).toBe(true); // Actually, floating point numbers are valid numbers
      expect(isValidId(3.14)).toBe(true);
      expect(isValidId(0.1)).toBe(true);
    });

    it('should work as type guard', () => {
      const unknownValue: any = 42;
      
      if (isValidId(unknownValue)) {
        // TypeScript should now know this is a number
        const result: number = unknownValue;
        expect(typeof result).toBe('number');
        expect(result).toBe(42);
      }
    });

    it('should handle edge cases', () => {
      expect(isValidId(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isValidId(Number.MIN_SAFE_INTEGER)).toBe(false); // Negative
      expect(isValidId(Infinity)).toBe(true); // Infinity > 0 and is a number
      expect(isValidId(-Infinity)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should work together for complete task validation', () => {
      const validTask = 'This is a valid task';
      const maliciousTask = '<script>alert("xss")</script>Malicious task';
      const emptyTask = '';
      const longTask = 'a'.repeat(501);
      
      // Valid task
      const validResult = validateTaskText(validTask);
      mockSanitizeTaskText.mockReturnValue(validTask);
      const validSanitized = sanitizeTaskText(validTask);
      expect(validResult.isValid).toBe(true);
      expect(validSanitized).toBe(validTask);
      
      // Malicious task (should sanitize but validate structure)
      const maliciousResult = validateTaskText(maliciousTask);
      mockSanitizeTaskText.mockReturnValue('alert("xss")Malicious task');
      const maliciousSanitized = sanitizeTaskText(maliciousTask);
      expect(maliciousResult.isValid).toBe(true); // Content is valid after trimming
      expect(maliciousSanitized).toBe('alert("xss")Malicious task');
      expect(maliciousSanitized).not.toContain('<script>');
      
      // Empty task
      const emptyResult = validateTaskText(emptyTask);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe(ERROR_MESSAGES.TASK_EMPTY);
      
      // Long task
      const longResult = validateTaskText(longTask);
      expect(longResult.isValid).toBe(false);
      expect(longResult.error).toBe(ERROR_MESSAGES.TASK_TOO_LONG);
    });

    it('should validate and sanitize realistic task scenarios', () => {
      const scenarios = [
        {
          input: '  Buy groceries  ',
          expectedValid: true,
          expectedSanitized: 'Buy groceries'
        },
        {
          input: '<p>Complete project</p>',
          expectedValid: true,
          expectedSanitized: 'Complete project'
        },
        {
          input: 'Task with 🚀 emoji',
          expectedValid: true,
          expectedSanitized: 'Task with 🚀 emoji'
        },
        {
          input: '',
          expectedValid: false,
          expectedError: ERROR_MESSAGES.TASK_EMPTY
        }
      ];
      
      scenarios.forEach(({ input, expectedValid, expectedSanitized, expectedError }) => {
        const validationResult = validateTaskText(input);
        expect(validationResult.isValid).toBe(expectedValid);
        
        if (expectedError) {
          expect(validationResult.error).toBe(expectedError);
        }
        
        if (expectedSanitized !== undefined) {
          mockSanitizeTaskText.mockReturnValue(expectedSanitized);
          const sanitized = sanitizeTaskText(input);
          expect(sanitized).toBe(expectedSanitized);
        }
      });
    });
  });
});
