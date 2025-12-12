"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";

// "use server" runs this code on the server

// `formData: FormData` is a type annotation
// what is the FormData type?
//     Claude: "FormData is a built-in browser API type for form data."
//     MDN: "The FormData interface provides a way to construct a set of key/value pairs representing form fields and their values"
// the FormData type is an "interface"? what is that?
//     geeksforgeeks: "TypeScript interfaces define the structure of objects by specifying property types and method signatures"
//     w3schools: interfaces are for objects only, unlike aliases
//     typescriptlang: "Used to describe the shape of objects, and can be extended by others."
//     typescriptlang: "Almost everything in JavaScript is an object and `interface` is built to match their runtime behavior."
export async function signUpEmailAction(formData: FormData) {
  // this fn always returns an "error" variable, but on success it is equal to null
  // so we can do this in register-form.tsx:
  //     `const { error } = await signUpEmailAction(formData);`
  //     and then `if (error)` etc
  //
  // better auth requires a name for registration
  const name = String(formData.get("name"));
  // don't use toast here bc of "use server"; just return
  if (!name) return { error: "Please enter your name" };

  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your passwrd" };

  try {
    await auth.api.signUpEmail({
      // this DID have a typescript error here but we put `input: false` in additionalFields in auth.ts
      // The error was bc we aren't passing the role here; but we don't need to because we're using @default(USER) in the schema
      body: {
        name,
        email,
        password,
      },
    });

    return { error: null };
  } catch (err) {
    // catch (err) catches EVERYTHING; so we need to check if it is an Error/APIError (etc) object/type or something totally different (anything can be "thrown")
    // this is for type safety; this is a type guard
    // and it enables us to safely use err.message
    // APIError is from "better-auth/api", NOT from "better-auth"
    if (err instanceof APIError) {
      console.log(err.body);
      // typecast(?)
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";
      // he found this message / error code by logging the error and looking; i found "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
      // console.log(err);
      switch (errCode) {
        // this case is like if you wanna be super secure and you don't want them to know that the email is taken; just give a generic msg
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          return { error: "Oops! Something went wrong. Please try again." };
        default:
          return { error: err.message };
      }
    }
    return { error: "Internal Server Error" };
  }
}
