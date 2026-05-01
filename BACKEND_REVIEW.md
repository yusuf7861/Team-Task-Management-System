# Backend Code Review — Full Flaw Trace

> **Project:** Team Task Management System — Spring Boot backend  
> **Package root:** `com.etharaai.taskmanager`  
> **Review date:** 2026-05-01  

---

## Table of Contents

1. [Critical Security Vulnerabilities](#1-critical-security-vulnerabilities)
2. [Authorization & Access-Control Flaws](#2-authorization--access-control-flaws)
3. [Missing Input Validation](#3-missing-input-validation)
4. [Architectural & Design Flaws](#4-architectural--design-flaws)
5. [Broken / Incorrect Code](#5-broken--incorrect-code)
6. [Configuration & Secrets Management](#6-configuration--secrets-management)
7. [Error Handling Deficiencies](#7-error-handling-deficiencies)
8. [Performance Issues](#8-performance-issues)
9. [Dead / Unreachable Code](#9-dead--unreachable-code)
10. [Missing Features](#10-missing-features)
11. [Dependency & Build Issues](#11-dependency--build-issues)
12. [Summary Table](#12-summary-table)

---

## 1. Critical Security Vulnerabilities

### 1.1 Plain-text password written to logs — `AdminInitializer.java`

**File:** `config/AdminInitializer.java`, lines 60 & 63

```java
// Line 60 — runs even when e-mail is sent successfully
log.info("Admin account created and email sent to {}, password: {}", adminEmail, randomPassword);

// Line 63 — fallback path when e-mail fails
log.info("Admin account created with email: {} and password: {}", adminEmail, randomPassword);
```

The generated plain-text admin password is written to the application log in **every** startup path. Logs are typically persisted, forwarded to log aggregators, or visible to developers who are not the admin. This is a **direct credential leak**.

**Fix:** Remove the password from both log statements. The email already delivers the credential; no logging is needed.

---

### 1.2 JWT logout is stateless-only — `AuthController.java`

**File:** `controller/AuthController.java`, lines 35–53

```java
@PostMapping("/logout")
public ResponseEntity<?> logout() {
    SecurityContextHolder.clearContext();       // only clears the in-memory context
    ResponseCookie cookie = ResponseCookie.from("jwt", "").maxAge(0)...build();
    ...
}
```

Calling `/logout` clears the server-side `SecurityContext` and expires the cookie, but a client using the `Authorization: Bearer <token>` header (supported by `JwtAuthenticationFilter`) is **not logged out**. The token remains valid until it expires.  
There is also **no JWT deny-list / revocation mechanism** anywhere in the codebase.

**Fix:** Implement a token revocation store (e.g., Redis set of invalidated JTIs) and check it in `JwtAuthenticationFilter`.

---

### 1.3 Any registrant can self-assign the ADMIN role — `RegisterRequest.java` / `AuthService.java`

**File:** `dto/RegisterRequest.java`

```java
public record RegisterRequest(
    String name,
    String email,
    String password,
    Role role        // ← client-supplied field
) {}
```

**File:** `service/AuthService.java`, line 32

```java
var user = Users.builder()
    ...
    .role(request.role())   // ← blindly trusted
    .build();
```

A POST to `/api/auth/signup` with `"role": "ADMIN"` creates an admin account instantly. This is a **privilege escalation** on the public registration endpoint.

**Fix:** Hard-code the role to `Role.MEMBER` during self-registration and provide a separate admin-only endpoint to promote users.

---

### 1.4 Deleted or disabled users retain valid tokens — `JwtAuthenticationFilter.java`

**File:** `security/JwtAuthenticationFilter.java`, lines 55–73

```java
// Comment in the source confirms the intent:
// No DB lookup - purely JWT-based validation
if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {
    try {
        String email = jwtUtil.extractEmail(jwt);
        if (email != null && jwtUtil.validateToken(jwt, email)) {
            // sets authentication WITHOUT checking DB
        }
    }
}
```

If a user is deleted, banned, or has their role changed in the database after a token is issued, their original token continues to work until it expires (default 1 hour, configurable via `jwt.expiration`).

**Fix:** Either load the user from DB on each request (`AppUserDetailService` already exists), or reduce token TTL and implement revocation.

---

## 2. Authorization & Access-Control Flaws

### 2.1 Any user can update any task's status — `TaskController.java`

**File:** `controller/TaskController.java`, lines 36–39

```java
@PatchMapping("/{id}/status")
// No @PreAuthorize annotation
public ResponseEntity<TaskDto> updateTaskStatus(@PathVariable Long id, @RequestParam TaskStatus status) {
    return ResponseEntity.ok(taskService.updateTaskStatus(id, status));
}
```

`TaskService.updateTaskStatus` also has no ownership check:

```java
public TaskDto updateTaskStatus(Long taskId, TaskStatus newStatus) {
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new RuntimeException("Task not found"));
    task.setStatus(newStatus);   // no check: is the caller the assignee?
    ...
}
```

A `MEMBER` can change the status of tasks assigned to other members, or set them to any value including `DONE`.

**Fix:** Verify that `currentUser.id == task.assignedTo.id || currentUser.role == ADMIN` before allowing the update.

---

### 2.2 Any authenticated user can list all users — `UserController.java`

**File:** `controller/UserController.java`, lines 21–33

```java
@GetMapping
// No @PreAuthorize
public ResponseEntity<List<UserDto>> getAllUsers() { ... }
```

The response includes every user's email, name, role, and creation timestamp. A regular `MEMBER` can enumerate all accounts.

**Fix:** Add `@PreAuthorize("hasRole('ADMIN')")`.

---

### 2.3 Any authenticated user can view all projects and tasks — `ProjectController.java` / `TaskController.java`

`GET /api/projects` and `GET /api/tasks/project/{projectId}` have no role restriction and no membership check. A `MEMBER` not assigned to a project can still read its full task list.

**Fix:** Filter by project membership or restrict list endpoints to `ADMIN`.

---

### 2.4 Duplicate `@PreAuthorize` on both controller and service — `ProjectController.java` / `ProjectService.java`

**Controller** (`ProjectController.java`, line 20):
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ProjectDto> createProject(...) { ... }
```

**Service** (`ProjectService.java`, line 25):
```java
@PreAuthorize("hasRole('ADMIN')")
public ProjectDto createProject(...) { ... }
```

The annotation is duplicated without benefit. This is also misleading: if the controller annotation is removed, the service annotation would still fire, but service-level `@PreAuthorize` only works when the method is called through a Spring proxy (i.e., from outside the bean). Internal calls would bypass it.

**Fix:** Keep authorization in one canonical location, preferably the controller or a dedicated security layer.

---

## 3. Missing Input Validation

### 3.1 No validation dependency in `pom.xml`

`spring-boot-starter-validation` is **not** listed as a dependency. Without it, `@Valid`, `@NotNull`, `@Email`, `@Size`, etc., annotations on request bodies are silently ignored.

```xml
<!-- Missing from pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

### 3.2 No constraints on `RegisterRequest` / `AuthRequest`

**`RegisterRequest`** accepts `null` for all fields. The resulting NullPointerException surfaces as an unformatted 500 error.

```java
public record RegisterRequest(
    String name,      // can be null/blank
    String email,     // no @Email check
    String password,  // no minimum length
    Role role
) {}
```

Same issue in `AuthRequest`.

**Fix:** Add `@NotBlank`, `@Email`, `@Size` constraints and `@Valid` on controller parameters.

---

### 3.3 No `@Valid` on any controller request body

None of the four controllers use `@Valid` or `@Validated` on `@RequestBody` parameters, so even if constraints were added to DTOs, they would never be enforced.

---

### 3.4 Task creation allows past due dates

`TaskDto.dueDate` is a `LocalDate` with no `@FutureOrPresent` constraint. A task can be created already overdue.

---

## 4. Architectural & Design Flaws

### 4.1 Controller directly injects `Repository` — `UserController.java` / `DashboardController.java`

**`UserController.java`**, line 19:
```java
private final UserRepository userRepository;  // bypasses service layer
```

**`DashboardController.java`**, lines 8–9:
```java
private final TaskRepository taskRepository;
private final UserRepository userRepository;
```

This violates the layered architecture: business logic is embedded in controllers, making it untestable and non-reusable.

**Fix:** Create `UserService` and `DashboardService` and move all logic there.

---

### 4.2 Raw `RuntimeException` used for all business errors

Every service method throws `new RuntimeException("...")`:

- `AuthService`: `throw new RuntimeException("Email already exists")`
- `ProjectService`: `throw new RuntimeException("Project not found")`
- `TaskService`: `throw new RuntimeException("Task not found")`
- `DashboardController`: `throw new RuntimeException("User not found")`

`RuntimeException` has no semantic meaning. The `GlobalAccessHandler` catches it and returns `500 INTERNAL_SERVER_ERROR`, even for client errors like "User not found" (which should be `404`) or "Email already exists" (which should be `409`).

**Fix:** Define custom exception hierarchy (`ResourceNotFoundException`, `ConflictException`, `ForbiddenException`) and add corresponding `@ExceptionHandler` methods to `GlobalAccessHandler`.

---

### 4.3 `GlobalAccessHandler` only catches `Exception.class`

**File:** `exception/GlobalAccessHandler.java`

```java
@ExceptionHandler(Exception.class)   // only one handler
public ResponseEntity<ApiError> handleGeneralException(Exception e) { ... }
```

All exceptions — validation errors (`MethodArgumentNotValidException`), authentication failures (`AuthenticationException`), authorization denials (`AccessDeniedException`), bad requests — return `500 INTERNAL_SERVER_ERROR` with a raw exception message that may expose internals to clients.

---

### 4.4 `CustomAccessDeniedHandler` is not registered in `SecurityConfig`

**File:** `security/CustomAccessDeniedHandler.java` — defined as a Spring `@Component`.  
**File:** `security/SecurityConfig.java` — never references `CustomAccessDeniedHandler`.

```java
// SecurityConfig.securityFilterChain() — missing:
.exceptionHandling(ex -> ex.accessDeniedHandler(customAccessDeniedHandler))
```

As a result, Spring Security uses its default `AccessDeniedHandler`, which returns a plain HTML 403 page instead of the JSON response the handler was designed to produce.

---

### 4.5 No pagination on list endpoints

- `GET /api/projects` — loads **all** projects
- `GET /api/tasks/project/{projectId}` — loads **all** tasks for a project
- `GET /api/users` — loads **all** users

These are unbounded queries. As data grows, they will cause out-of-memory errors and slow responses.

**Fix:** Use `Pageable` and `Page<T>` in the repository/service/controller layers.

---

### 4.6 Dashboard `totalTasks` for non-admin uses `List.size()` instead of a count query

**File:** `controller/DashboardController.java`, line 44

```java
totalTasks = taskRepository.findByAssignedToId(userId).size();
```

This fetches all task entities from the DB into memory just to count them. The correct approach is `taskRepository.countByAssignedToId(userId)`, which issues a `SELECT COUNT(*)`.

---

## 5. Broken / Incorrect Code

### 5.1 Wrong `ObjectMapper` import — `Config.java` and `CustomAccessDeniedHandler.java`

**`Config.java`**, line 17:
```java
import tools.jackson.databind.ObjectMapper;  // ← non-standard, wrong package
```

**`CustomAccessDeniedHandler.java`**, line 5:
```java
import tools.jackson.databind.ObjectMapper;  // ← same wrong package
```

The correct import is `com.fasterxml.jackson.databind.ObjectMapper`. The `tools.jackson` package belongs to Jackson 3.x alpha / Woodstox internal APIs and is not on the standard Spring Boot classpath. This will cause a `ClassNotFoundException` at runtime.

---

### 5.2 `Config.objectMapper()` missing `@Bean` annotation

**File:** `config/Config.java`, line 66:

```java
public ObjectMapper objectMapper() {   // ← no @Bean
    return new ObjectMapper();
}
```

`CustomAccessDeniedHandler` injects `ObjectMapper` via constructor:

```java
private final ObjectMapper objectMapper;
```

Because the method is not annotated `@Bean`, Spring never registers the `ObjectMapper`. Combined with the wrong import (§5.1), this will cause an `UnsatisfiedDependencyException` / `NoSuchBeanDefinitionException` at startup.

---

### 5.3 No `application.properties` / `application.yml` exists

The `src/main/resources` directory does not exist in the repository. Spring Boot requires this file (or equivalent) for property sources. The following `@Value`-injected properties have **no source**:

| Property | Injected in |
|---|---|
| `${jwt.secret}` | `JwtUtil` |
| `${app.admin.email}` | `AdminInitializer` |
| `${spring.mail.host}` | `Config` |
| `${spring.mail.username}` | `Config` |
| `${spring.mail.password}` | `Config` |
| DB datasource (`spring.datasource.*`) | Spring Boot auto-config |

Without these properties, the application **fails to start**. They must currently be supplied only via environment variables (the `.env` file), which is fragile and undocumented.

---

### 5.4 `.env` file is committed to the repository

The `.gitignore` does **not** include `.env`, meaning the environment file (which presumably contains the JWT secret, DB password, mail credentials, etc.) is tracked by git and visible to every repository contributor / fork.

---

## 6. Configuration & Secrets Management

### 6.1 CORS origin is hardcoded — `SecurityConfig.java`

```java
config.setAllowedOrigins(List.of("http://localhost:5173"));
```

This will break in any non-local deployment. It should be externalised:

```java
@Value("${app.cors.allowed-origins}")
private List<String> allowedOrigins;
```

---

### 6.2 Mail port is hardcoded — `Config.java`

```java
mailSender.setPort(587);
```

Hardcoded SMTP port prevents easy reconfiguration for environments that use port 465 (SMTPS) or a custom relay.

---

### 6.3 Admin password complexity is insufficient — `AdminInitializer.java`

```java
String chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
// 8 characters, no special characters
```

The generated password is only 8 characters with no symbols. Most security policies require at least 12–16 characters including special characters.

---

## 7. Error Handling Deficiencies

| Scenario | Expected HTTP Status | Actual HTTP Status |
|---|---|---|
| User not found (`RuntimeException`) | 404 Not Found | 500 Internal Server Error |
| Email already exists (`RuntimeException`) | 409 Conflict | 500 Internal Server Error |
| Project not found (`RuntimeException`) | 404 Not Found | 500 Internal Server Error |
| Assignee not found (`RuntimeException`) | 400 Bad Request | 500 Internal Server Error |
| `AccessDeniedException` (403) | 403 Forbidden | HTML 403 page (handler not wired) |
| Bean injection failure at startup | — | Application crash |

---

## 8. Performance Issues

| Location | Problem |
|---|---|
| `DashboardController` — non-admin `totalTasks` | Loads full entity list into memory to call `.size()` |
| `GET /api/projects` | Unbounded query — no pagination |
| `GET /api/tasks/project/{id}` | Unbounded query — no pagination |
| `GET /api/users` | Unbounded query — no pagination |
| Task / Project entities with `LAZY` associations | MapStruct mapper accesses `task.project.name` and `task.assignedTo.name` outside a transaction, risking `LazyInitializationException` |

---

## 9. Dead / Unreachable Code

| Location | Unused code |
|---|---|
| `Role.getAuthorities()` | Method declared but never called; `Users` entity generates authorities inline |
| `TaskRepository.countByDueDateBeforeAndStatusNot` | Declared but never called (the dashboard uses `countByDueDateNotNullAndDueDateBeforeAndStatusNot`) |
| `ProjectRepository.findByCreatedById` | Declared but never called in any service or controller |
| `Config.objectMapper()` | Missing `@Bean`; never injected anywhere that would work |
| `spring-boot-starter-mail` dependency | Used, but the `JavaMailSender` bean is manually constructed in `Config.java` — the auto-configuration starter is therefore redundant |

---

## 10. Missing Features

| Feature | Impact |
|---|---|
| No token refresh endpoint | Users are forcibly logged out after token expiry with no seamless refresh |
| No password change endpoint | Admin credentials emailed at startup can never be changed via the API |
| No user delete/update endpoint | Users can only be created, never deactivated |
| No task update endpoint (full) | Only status can be patched; title, description, due date, assignee cannot be changed |
| No project update/delete endpoint | Projects are immutable once created |
| No email verification on self-registration | Anyone can register with any email address |
| No rate limiting on `/api/auth/login` | Brute-force attacks on login are unrestricted |

---

## 11. Dependency & Build Issues

### 11.1 Spring Boot parent version `4.0.6` does not exist

**File:** `pom.xml`, line 10:

```xml
<version>4.0.6</version>
```

As of the review date, Spring Boot's stable release line is **3.x**. `4.0.x` is not a publicly released version. This will fail to resolve from Maven Central and prevent the project from building unless `4.0.6` is a custom/internal version.

---

### 11.2 `spring-boot-starter-validation` is absent

As noted in §3.1, the JSR-303 validation starter is missing. Without it, `@Valid` on request bodies has no effect.

---

### 11.3 `lombok-mapstruct-binding` version `0.2.0` is outdated

The annotation processor binding is pinned to `0.2.0`. The latest stable release is `0.2.0` for Lombok < 1.18.16, but for Lombok `1.18.36` (used here), the binding should be verified for compatibility.

---

## 12. Summary Table

| # | Severity | Category | Location | Description |
|---|---|---|---|---|
| 1.1 | 🔴 Critical | Security | `AdminInitializer.java:60,63` | Admin password logged in plain text |
| 1.2 | 🔴 Critical | Security | `AuthController.java:34` | JWT logout does not invalidate token |
| 1.3 | 🔴 Critical | Security | `RegisterRequest.java`, `AuthService.java:32` | Self-registration allows `ADMIN` role selection |
| 1.4 | 🔴 Critical | Security | `JwtAuthenticationFilter.java:55` | No DB check; deleted users retain valid tokens |
| 2.1 | 🔴 Critical | Authorization | `TaskController.java:36` | Any user can update any task's status |
| 2.2 | 🟠 High | Authorization | `UserController.java:21` | Any user can list all accounts |
| 2.3 | 🟠 High | Authorization | `ProjectController.java:25`, `TaskController.java:27` | No project membership check |
| 2.4 | 🟡 Medium | Design | `ProjectController.java:20`, `ProjectService.java:25` | Duplicate `@PreAuthorize` |
| 3.1 | 🟠 High | Validation | `pom.xml` | Validation starter missing |
| 3.2 | 🟠 High | Validation | `RegisterRequest.java`, `AuthRequest.java` | No field constraints |
| 3.3 | 🟠 High | Validation | All controllers | No `@Valid` on request bodies |
| 3.4 | 🟡 Medium | Validation | `TaskDto.java` | Past due dates accepted |
| 4.1 | 🟠 High | Architecture | `UserController.java`, `DashboardController.java` | Repository injected directly into controller |
| 4.2 | 🟠 High | Architecture | All services | Raw `RuntimeException` for business errors |
| 4.3 | 🟠 High | Error Handling | `GlobalAccessHandler.java` | Only catches `Exception.class` → always 500 |
| 4.4 | 🟡 Medium | Config | `SecurityConfig.java` | `CustomAccessDeniedHandler` not wired |
| 4.5 | 🟡 Medium | Performance | All list endpoints | No pagination |
| 4.6 | 🟡 Medium | Performance | `DashboardController.java:44` | `findAll().size()` for count |
| 5.1 | 🔴 Critical | Broken code | `Config.java:17`, `CustomAccessDeniedHandler.java:5` | Wrong `ObjectMapper` import (app fails to start) |
| 5.2 | 🔴 Critical | Broken code | `Config.java:66` | `objectMapper()` missing `@Bean` |
| 5.3 | 🔴 Critical | Config | `src/main/resources` | No `application.properties` — app cannot start |
| 5.4 | 🔴 Critical | Security | `.gitignore` | `.env` committed to repository |
| 6.1 | 🟡 Medium | Config | `SecurityConfig.java:77` | CORS origin hardcoded to `localhost` |
| 6.2 | 🟡 Medium | Config | `Config.java:57` | SMTP port hardcoded |
| 6.3 | 🟡 Medium | Security | `AdminInitializer.java:68` | Weak generated password (8 chars, no symbols) |
| 8.x | 🟡 Medium | Performance | Various | Unbounded list queries + potential `LazyInitializationException` |
| 9.x | 🟢 Low | Code quality | Various | Dead/unreachable code |
| 10.x | 🟡 Medium | Completeness | — | Missing token refresh, password change, rate limiting |
| 11.1 | 🔴 Critical | Build | `pom.xml:10` | Non-existent Spring Boot version `4.0.6` |
| 11.2 | 🟠 High | Build | `pom.xml` | `spring-boot-starter-validation` missing |

---

> **Legend:** 🔴 Critical — will cause a security breach or prevent the application from starting/running correctly. 🟠 High — significant bug or vulnerability that must be fixed before production. 🟡 Medium — important quality or maintainability issue. 🟢 Low — minor code hygiene issue.
