# Coding Principles

Coding principles are guidelines for writing software that's maintainable, scalable, and understandable, focusing on simplicity, modularity, and avoiding repetition.

---

## Core Principles & Acronyms

### SOLID Principles
A set of five design principles for object-oriented programming:

1. **Single Responsibility**: A class should have only one reason to change.
2. **Open/Closed**: Software entities should be open for extension, but closed for modification.
3. **Liskov Substitution**: Subtypes must be substitutable for their base types.
4. **Interface Segregation**: Clients shouldn't be forced to depend on interfaces they don't use.
5. **Dependency Inversion**: Depend on abstractions, not concretions.

### DRY (Don't Repeat Yourself)
Avoid duplicating code; abstract common logic into reusable functions, classes, or components.

### KISS (Keep It Simple, Stupid)
Simplicity is key; avoid unnecessary complexity. If a solution is complex, look for a simpler approach.

### YAGNI (You Ain't Gonna Need It)
Don't add functionality until it's actually needed. Avoid over-engineering.

---

## Key Practices

### Separation of Concerns (SoC)
Divide code into distinct sections, each handling a specific job.
- Laravel: Controllers handle HTTP, Services handle business logic, Models handle data
- React: Components handle UI, Hooks handle logic, Utils handle helpers

### Abstraction
Hide complex implementation details behind a simple interface.
- Use interfaces/abstractions for services
- Create clean public APIs for modules

### Testability
Write code that's easy to test automatically to catch bugs early.
- Dependency injection makes classes testable
- Pure functions are inherently testable

### Refactoring
Continuously improve code structure without changing external behavior.
- Look for code smells (long methods, large classes, duplicated code)
- Apply design patterns when appropriate

### Meaningful Naming
Use clear, descriptive names for variables, functions, and classes.
- `calculateTotalPrice()` instead of `calc()`
- `UserRepository` instead of `UserDB`
- `isEligibleForDiscount` instead of `check()`

### Composition over Inheritance
Favor building objects from smaller components (composition) rather than deep inheritance.
- React: Use custom hooks for reusable logic
- Laravel: Use traits and service classes

### Defensive Programming
Handle errors and edge cases gracefully.
- Validate input at system boundaries
- Use guard clauses for early returns
- Log errors with context

---

## Why They Matter

| Benefit | Description |
|---------|-------------|
| **Maintainability** | Easier for you and others to understand, fix, and update |
| **Scalability** | Code can grow and adapt to new requirements without breaking |
| **Collaboration** | Standard practices make teamwork smoother |
| **Reduced Bugs** | Simpler, well-structured code is inherently less buggy |

---

## Application in This Project

### Laravel
- Models: Single responsibility, meaningful relationships
- Controllers: Thin, delegate to services
- Services: Business logic, dependency injection
- Form Requests: Validation rules, authorization

### React
- Components: Small, focused, reusable
- Hooks: Custom hooks for shared logic
- Types: TypeScript for type safety
- Naming: Descriptive, consistent with codebase

### Database
- migrations: Reversible changes
- Relationships: Clear, documented
- Indexes: Performance optimization
