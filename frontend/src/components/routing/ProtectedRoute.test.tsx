import { describe, it, beforeEach, expect } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "./ProtectedRoute";
import { authStore } from "../../store/auth";

const renderWithRouter = (ui: React.ReactNode, initialEntries = ["/"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/auth/login" element={<div>Login Page</div>} />
        <Route path="/secure" element={ui} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authStore.setState({ accessToken: null, refreshToken: null, user: null });
  });

  it("redirects anonymous user to login", () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
      ["/secure"],
    );
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("allows seller when role matches", () => {
    authStore.setState({
      accessToken: "abc",
      refreshToken: "ref",
      user: { id: 1, email: "seller@test.com", dorm_id: 1, role: "seller" },
    });

    renderWithRouter(
      <ProtectedRoute role="seller">
        <div>Seller Secret</div>
      </ProtectedRoute>,
      ["/secure"],
    );

    expect(screen.getByText("Seller Secret")).toBeInTheDocument();
  });
});

