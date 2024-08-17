import { getAllTasks } from "@/lib/actions/tasks";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function POST(req: Request, res: Response) {
  const { origin } = new URL(req.url);
  const body = req.body;
  console.log(body);
  if (body) {
    console.log("refetching...");
    revalidateTag("tasks");
    revalidatePath("/");
    await getAllTasks();
  }
  return Response.json({ message: "refetch task hello" });
}
