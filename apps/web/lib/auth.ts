"use server";

import { redirect } from "next/navigation";
import { BACKEND_URL } from "./constants";
import { FormState, LoginFormSchema, SignupFormSchema } from "./type";
import { createSession, deleteSession } from "./session";
import { revalidatePath } from "next/cache";

export async function signUp(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationFields = await SignupFormSchema.safeParseAsync({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationFields.success) {
    return {
      error: validationFields.error.flatten().fieldErrors,
    };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationFields.data),
  });

  if (!response.ok) {
    return {
      message:
        response.status === 409
          ? "The user is already existed!"
          : response.statusText,
    };
  }

  return redirect("/auth/signin");
}

export async function signIn(
  state: FormState,
  formData: FormData,
): Promise<FormState> {
  const validationFields = await LoginFormSchema.safeParseAsync({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validationFields.success) {
    return {
      error: validationFields.error.flatten().fieldErrors,
    };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationFields.data),
  });

  if (!response.ok) {
    return {
      message:
        response.status === 401 ? "Invalid Credentials!" : response.statusText,
    };
  }

  const result = await response.json();
  //TODO: Create the session for authenticated User
  await createSession({
    user: {
      id: result.id,
      name: result.name,
    },
    accessToken: result.accessToken,
  });

  redirect("/");
}

export async function signOut() {
  await deleteSession();
  revalidatePath("/", "layout"); // Invalidates root layout cache
  redirect("/"); // Sends user to home page
}
