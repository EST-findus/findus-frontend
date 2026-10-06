import Footer from "@/components/Footer";
import MissingPersonExplorer from "@/components/MissingPersonExplorer";
import { getMissingPersons } from "@/lib/data";

export default async function Home() {
  const persons = await getMissingPersons();

  return (
    <>
      <MissingPersonExplorer persons={persons} />
      <Footer />
    </>
  );
}
