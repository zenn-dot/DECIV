// Centralized translations: key|English|Русский|Қазақша  (lists use ";")
const RAW = `
tag|Know before you commit.|Знайте до того, как возьмётесь.|Міндеттенбес бұрын біліңіз.
sub|Decision Intelligence for Commerce|Decision Intelligence for Commerce|Decision Intelligence for Commerce
hero|Analyze the real economics of a deal before you accept it.|Проанализируйте реальную экономику сделки до того, как принять её.|Мәмілені қабылдамас бұрын оның нақты экономикасын талдаңыз.
demo|Try Demo|Демо|Демо
create|Create Account|Создать аккаунт|Аккаунт ашу
login|Log in|Войти|Кіру
logout|Log out|Выйти|Шығу
reg|Register|Регистрация|Тіркелу
how|How it works|Как это работает|Бұл қалай жұмыс істейді
h1|Input;Analyze;Decide|Данные;Анализ;Решение|Деректер;Талдау;Шешім
hs|Enter or upload a deal;Code calculates true cost and margin;ACCEPT, NEGOTIATE or REJECT|Введите или загрузите сделку;Код считает себестоимость и маржу;ПРИНЯТЬ, ОБСУДИТЬ или ОТКЛОНИТЬ|Мәмілені енгізіңіз немесе жүктеңіз;Код шынайы шығын мен маржаны есептейді;ҚАБЫЛДАУ, КЕЛІСУ немесе БАС ТАРТУ
built|Built for commercial teams|Для коммерческих команд|Коммерциялық командаларға арналған
seg|Custom manufacturing;B2B services;Trading;Procurement;Custom production|Заказное производство;B2B-услуги;Торговля;Закупки;Производство под заказ|Тапсырыс бойынша өндіріс;B2B қызметтері;Сауда;Сатып алу;Тапсырыспен жасау
prT|Pricing|Тарифы|Тарифтер
prFree|Free;Limited analyses;Basic scenarios;AI analysis|Free;Ограниченное число анализов;Базовые сценарии;ИИ-анализ|Free;Шектеулі талдау;Базалық сценарийлер;ЖИ талдауы
prPro|Pro — coming soon;Unlimited analyses;Advanced risk intelligence;Historical benchmarks;Advanced scenarios;Team collaboration|Pro — скоро;Безлимитные анализы;Расширенная аналитика рисков;Исторические бенчмарки;Расширенные сценарии;Командная работа|Pro — жақында;Шексіз талдау;Кеңейтілген тәуекел аналитикасы;Тарихи бенчмарктар;Кеңейтілген сценарийлер;Командалық жұмыс
prBiz|Business — coming soon;Multiple users;Company analytics;API;ERP integrations;Advanced AI|Business — скоро;Несколько пользователей;Аналитика компании;API;Интеграции с ERP;Расширенный ИИ|Business — жақында;Бірнеше пайдаланушы;Компания аналитикасы;API;ERP интеграциялары;Кеңейтілген ЖИ
email|Email|Email|Email
pw|Password (min. 6)|Пароль (мин. 6)|Құпиясөз (кемінде 6)
haveAcc|Already have an account?|Уже есть аккаунт?|Аккаунтыңыз бар ма?
noAcc|No account yet?|Нет аккаунта?|Аккаунт жоқ па?
e_cred|Wrong email or password.|Неверный email или пароль.|Email немесе құпиясөз қате.
e_exists|This email is already registered.|Этот email уже зарегистрирован.|Бұл email тіркелген.
e_fields|Check the fields: name, valid email and password of 6+ characters.|Проверьте поля: имя, корректный email и пароль от 6 символов.|Өрістерді тексеріңіз: аты, дұрыс email және кемінде 6 таңбалы құпиясөз.
nav|Dashboard;New Analysis;Orders;Analytics;Profile & Settings|Дашборд;Новый анализ;Заказы;Аналитика;Профиль и настройки|Басқару панелі;Жаңа талдау;Тапсырыстар;Аналитика;Профиль және баптаулар
dashT|Decision Dashboard|Панель решений|Шешімдер панелі
k|Orders analyzed;At risk;Potential loss prevented;Average margin|Проанализировано заказов;В зоне риска;Предотвращённые потери;Средняя маржа
recent|Recent analyses|Недавние анализы|Соңғы талдаулар
demoLbl|Demo data|Демо-данные|Демо деректер
calcNote|AI extracts and explains. Code calculates the financials.|ИИ извлекает данные и объясняет. Финансы считает код.|ЖИ деректерді алып, түсіндіреді. Қаржыны код есептейді.
newT|Analyze a new deal|Анализ новой сделки|Жаңа мәмілені талдау
newS|Know the economics before you commit.|Узнайте экономику до того, как возьмётесь.|Міндеттенбес бұрын экономиканы біліңіз.
srcL|Paste deal text (quotation, email, invoice…)|Вставьте текст сделки (КП, письмо, счёт…)|Мәміле мәтінін қойыңыз (ұсыныс, хат, шот…)
upl|Upload file (PDF, image, CSV, TXT)|Загрузить файл (PDF, фото, CSV, TXT)|Файл жүктеу (PDF, сурет, CSV, TXT)
extract|Extract with AI|Извлечь с помощью ИИ|ЖИ арқылы алу
tryDeal|Try Demo Deal|Демо-сделка|Демо мәміле
analyze|Analyze Deal|Проанализировать сделку|Мәмілені талдау
fl|Customer;Product / Service;Quantity;Selling price (total);Materials;Labor;Logistics;Overhead;Taxes / fees;Other costs;Payment terms (days);Deadline (days);Target margin, %;Currency|Клиент;Продукт / услуга;Количество;Цена продажи (всего);Материалы;Труд;Логистика;Накладные;Налоги / сборы;Прочие расходы;Условия оплаты (дни);Срок (дни);Целевая маржа, %;Валюта|Тапсырыс беруші;Өнім / қызмет;Саны;Сату бағасы (жалпы);Материалдар;Еңбек;Логистика;Үстеме шығындар;Салық / алымдар;Өзге шығындар;Төлем шарттары (күн);Мерзімі (күн);Мақсатты маржа, %;Валюта
e_empty|Fill in the deal or paste text first.|Сначала заполните сделку или вставьте текст.|Алдымен мәмілені толтырыңыз немесе мәтін қойыңыз.
e_badNum|Enter valid numbers; selling price must be above zero.|Введите корректные числа; цена продажи должна быть больше нуля.|Дұрыс сандарды енгізіңіз; сату бағасы нөлден жоғары болуы керек.
e_neg|Negative values are not allowed.|Отрицательные значения недопустимы.|Теріс мәндерге рұқсат жоқ.
e_net|Network error. Check your connection and try again.|Ошибка сети. Проверьте подключение и повторите.|Желі қатесі. Байланысты тексеріп, қайталаңыз.
e_ai|AI is currently unavailable. You can continue manually; calculations still work.|ИИ сейчас недоступен. Можно продолжить вручную; расчёты работают.|ЖИ қазір қолжетімсіз. Қолмен жалғастыруға болады; есептеулер жұмыс істейді.
e_file|Unsupported or too large file. Use PDF, image, CSV or TXT up to 4 MB.|Неподдерживаемый или слишком большой файл. Используйте PDF, фото, CSV или TXT до 4 МБ.|Қолдау көрсетілмейтін немесе тым үлкен файл. 4 МБ дейінгі PDF, сурет, CSV немесе TXT қолданыңыз.
missing|Some information is missing. Please check the fields.|Часть информации отсутствует. Проверьте поля.|Кейбір ақпарат жоқ. Өрістерді тексеріңіз.
extracted|Data extracted. Review and edit before analysis.|Данные извлечены. Проверьте и при необходимости исправьте.|Деректер алынды. Талдау алдында тексеріп, түзетіңіз.
ld|Reading deal information…;Extracting commercial data…;Calculating true cost…;Evaluating risks…;Preparing recommendation…|Читаем информацию о сделке…;Извлекаем коммерческие данные…;Считаем реальную себестоимость…;Оцениваем риски…;Готовим рекомендацию…|Мәміле ақпараты оқылуда…;Коммерциялық деректер алынуда…;Шынайы шығын есептелуде…;Тәуекелдер бағалануда…;Ұсыныс дайындалуда…
ACCEPT|ACCEPT|ПРИНЯТЬ|ҚАБЫЛДАУ
NEGOTIATE|NEGOTIATE|ОБСУДИТЬ|КЕЛІСУ
REJECT|REJECT|ОТКЛОНИТЬ|БАС ТАРТУ
v_ACCEPT|This deal meets your target margin.|Сделка достигает целевой маржи.|Мәміле мақсатты маржаға жетеді.
v_NEGOTIATE|Do not accept this deal under the current conditions.|Не принимайте сделку на текущих условиях.|Бұл тапсырысты қазіргі шарттармен қабылдау тиімсіз.
v_REJECT|Reject: reasonable changes will not make it profitable.|Отклонить: разумные изменения не сделают её прибыльной.|Бас тарту: ақылға қонымды өзгерістер оны пайдалы етпейді.
rm|Revenue;True cost;Profit;Margin;Risk-adjusted margin;Potential loss|Выручка;Себестоимость;Прибыль;Маржа;Маржа с учётом рисков;Потенциальный убыток|Түсім;Шынайы шығын;Пайда;Маржа;Тәуекелмен түзетілген маржа;Ықтимал шығын
why|Why?|Почему?|Неге?
chg|What should change?|Что нужно изменить?|Не өзгерту керек?
or|OR|ИЛИ|НЕМЕСЕ
rec|Increase price by;Reduce material cost by;Reduce logistics cost by;Extend deadline by|Повысить цену на;Снизить стоимость материалов на;Снизить стоимость логистики на;Продлить срок на|Бағаны көтеру;Материал құнын азайту;Логистика құнын азайту;Мерзімді ұзарту
days|days|дн.|күн
none|No changes needed.|Изменения не требуются.|Өзгеріс қажет емес.
rkPay|Payment terms of {0} days create cash-flow pressure.|Отсрочка оплаты {0} дн. создаёт кассовое давление.|{0} күндік төлем мерзімі ақша ағынына қысым жасайды.
rkDl|Short deadline may require additional labor capacity.|Сжатый срок может потребовать дополнительных трудовых ресурсов.|Тығыз мерзім қосымша еңбек ресурсын қажет етуі мүмкін.
rkNone|No risks detected in the provided data.|В предоставленных данных риски не обнаружены.|Берілген деректерде тәуекел анықталмады.
aiExp|AI explanation|Пояснение ИИ|ЖИ түсіндірмесі
aiLoad|AI is writing the explanation…|ИИ готовит пояснение…|ЖИ түсініктеме дайындауда…
whatif|What if?|Что если?|Егер…?
save|Save analysis|Сохранить анализ|Талдауды сақтау
saved|Saved ✓|Сохранено ✓|Сақталды ✓
back|Back|Назад|Артқа
sl|Selling price;Materials;Labor;Logistics;Quantity;Deadline (days)|Цена продажи;Материалы;Труд;Логистика;Количество;Срок (дни)|Сату бағасы;Материалдар;Еңбек;Логистика;Саны;Мерзімі (күн)
apply|Apply Recommended Scenario|Применить рекомендованный сценарий|Ұсынылған сценарийді қолдану
reset|Reset|Сбросить|Қалпына келтіру
now|Current margin|Текущая маржа|Ағымдағы маржа
aft|After changes|После изменений|Өзгерістен кейін
saveScn|Save scenario as analysis|Сохранить сценарий как анализ|Сценарийді талдау ретінде сақтау
noRec|Even a 30% price increase is not enough.|Даже повышения цены на 30% недостаточно.|Бағаны 30%-ға көтеру де жеткіліксіз.
ordT|Orders|Заказы|Тапсырыстар
flt|All;Accept;Negotiate;Reject;At risk|Все;Принять;Обсудить;Отклонить;В зоне риска|Барлығы;Қабылдау;Келісу;Бас тарту;Тәуекелде
search|Search customer / deal|Поиск по клиенту / сделке|Клиент / мәміле бойынша іздеу
oh|Customer;Deal;Revenue;True cost;Profit;Margin;Decision;Date;Status|Клиент;Сделка;Выручка;Себестоимость;Прибыль;Маржа;Решение;Дата;Статус
st|OK;At risk|ОК;Риск|ОК;Тәуекел
noOrd|No saved analyses yet. Analyze a deal and save it.|Сохранённых анализов пока нет. Проанализируйте сделку и сохраните её.|Сақталған талдау әлі жоқ. Мәмілені талдап, сақтаңыз.
anT|Analytics|Аналитика|Аналитика
an|Average margin;Total analyzed revenue;Potential loss;Accepted deals;Negotiated deals;Rejected deals|Средняя маржа;Проанализированная выручка;Потенциальный убыток;Принятые сделки;Сделки на переговорах;Отклонённые сделки|Орташа маржа;Талданған түсім;Ықтимал шығын;Қабылданған мәмілелер;Келісілетін мәмілелер;Бас тартылған мәмілелер
topR|Most common risks|Частые риски|Жиі кездесетін тәуекелдер
trend|Margin trend|Динамика маржи|Маржа динамикасы
rn|Materials;Logistics;Payment terms;Deadline;Other|Материалы;Логистика;Условия оплаты;Срок;Прочее|Материалдар;Логистика;Төлем шарттары;Мерзім;Өзге
pfT|Profile & Settings|Профиль и настройки|Профиль және баптаулар
pf|Name;Company;Email;Role;Default currency;Target margin, %;Default taxes/fees, % of revenue;Default overhead;Max reasonable price increase, %;Material risk uplift, %;Logistics risk uplift, %;Financing rate, % per year;Language;Theme;Light;Dark;Use AI analysis|Имя;Компания;Email;Роль;Валюта по умолчанию;Целевая маржа, %;Налоги/сборы по умолчанию, % выручки;Накладные по умолчанию;Макс. разумное повышение цены, %;Надбавка за риск материалов, %;Надбавка за риск логистики, %;Ставка финансирования, % годовых;Язык;Тема;Светлая;Тёмная;Использовать ИИ-анализ|Аты;Компания;Email;Рөлі;Әдепкі валюта;Мақсатты маржа, %;Әдепкі салық/алымдар, % түсімнен;Әдепкі үстеме шығын;Бағаны көтерудің ақылға қонымды шегі, %;Материал тәуекелінің үстемесі, %;Логистика тәуекелінің үстемесі, %;Қаржыландыру мөлшерлемесі, % жылына;Тіл;Тақырып;Жарық;Қараңғы;ЖИ талдауын қолдану
savech|SAVE CHANGES|СОХРАНИТЬ ИЗМЕНЕНИЯ|ӨЗГЕРІСТЕРДІ САҚТАУ
ok|Saved|Сохранено|Сақталды
`;
export const LANGS = ['en', 'ru', 'kz'];
const D = { en: {}, ru: {}, kz: {} };
RAW.trim().split('\n').forEach(l => { const [k, a, b, c] = l.split('|'); D.en[k] = a; D.ru[k] = b; D.kz[k] = c; });
export let lang = 'ru';
export const setLang = l => { lang = l; };
export const t = k => D[lang][k] ?? D.en[k] ?? k;
export const tl = k => t(k).split(';');
