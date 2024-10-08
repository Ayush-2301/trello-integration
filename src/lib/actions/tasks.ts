"use server";

import { redirect } from "next/navigation";
import { type Task } from "../types";

import { revalidateTag } from "next/cache";
import { TaskForm } from "@/app/(Dashboard)/(home)/schema";
import { createSupabaseServerClient } from "../supabase/server";
const SERVER_URL = process.env.SERVER_URL;
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;

export const getAllTasks = async () => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(
      `${SERVER_URL}/tasks?user_id=${data.session?.user.id}`,
      {
        method: "GET",
        next: {
          revalidate: 3600,
          tags: ["tasks"],
        },
      }
    );
    if (!response.ok) {
      const error: {
        error: string;
      } = await response.json();
      return error;
    } else {
      const tasks: Task[] = await response.json();
      return tasks;
    }
  } catch (error) {
    throw new Error("Error fetching tasks");
  }
};

export const getSingleTask = async ({ id }: { id: string }) => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(`${SERVER_URL}/tasks/?task_id=${id}`, {
      method: "GET",
      headers: {
        Authorization: access_token,
      },
      next: {
        revalidate: 3600,
        tags: ["tasks"],
      },
    });
    if (!response.ok) {
      const error: {
        error: string;
      } = await response.json();
      return error;
    } else {
      const x = await response.json();
      const task: Task[] = x;

      return task[0];
    }
  } catch (error) {
    throw new Error("Error fetching task");
  }
};

export const updateTask = async ({
  newTask,
  taskID,
}: {
  newTask: TaskForm;
  taskID: string;
}) => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const taskData = { task_id: taskID, ...newTask };

    const response = await fetch(`${SERVER_URL}/tasks`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token,
      },
      body: JSON.stringify([taskData]),
    });
    if (response.ok) {
      revalidateTag("tasks");
      const res: Task[] = await response.json();
      return res[0];
    }
  } catch {
    throw new Error("Error updating task");
  }
};

export const insertTask = async ({ newTask }: { newTask: TaskForm }) => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(`${SERVER_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: access_token,
      },
      body: JSON.stringify([newTask]),
    });
    if (!response.ok) {
      const error: {
        error: string;
      } = await response.json();
      return error;
    } else {
      revalidateTag("tasks");
      const res: Task[] = await response.json();
      return res[0];
    }
  } catch {
    throw new Error("Error inserting task");
  }
};

export const deleteTask = async ({ id }: { id: string }) => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(`${SERVER_URL}/tasks/?id=${id}`, {
      method: "DELETE",
      headers: {
        Authorization: access_token,
      },
    });
    if (!response.ok) {
      const error: {
        error: string;
      } = await response.json();
      return error;
    } else {
      revalidateTag("tasks");
      const res: Task[] = await response.json();
      return res[0];
    }
  } catch (error) {
    throw new Error("Error deleting the task");
  }
};

export const getAllTaskByWatchlistID = async ({
  watchlistID,
}: {
  watchlistID: string;
}) => {
  try {
    // const { access_token } = await getSession();
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    const access_token = data.session?.access_token;
    if (!access_token) redirect("/auth");
    const response = await fetch(
      `${SERVER_URL}/tasks/?watchlist_id=${watchlistID}`,
      {
        method: "GET",
        headers: {
          Authorization: access_token,
        },
        next: {
          revalidate: 3600,
          tags: ["tasks"],
        },
      }
    );
    if (!response.ok) {
      const error: {
        error: string;
      } = await response.json();
      return error;
    } else {
      const tasks: Task[] = await response.json();
      return tasks;
    }
  } catch (error) {
    throw new Error("Error fetching tasks");
  }
};

export const addTaskToTrello = async ({
  name,
  desc,
  access_token,
  list_id,
  taskid,
}: {
  name: string;
  desc: string;
  access_token: string;
  list_id: string;
  taskid: string;
}) => {
  try {
    const res = await fetch(`${SERVER_URL}/createCard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        desc,
        list_id,
        access_token,
        taskid,
      }),
    });
    console.log(res.url);
    if (res.ok) {
      revalidateTag("tasks");
      return await res.json();
    }
  } catch (error) {
    console.log(error);
  }
};
export const disconnectTaskFromTrello = async ({
  taskid,
}: {
  taskid: string;
}) => {
  try {
    const res = await fetch(`${SERVER_URL}/disconnect`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskid }),
    });
    if (res.ok) {
      revalidateTag("tasks");
      return await res.json();
    }
  } catch (error) {
    console.log(error);
  }
};

// export const connectTrello = async () => {
//   try {
//     const res = await fetch(
//       ` https://trello.com/1/authorize?expiration=never&scope=read,write,account&response_type=token&key=${TRELLO_API_KEY}`
//     );
//     console.log(res);
//     const token = await res.json();
//     console.log(token);
//   } catch (error) {}
// };
