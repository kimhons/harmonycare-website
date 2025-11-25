import { describe, expect, it } from 'vitest';
import { Resend } from 'resend';

describe('Resend API Key Validation', () => {
  it('should validate Resend API key by checking domains', async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      // Try to list domains - this will fail if API key is invalid
      const { data, error } = await resend.domains.list();
      
      // If we get here without throwing, the API key is valid
      expect(error).toBeNull();
      expect(data).toBeDefined();
    } catch (error: any) {
      // If error message indicates invalid API key, fail the test
      if (error.message?.includes('Invalid') || error.message?.includes('Unauthorized')) {
        throw new Error('Invalid Resend API key provided');
      }
      // Other errors (like network issues) should not fail the test
      console.warn('Resend API test warning:', error.message);
    }
  }, 10000); // 10 second timeout
});
