import { BadgeCheck, FileCheck2, Headphones, ShieldCheck } from 'lucide-react';

const trustItems = [
  { icon: FileCheck2, title: 'Работа по договору', text: 'Фиксируем этапы, стоимость и результат.' },
  { icon: ShieldCheck, title: 'Права у заказчика', text: 'Передаём исходники и доступы после оплаты.' },
  { icon: BadgeCheck, title: 'Прозрачный процесс', text: 'Показываем результат на каждом этапе.' },
  { icon: Headphones, title: 'Поддержка запуска', text: 'Помогаем команде освоить новый продукт.' },
];

export function TrustBand() {
  return (
    <section className="trust-band" aria-label="Гарантии работы">
      <div className="trust-band__container">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return <article className="trust-band__item" key={item.title}><Icon size={28} strokeWidth={1.8} /><div><h2>{item.title}</h2><p>{item.text}</p></div></article>;
        })}
      </div>
    </section>
  );
}
