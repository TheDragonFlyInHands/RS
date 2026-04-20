export const offersData = [
  { id: 1, title: "Сбербанк: Кредит наличными", desc: "Ставка от 14.9%, до 5 млн руб. без справок о доходах.", category: "credit", city: "moscow", date: "2024-05-10" },
  { id: 2, title: "Тинькофф: Карта Платинум", desc: "Бесплатное обслуживание, кэшбэк до 30% у партнёров.", category: "card", city: "all", date: "2024-05-18" },
  { id: 3, title: "ВТБ: Ипотека с господдержкой", desc: "От 6% годовых, первоначальный взнос от 15%.", category: "mortgage", city: "moscow", date: "2024-04-20" },
  { id: 4, title: "Альфа-Банк: Вклад «Максимум»", desc: "До 16% годовых, срок от 3 месяцев. Капитализация.", category: "deposit", city: "spb", date: "2024-05-12" },
  { id: 5, title: "Газпромбанк: Кредит на авто", desc: "От 12.5%, без КАСКО и скрытых комиссий.", category: "credit", city: "kazan", date: "2024-03-05" },
  { id: 6, title: "Совкомбанк: Карта Халва", desc: "Рассрочка 0% до 12 месяцев в 200 000+ магазинах.", category: "card", city: "all", date: "2024-05-20" },
  { id: 7, title: "Россельхозбанк: Ипотека для села", desc: "От 3%, до 12 млн руб. на покупку или строительство.", category: "mortgage", city: "novosibirsk", date: "2024-02-14" },
  { id: 8, title: "Открытие: Вклад «Накопительный»", desc: "Пополнение без ограничений, ставка 15.5%.", category: "deposit", city: "moscow", date: "2024-05-01" },
  { id: 9, title: "Ингосстрах: КАСКО онлайн", desc: "Расчёт за 2 минуты, скидка 10% при оплате картой.", category: "insurance", city: "ekaterinburg", date: "2024-05-22" },
  { id: 10, title: "Райффайзен: Кредитная карта", desc: "111 дней без процентов, лимит до 1 млн руб.", category: "card", city: "spb", date: "2024-04-10" },
  { id: 11, title: "МКБ: Вклад «Выгодный»", desc: "Фиксированная ставка 15.8% на 6 месяцев.", category: "deposit", city: "krasnodar", date: "2024-05-15" },
  { id: 12, title: "Дом.РФ: Семейная ипотека", desc: "От 5.5% для семей с детьми. Быстрое одобрение.", category: "mortgage", city: "rostov", date: "2024-05-25" },
  { id: 13, title: "Почта Банк: Кредит пенсионерам", desc: "Специальные условия для пенсионеров, ставка от 12.9%.", category: "credit", city: "nizhny", date: "2024-05-08" },
  { id: 14, title: "Уралсиб: Автокредит", desc: "Без первого взноса, решение за 15 минут.", category: "credit", city: "ufa", date: "2024-04-28" },
  { id: 15, title: "Росгосстрах: ОСАГО онлайн", desc: "Оформление за 5 минут, рассрочка 0%.", category: "insurance", city: "vladivostok", date: "2024-05-19" }
];

export const cityNames = { 
  moscow: "Москва", spb: "Санкт-Петербург", kazan: "Казань", novosibirsk: "Новосибирск",
  ekaterinburg: "Екатеринбург", krasnodar: "Краснодар", nizhny: "Нижний Новгород",
  rostov: "Ростов-на-Дону", ufa: "Уфа", vladivostok: "Владивосток", all: "Все города"
};

export const categories = [
  { value: 'all', label: '📂 Все категории' },
  { value: 'credit', label: 'Кредиты' },
  { value: 'deposit', label: 'Вклады' },
  { value: 'card', label: 'Карты' },
  { value: 'mortgage', label: 'Ипотека' },
  { value: 'insurance', label: 'Страхование' }
];

export const cities = [
  { value: 'all', label: '🌍 Все города' },
  { value: 'moscow', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kazan', label: 'Казань' },
  { value: 'novosibirsk', label: 'Новосибирск' },
  { value: 'ekaterinburg', label: 'Екатеринбург' },
  { value: 'krasnodar', label: 'Краснодар' },
  { value: 'nizhny', label: 'Нижний Новгород' },
  { value: 'rostov', label: 'Ростов-на-Дону' },
  { value: 'ufa', label: 'Уфа' },
  { value: 'vladivostok', label: 'Владивосток' }
];