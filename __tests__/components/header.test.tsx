import { render, screen } from "@testing-library/react"
import { Header } from "@/components/header"
import { useAuth } from "@/hooks/use-auth"
import jest from "jest"

jest.mock("@/hooks/use-auth")
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe("Header", () => {
  it("renders Momento AI title", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "123", displayName: "Test User", email: "test@example.com" } as any,
      userData: { promptCount: 2 } as any,
      loading: false,
      error: null,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      canSendPrompt: jest.fn(() => true),
      getRemainingPrompts: jest.fn(() => 3),
      getTimeUntilReset: jest.fn(() => 0),
    })

    render(<Header />)

    expect(screen.getByText("Momento AI")).toBeInTheDocument()
    expect(screen.getByText("Everything Starts with a Project")).toBeInTheDocument()
  })

  it("displays remaining prompts count", () => {
    mockUseAuth.mockReturnValue({
      user: { uid: "123", displayName: "Test User", email: "test@example.com" } as any,
      userData: { promptCount: 2 } as any,
      loading: false,
      error: null,
      signInWithGoogle: jest.fn(),
      logout: jest.fn(),
      canSendPrompt: jest.fn(() => true),
      getRemainingPrompts: jest.fn(() => 3),
      getTimeUntilReset: jest.fn(() => 0),
    })

    render(<Header />)

    expect(screen.getByText("Prompts: 3/5")).toBeInTheDocument()
  })
})
