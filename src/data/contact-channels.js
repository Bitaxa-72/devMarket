import gmailIcon from '../assets/contact-icons/gmail.svg';
import maxIcon from '../assets/contact-icons/max.svg';
import telegramIcon from '../assets/contact-icons/telegram.svg';
import whatsappIcon from '../assets/contact-icons/whatsapp.svg';

export const contactChannels = [
  { title: 'Telegram', description: 'Написать менеджеру', url: 'https://t.me/vitaly_development', icon: telegramIcon, color: '#26a5e4' },
  { title: 'MAX', description: 'Быстро задать вопрос', url: 'https://max.ru/u/f9LHodD0cOLxaNMMVcuOWuGlWa_LmUa_w52aRyo29sn2AKN-i_9Mu60ATy4', icon: maxIcon, color: '#471aff' },
  { title: 'Почта', description: 'Отправить подробное сообщение', url: 'mailto:vitaly.butenev@gmail.com', icon: gmailIcon, color: '#ea4335' },
  { title: 'WhatsApp', description: 'Обсудить задачу', url: 'https://wa.me/84769457149?s=p', icon: whatsappIcon, color: '#25d366' },
];
