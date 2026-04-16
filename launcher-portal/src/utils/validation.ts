import { z } from "zod";

// --------------------
// REGEX
// --------------------
export const urlRegex = /^(www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
export const versionRegex = /^\d+(\.\d+)*$/;

// --------------------
// SCHEMAS
// --------------------
export const appSchema = z.object({
  name: z.string().min(1, "App name is required"),
  url: z
    .string()
    .regex(
      urlRegex,
      "URL must start with www. and be valid (e.g., www.example.com)",
    ),
  version: z.string().optional().or(z.literal("")),
});

export const versionSchema = z.object({
  version: z
    .string()
    .regex(versionRegex, "Invalid version format (e.g., 1.0.0)"),
  url: z
    .string()
    .regex(
      urlRegex,
      "URL must start with www. and be valid (e.g., www.example.com)",
    ),
});

// --------------------
// HELPERS
// --------------------
export const getErrorMessage = (error: any, fallback: string) => {
  if (error?.response?.data?.message) {
    return Array.isArray(error.response.data.message)
      ? error.response.data.message[0]
      : error.response.data.message;
  }
  return fallback;
};
