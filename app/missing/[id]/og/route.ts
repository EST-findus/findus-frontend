import { getMissingPersonById } from "@/lib/data";
import { renderOgImage } from "@/lib/shareImage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getMissingPersonById(id);
  if (!person) return new Response("Not found", { status: 404 });
  return renderOgImage(person);
}
