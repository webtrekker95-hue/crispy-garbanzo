import { decideRedirect } from "@/lib/route-guard";

describe("decideRedirect", () => {
  it("allows an ADMIN into /admin routes", () => {
    expect(decideRedirect("/admin/dashboard", "ADMIN")).toBeNull();
  });

  it("redirects a STUDENT away from /admin routes", () => {
    expect(decideRedirect("/admin/dashboard", "STUDENT")).toBe("/login");
  });

  it("redirects an unauthenticated visitor (no role) away from /admin routes", () => {
    expect(decideRedirect("/admin/dashboard", undefined)).toBe("/login");
  });

  it("allows a STUDENT into /student routes", () => {
    expect(decideRedirect("/student/dashboard", "STUDENT")).toBeNull();
  });

  it("redirects an ADMIN away from /student routes (role, not just login state)", () => {
    expect(decideRedirect("/student/dashboard", "ADMIN")).toBe("/login");
  });

  it("redirects an unauthenticated visitor away from /student routes", () => {
    expect(decideRedirect("/student/dashboard", undefined)).toBe("/login");
  });

  it("does not gate unrelated paths", () => {
    expect(decideRedirect("/packages", undefined)).toBeNull();
    expect(decideRedirect("/booking", "STUDENT")).toBeNull();
  });

  it("matches nested sub-paths, not just the exact segment", () => {
    expect(decideRedirect("/admin/bookings/123", "STUDENT")).toBe("/login");
    expect(decideRedirect("/student/learn/mod-1/lesson-2", "ADMIN")).toBe("/login");
  });
});
