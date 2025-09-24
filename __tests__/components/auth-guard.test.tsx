import { render, screen } from "@testing-library/react"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/use-auth"
import jest from "jest" // Declare the jest variable

// Mock the useAuth hook
jest.mock("@/hooks/use-auth")
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe("AuthGuard", () => {
  it("shows loading spinner when loading", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: true,
      error: null,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      canSendPrompt: jest.fn(),
      getRemainingPrompts: jest.fn(),
      getTimeUntilReset: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("shows login modal when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userData: null,
      loading: false,
      error: null,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      canSendPrompt: jest.fn(),
      getRemainingPrompts: jest.fn(),
      getTimeUntilReset: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.getByText("Welcome to Momento AI")).toBeInTheDocument()
  })

  it("renders children when user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "123", email: "test@example.com" } as any,
      userData: null,
      loading: false,
      error: null,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      canSendPrompt: jest.fn(),
      getRemainingPrompts: jest.fn(),
      getTimeUntilReset: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>,
    )

    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })
})
