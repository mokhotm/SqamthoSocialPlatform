# Project Rules

## Development and Testing Guidelines

1.  **Verification After Feature Completion**  
    Every time a feature is completed, run the application to verify if it works before proceeding.

2.  **Code Quality Checks**  
    Check for syntax, TypeScript, compilation errors in the entire workspace after all fixes are completed.

3.  **Build Verification**  
    Every time an issue is resolved or errors fixed, always build the solution to check if there are no more issues or errors. If there are, fix them. Repeat until the solution is clean.

4.  **No Mock Data Policy**  
    Thou shall not use/implement mock data or fallback data. Delete/remove mock data and all references to mock data and fallback data.

5.  **File Management**  
    Never create a file when there is already an existing file with the same functionality. Fix errors instead of creating a new file.

6.  **Test After Implementation**  
    When a feature is completed, run tests to ensure that the feature is implemented correctly and is working correctly.

7.  **Database Schema Analysis**  
    When implementing a feature that uses database data, first run the database-schema-analyzer script to check the relevant tables and columns to determine how the SQL query should be implemented with joins etc. This will ensure that the data that we get is correct.

8.  **API Server Management**  
    Always check if the API server is running before trying to run it. If the server is running, stop all instances and rerun.

9.  **Database Object Verification**  
    Make sure we are using correct database objects by running a database-schema-analyzer. If one does not exist in the codebase, create a new database-schema-analyzer. This is to ensure that we are saving data correctly in the database and retrieving data correctly with properly written queries.

## Implementation Practices

- All code must be thoroughly tested before committing
- Follow the established project architecture and patterns
- Document any significant changes or fixes
- Always communicate complex changes with the team
- Keep performance considerations in mind when making changes

## API Development Guidelines

- Follow RESTful API design principles
- Properly handle errors and return appropriate HTTP status codes
- Implement logging for all API endpoints
- Ensure proper authentication and authorization
- Document all API endpoints and their parameters

## Database Guidelines

- Always use parameterized queries to prevent SQL injection
- Follow naming conventions for database objects
- Include appropriate indexes for frequently queried columns
- Use transactions for operations that modify multiple records
- Document any schema changes

## Front-end Guidelines

- Ensure responsive design works across different screen sizes
- Follow accessibility guidelines
- Maintain consistent styling according to the design system
- Optimize assets for performance
- Handle loading and error states properly
