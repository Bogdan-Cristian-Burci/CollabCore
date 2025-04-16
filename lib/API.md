# API Architecture Overview

## Access Control Architecture

### Authentication and Authorization

- Authentication is handled by Next-Auth with JWT tokens
- All permissions are enforced at the API level, not through client-side permission checks
- Access tokens are automatically included in API requests via the fetch interceptor
- The backend server is the single source of truth for permissions

### Role-Based Access Control

- User permissions come from their assigned roles and direct permission overrides
- The API enforces permission checks before returning sensitive data or allowing operations
- Permission checks on UI elements should be considered visual guidance only, not security controls

## API Response Handling

### Response Format

API responses follow these standard formats:

1. For collection endpoints:
   ```json
   {
     "roles": [
       { "id": 1, "name": "admin", "display_name": "Administrator" }
     ],
     "meta": { "total": 10, "per_page": 15 },
     "links": { "first": "...", "last": "..." }
   }
   ```

2. For single resource endpoints:
   ```json
   {
     "role": { "id": 1, "name": "admin", "display_name": "Administrator" }
   }
   ```

### API Implementation Notes

- All API requests go through the fetch interceptor which adds auth tokens
- Direct fetch is used for specific endpoints where needed for reliable response handling
- Client components should never implement security checks - all security is enforced at the API level