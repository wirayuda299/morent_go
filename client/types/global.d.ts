export {};

// Create a type for the roles
export type Roles = 'admin' | 'common';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
