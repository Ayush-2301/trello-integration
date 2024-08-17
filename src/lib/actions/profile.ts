"use server";

import { AccessTokenForm } from "@/app/(Dashboard)/settings/schema";
import { createSupabaseServerClient } from "../supabase/server";
import { redirect } from "next/navigation";
import { Profile } from "../types";
import { revalidateTag } from "next/cache";
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
    } else {
      revalidateTag("profile");
      return await response.json();
    }
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
        cache: "no-cache",
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

export const updateTrelloConfig = async ({
  accesstoken,
  boardTitle,
  boardId,
  previousAccesstoken,
}: {
  accesstoken: string;
  boardTitle: string;
  boardId: string;
  previousAccesstoken: string;
}) => {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");

    const response = await fetch(
      `${SERVER_URL}/updateTrelloConfig?user_id=${data.session?.user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify({
          accesstoken,
          boardTitle,
          boardId,
          previousAccesstoken,
        }),
      }
    );
    if (!response.ok) {
      return { message: "error" };
    }
    revalidateTag("profile");
    const res = await response.json();
    console.log(res);
    return { message: "Success" };
  } catch (error) {
    console.log(error);
  }
};

export const deleteTrelloConfig = async ({
  previousAccesstoken,
  boardId,
}: {
  previousAccesstoken: string;
  boardId: string;
}) => {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(
      `${SERVER_URL}/deleteTrelloConfig?user_id=${data.session?.user.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token,
        },
        body: JSON.stringify({
          boardId,
          previousAccesstoken,
        }),
      }
    );
    if (!response.ok) {
      const res = await response.json();
      console.log(res);
      return { message: "error" };
    }
    revalidateTag("profile");
    const res = await response.json();
    console.log(res);
    return { message: "Success" };
  } catch (error) {}
};
