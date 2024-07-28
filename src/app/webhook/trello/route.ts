import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const body = request.body;
  console.log(body);
  if (body) revalidateTag("tasks");
  return Response.json({ message: "refetch task" });
}
