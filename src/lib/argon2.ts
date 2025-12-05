import { hash, verify, type Options } from "@node-rs/argon2";

const opts: Options = {
  // learned how to do this from lucia auth
  // google ~"lucia auth set up argon2 with minimum configuration"
  // MU: this is good BECAUSE it is slow
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  const result = await hash(password, opts);
  return result;
}

// defining the fn this way bc this is how better auth wants you to have your hashing fns
export async function verifyPassword(data: { password: string; hash: string }) {
  const { password, hash } = data; // destructure

  const result = await verify(hash, password, opts);
  return result;
}
