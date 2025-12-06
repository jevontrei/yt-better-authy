import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getValidDomains() {
  const domains = ["gmail.com", "yahoo.com", "outlook.com"];

  if (process.env.NODE_ENV === "development") {
    domains.push("example.com");
  }
  return domains;
}

export function normaliseName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ") // "bom   tom" -> "bob tom"
    .replace(/[^a-zA-Z\s'-]/g, "") // replace any characters with "" if they're not alphabet or "-", e.g. bob!45tom -> bobtom
    .replace(/\b\w/g, (char) => char.toUpperCase()); // bob tom -> Bob Tom
}
