"use server";
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
    return { error: null };
  } catch (err) {
    // catch (err) catches EVERYTHING; so we need to check if it is an Error object or something totally different (anything can be "thrown")
    if (err instanceof Error) {
      return { error: "Oopsie! Something went wrong while registering" };
    }
    return { error: "Internal Server Error" };
  }
}
