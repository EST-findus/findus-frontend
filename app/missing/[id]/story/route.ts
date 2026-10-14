import { getMissingPersonById } from "@/lib/data";
import { renderStoryImage } from "@/lib/shareImage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getMissingPersonById(id);
  if (!person) return new Response("Not found", { status: 404 });
  return renderStoryImage(person, new URL(request.url).origin);
}
