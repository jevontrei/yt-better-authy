"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { redirect } from "next/navigation";

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
export async function signInEmailAction(formData: FormData) {
  // this fn always returns an "error" variable, but on success it is equal to null
  // so we can do this in register-form.tsx:
  //     `const { error } = await signInEmailAction(formData);`
  //     and then `if (error)` etc
  //

  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your passwrd" };

  try {
    // const res = await auth.api.signInEmail({ // from manual method
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
      // asResponse: true,  // from manual method
    });

    // // ===========================================================================
    // // DON'T DELETE ME, but leave me commented out: THIS IS HOW YOU MANUALLY WORK WITH COOKIES
    // // NOTE: when working in server actions in next.js, you have to work with the cookies api to set the cookie; better auth has a plugin that'll do it for you in one line, but first, he's gonna show us how to do it manually

    // // Grab the cookie from the header
    // const setCookieHeader = res.headers.get("set-cookie");
    // // technically it could be null
    // if (setCookieHeader) {
    //   // create a map object of our cookie information?
    //   // parse the cookie and get all attributes
    //   const cookie = parseSetCookieHeader(setCookieHeader);
    //   const cookieStore = await cookies();

    //   // format it in a way that we need below/elsewhere
    //   const [key, cookieAttributes] = [...cookie.entries()][0];
    //   const value = cookieAttributes.value;
    //   // have to use brackets for this one because of the "-"
    //   const maxAge = cookieAttributes["max-age"];
    //   const path = cookieAttributes.path;
    //   const httpOnly = cookieAttributes.httponly;
    //   const sameSite = cookieAttributes.samesite;

    //   // have a gander
    //   console.log("value", value);
    //   console.log("maxAge", maxAge);
    //   console.log("path", path);
    //   console.log("httpOnly", httpOnly);
    //   console.log("sameSite", sameSite);

    //   // set cookie manually
    //   cookieStore.set(key, decodeURIComponent(value), {
    //     maxAge,
    //     path,
    //     httpOnly,
    //     sameSite,
    //   });
    // }
    // // ===========================================================================

    return { error: null };
  } catch (err) {
    // catch (err) catches EVERYTHING; so we need to check if it is an Error object or something totally different (anything can be "thrown")
    // APIError is from "better-auth/api", NOT from "better-auth"
    if (err instanceof APIError) {
      // 4:25:49 - we are making this more verbose, because what if you lose your verification email etc, how will you get a new link??
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "EMAIL_NOT_VERIFIED":
          // pass in a custom message (query param?) which we will catch ourselves in auth/verify/page.tsx
          redirect("/auth/verify?error=email_not_verified");
        default:
          return { error: err.message };
      }
    }
    return { error: "Internal Server Error" };
  }
}
