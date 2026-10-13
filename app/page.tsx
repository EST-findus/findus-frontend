import MissingPersonExplorer from "@/components/MissingPersonExplorer";
import { getMissingPersons } from "@/lib/data";

export default async function Home() {
  const persons = await getMissingPersons();

  return (
    <main>
      <MissingPersonExplorer persons={persons} />
    </main>
  );
}
