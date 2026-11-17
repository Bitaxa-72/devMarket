import { useOutletContext } from 'react-router-dom';
import { Advantages } from '../components/Advantages';
import { Catalog } from '../components/Catalog';
import { Faq } from '../components/Faq';
import { HeroSlider } from '../components/HeroSlider';
import { News } from '../components/News';
import { Projects } from '../components/Projects';

export function HomePage() {
  const { addToCart, onOpenContacts } = useOutletContext();

  return (
    <main>
      <HeroSlider onOpenContacts={onOpenContacts} />
      <Catalog onAddToCart={addToCart} />
      <Projects onOpenContacts={onOpenContacts} />
      <Advantages />
      <News />
      <Faq onOpenContacts={onOpenContacts} />
    </main>
  );
}
