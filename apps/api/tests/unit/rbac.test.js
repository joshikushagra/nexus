import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import { restrictTo } from "../../middleware/authMiddleware.js";

describe("RBAC Middleware (restrictTo)", () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("should allow access if user has the required role", () => {
    req.user.role = "admin";
    const middleware = restrictTo("admin", "founder");
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should deny access if user role is not in the allowed list", () => {
    req.user.role = "developer";
    const middleware = restrictTo("admin", "founder");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it("should deny access if no user is present on request", () => {
    req.user = null;
    const middleware = restrictTo("admin");
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
