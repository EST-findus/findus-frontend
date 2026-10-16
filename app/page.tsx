import HomeEntry from "@/components/HomeEntry";
import MissingPersonExplorer from "@/components/MissingPersonExplorer";
import { getMissingPersons } from "@/lib/data";

export default async function Home() {
  const persons = await getMissingPersons();

  return (
    <main>
      <HomeEntry><MissingPersonExplorer persons={persons} /></HomeEntry>
    </main>
  );
}
