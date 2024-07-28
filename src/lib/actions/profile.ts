"use server";

import { AccessTokenForm } from "@/app/(Dashboard)/settings/schema";
import { createSupabaseServerClient } from "../supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "../types";
const SERVER_URL = process.env.SERVER_URL;

export const updateProfile = async ({ value }: { value: AccessTokenForm }) => {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(
      `${SERVER_URL}/profile?user_id=${data.session?.user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify(value),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating profile");
    } else return await response.json();
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async () => {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(
      `${SERVER_URL}/profile?user_id=${data.session?.user.id}`,
      {
        method: "GET",
        headers: {
          Authorization: access_token,
        },
      }
    );
    if (!response.ok) {
      return null;
    }
    const profile: Profile = await response.json();
    return profile;
  } catch (error) {
    console.log(error);
  }
};
