import { z } from "zod";

export const SignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  passwordConfirmation: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords don't match",
  path: ["passwordConfirmation"],
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Lightweight cross-module event types for realtime updates
export type ChatEvent =
  | { type: "message:new"; payload: { message: {
      id: string;
      content: string;
      userId: string;
      isDeleted: boolean;
      isEdited: boolean;
      createdAt: string | Date;
      updatedAt: string | Date;
      user: { id: string; name: string; image: string | null };
    } } }
  | { type: "message:edit"; payload: { id: string; content: string } }
  | { type: "message:delete"; payload: { id: string } }
  | { type: "typing:start"; payload: { user: { id: string; name: string; image: string | null } } }
  | { type: "typing:stop"; payload: { userId: string } };