# NGO.UZ — полная нормативная спецификация продукта и регрессии

*(NGO.UZ — Complete Normative Product and Regression Specification)*

**Версия:** 1.0  
**Дата:** 27 августа 2026 года  
**Статус:** нормативный источник истины для разработки, тестирования, deployment и приёмки  
**Область:** `www.ngo.uz`, `api.ngo.uz`, административные интерфейсы, комиссия, кабинет участника, iOS и Android

---

## 1. Назначение документа

Этот документ определяет, как должен работать весь продукт NGO.UZ, а не только его внешний вид.  
(This document defines how the entire NGO.UZ product must work, not only how it looks.)

Он является единым источником истины для ролей, экранов, маршрутов, бизнес-процессов, состояний, данных, файлов, истории, уведомлений, безопасности, мобильных приложений и release-проверок.  
(It is the single source of truth for roles, screens, routes, business processes, states, data, files, history, notifications, security, mobile applications, and release verification.)

Любое изменение кода должно ссылаться на конкретные требования из этого документа.  
(Every code change must reference specific requirements from this document.)

Если фактическая реализация противоречит документу, реализация считается дефектной, пока бизнес-владелец явно не изменит документ.  
(If the implementation contradicts this document, the implementation is considered defective until the business owner explicitly changes the document.)

Термины **ДОЛЖНО**, **НЕЛЬЗЯ** и **МОЖЕТ** имеют нормативное значение.  
(The terms **MUST**, **MUST NOT**, and **MAY** are normative.)

---

## 2. Главные принципы продукта

### SYS-001. Один канонический источник

Frontend, backend, миграции, шаблоны документов, мобильные приложения и deployment-конфигурация должны иметь однозначно определённые канонические репозитории и production-ветки.  
(Frontend, backend, migrations, document templates, mobile applications, and deployment configuration must have unambiguously defined canonical repositories and production branches.)

Чистый `git status` не доказывает, что checkout является актуальным или каноническим.  
(A clean `git status` does not prove that a checkout is current or canonical.)

Перед разработкой и deployment необходимо доказать remote, branch, commit SHA, связи worktree, каталог сборки и соответствие production-хэшам.  
(Before development and deployment, the remote, branch, commit SHA, worktree relationships, build directory, and production hash parity must be proven.)

Dirty-репозитории нельзя автоматически удалять, очищать, сбрасывать или использовать для deployment.  
(Dirty repositories must not be automatically deleted, cleaned, reset, or used for deployment.)

Сначала необходимо прочитать diff, определить происхождение изменений и сохранить уже утверждённые исправления в проверенном коммите.  
(The diff must first be read, the origin of the changes established, and already approved fixes preserved in a verified commit.)

### SYS-002. Один источник общей логики

Каждая общая функция должна иметь одну реализацию: admin shell, навигация, API-клиент, авторизация, RBAC, загрузка файлов, генерация документов, переходы состояний и уведомления.  
(Every shared capability must have one implementation: admin shell, navigation, API client, authentication, RBAC, file upload, document generation, state transitions, and notifications.)

Запрещены параллельные старые копии страниц, extensionless-дубликаты, `_v2`, `_new`, `_fixed`, runtime-патчи, CSS `!important`, shims и скрытые fallback-ветки.  
(Parallel old page copies, extensionless duplicates, `_v2`, `_new`, `_fixed`, runtime patches, CSS `!important`, shims, and hidden fallback branches are prohibited.)

### SYS-003. Сервер является источником данных

Браузерная память, `localStorage`, `sessionStorage` и frontend-массивы могут использоваться только как кэш интерфейса.  
(Browser memory, `localStorage`, `sessionStorage`, and frontend arrays may be used only as UI caches.)

Пользователи, заявки, документы, задачи, сообщения, статусы, уведомления, платежи и история должны храниться на сервере.  
(Users, applications, documents, tasks, messages, statuses, notifications, payments, and history must be stored on the server.)

### SYS-004. Безопасность и изоляция

Права должны проверяться backend-ом на каждом запросе, а не только скрытием кнопок.  
(Permissions must be enforced by the backend on every request, not merely by hiding buttons.)

Региональные, организационные, комиссионные и лидерские данные должны быть изолированы согласно матрице ролей.  
(Regional, organization, commission, and leader data must be isolated according to the role matrix.)

### SYS-005. Идемпотентность

Повторная отправка запроса после двойного клика, timeout или восстановления сети не должна создавать дубликаты сущностей, файлов, платежей, уведомлений или истории.  
(Retrying a request after a double click, timeout, or network recovery must not create duplicate entities, files, payments, notifications, or history.)

### SYS-006. Никаких ложных заявлений о проверке

HTTP 200, наличие DOM-элемента, source inspection или mock не являются доказательством успешного сквозного сценария.  
(HTTP 200, DOM presence, source inspection, or a mock is not proof of a successful end-to-end journey.)

Отчёт обязан точно перечислять проверенные маршруты, роли, сценарии, устройства и непроверенные области.  
(A report must precisely list the routes, roles, journeys, devices, and untested areas.)

---

## 3. Роли и границы доступа

### ROLE-001. Анонимный посетитель

Анонимный посетитель может просматривать публичный сайт, реестр NNT, новости, мероприятия, гранты, публичные документы и формы обращения.  
(An anonymous visitor may view the public website, NGO registry, news, events, grants, public documents, and submission forms.)

Он не может видеть административные данные, внутренние файлы, историю, персональные сведения или закрытые документы.  
(They may not view administrative data, internal files, history, personal information, or protected documents.)

### ROLE-002. Новый заявитель

Новый заявитель может подать заявку на членство, даже если его организация ещё отсутствует в реестре.  
(A new applicant may submit a membership application even when their organization is not yet in the registry.)

Он получает номер заявки и безопасный способ проверить её статус.  
(They receive an application number and a secure way to check its status.)

До принятия в члены заявитель не получает полноценный кабинет участника.  
(Before membership acceptance, the applicant does not receive the full member cabinet.)

### ROLE-003. Участник или менеджер NNT

Принятая организация получает безопасную активацию кабинета.  
(An accepted organization receives secure cabinet activation.)

Менеджер видит только свою организацию, её профиль, документы, уведомления, платежи, участников и разрешённую историю.  
(The manager sees only their organization, its profile, documents, notifications, payments, members, and authorized history.)

### ROLE-004. Региональный администратор

Региональный администратор видит только данные своего канонического региона.  
(A regional administrator sees only data belonging to their canonical region.)

Он рассматривает региональные заявки, готовит или заменяет документы до отправки суперадмину, получает региональные уведомления, выполняет задачи и участвует во внутренних чатах.  
(They review regional applications, prepare or replace documents before forwarding to the superadmin, receive regional notifications, perform tasks, and participate in internal chats.)

Он не может читать или изменять заявки другого региона.  
(They may not read or modify applications from another region.)

### ROLE-005. Суперадминистратор

Суперадминистратор управляет общей административной системой, пользователями, реестром, контентом, задачами и межрегиональными процессами.  
(The superadmin manages the general administrative system, users, registry, content, tasks, and cross-regional processes.)

Он самостоятельно обрабатывает заявки категории `Respublika ahamiyatidagi`.  
(They directly process applications in the `Respublika ahamiyatidagi` category.)

Он не имеет доступа к рабочему пространству руководителя и не может подписывать вместо руководителя.  
(They do not have access to the leader workspace and may not sign on behalf of the leader.)

### ROLE-006. Член комиссии

Член комиссии входит только в `/admin-commission` и видит назначенные протоколы, кандидатов, бюллетень и разрешённые документы.  
(A commission member signs in only to `/admin-commission` and sees assigned protocols, candidates, ballots, and authorized documents.)

Комиссия не имеет доступа к общему admin dashboard и его разделам.  
(Commission users do not have access to the general admin dashboard or its sections.)

### ROLE-007. Председатель или администратор комиссии

Председатель комиссии видит dashboard комиссии, старый функционально полный экран `Bayonnomalar`, создаёт и редактирует протоколы, управляет кандидатами и завершает протокол.  
(The commission chair sees the commission dashboard, the previously available fully functional `Bayonnomalar` screen, creates and edits protocols, manages candidates, and finalizes protocols.)

Он может добавлять и удалять членов комиссии и устанавливать или сбрасывать их пароли.  
(They may add and remove commission members and set or reset their passwords.)

### ROLE-008. Руководитель

Руководитель входит только в `/admin-leader-signing`.  
(The leader signs in only to `/admin-leader-signing`.)

Он просматривает и скачивает текущие версии документов и приложений, затем подписывает, одобряет, отклоняет или возвращает пакет.  
(They view and download current document versions and supporting files, then sign, approve, reject, or return the package.)

Руководитель не загружает и не заменяет документы.  
(The leader does not upload or replace documents.)

### ROLE-009. Visual Admin

Visual Admin редактирует только явно разрешённые публичные блоки, тексты, изображения, видео и ручные значения карты.  
(Visual Admin edits only explicitly authorized public blocks, text, images, video, and manually controlled map values.)

Visual Admin не получает произвольный доступ к пользователям, заявкам, платежам или административным данным.  
(Visual Admin does not receive arbitrary access to users, applications, payments, or administrative data.)

### ROLE-010. App Review

Демонстрационная учётная запись App Review должна всегда проходить вход в текущую store-сборку и иметь безопасные стабильные данные для проверки.  
(The App Review demo account must always be able to sign in to the current store build and have safe, stable data for review.)

Её пароль нельзя менять без отдельного явного разрешения.  
(Its password must not be changed without separate explicit authorization.)

---

## 4. Аутентификация, сессии и учётные записи

### AUTH-001. Вход

Вход принимает разрешённый email или телефон и пароль, возвращает безопасную сессию и профиль роли.  
(Login accepts an authorized email or phone number and password, returning a secure session and role profile.)

Ошибка входа не должна раскрывать существование аккаунта или внутренние сведения.  
(A login error must not disclose whether an account exists or reveal internal details.)

### AUTH-002. Перенаправление по роли

После входа пользователь направляется только в своё пространство: общий admin, commission, leader или member cabinet.  
(After login, a user is directed only to their workspace: general admin, commission, leader, or member cabinet.)

Попытка открыть чужой маршрут возвращает контролируемый 403 или безопасное role-home перенаправление без раскрытия данных.  
(Attempting to open another role’s route returns a controlled 403 or safe role-home redirect without data disclosure.)

### AUTH-003. Сессии

Сессии должны иметь срок жизни, отзыв, logout, список активных устройств и журнал входов.  
(Sessions must support expiration, revocation, logout, an active device list, and login history.)

Logout обязан инвалидировать серверную сессию, а не только очистить frontend.  
(Logout must invalidate the server session, not merely clear the frontend.)

### AUTH-004. Смена и восстановление пароля

Пользователь может безопасно сменить пароль, а запрос восстановления проходит через одноразовый ограниченный токен.  
(A user may securely change their password, and password recovery uses a single-use limited token.)

Суперадминистратор управляет обычными admin-аккаунтами, а председатель комиссии отдельно управляет паролями комиссии.  
(The superadmin manages normal admin accounts, while the commission chair separately manages commission passwords.)

### AUTH-005. Удаление аккаунта

Запрос удаления аккаунта проходит управляемую процедуру с сохранением требуемой истории и аудита.  
(An account deletion request follows a controlled process while preserving required history and audit records.)

Удаление пользователя не должно уничтожать законную историю заявок, задач, сообщений, платежей или документов.  
(Deleting a user must not destroy legitimate application, task, message, payment, or document history.)

---

## 5. Канонический административный shell

### SHELL-001. Единый внешний вид

`/admin-dashboard` является единственным источником структуры общего административного интерфейса.  
(`/admin-dashboard` is the single source of truth for the general administrative interface structure.)

Все общие admin-страницы используют одинаковые sidebar, topbar, page frame, design tokens, кнопки, формы, таблицы, карточки, модальные окна и состояния.  
(All general admin pages use the same sidebar, topbar, page frame, design tokens, buttons, forms, tables, cards, modals, and states.)

### SHELL-002. Sidebar

Верхний левый бренд является обычной ссылкой на `/admin-dashboard`.  
(The top-left brand is a normal link to `/admin-dashboard`.)

Desktop-sidebar корректно сворачивается и разворачивается, сохраняет состояние в пределах сессии и не ломает геометрию содержимого.  
(The desktop sidebar correctly collapses and expands, preserves state within the session, and does not break content geometry.)

Mobile-sidebar работает как доступный drawer с backdrop, Escape, focus trap и восстановлением фокуса.  
(The mobile sidebar works as an accessible drawer with backdrop, Escape handling, focus trap, and focus restoration.)

Sidebar прокручивается независимо от основного содержимого.  
(The sidebar scrolls independently from the main content.)

### SHELL-003. Навигация по ролям

Структура и стиль shell одинаковы, но пункты меню формируются одним каноническим RBAC-рендерером.  
(Shell structure and styling are identical, while menu items are produced by one canonical RBAC renderer.)

Неподходящие маршруты не только скрываются, но и запрещаются backend-ом.  
(Inapplicable routes are not only hidden but also denied by the backend.)

### SHELL-004. Поиск и иконки

Все поисковые поля используют единый компонент с одинаковой высотой, padding, radius, focus state и мобильным сжатием.  
(All search fields use one component with consistent height, padding, radius, focus state, and mobile shrinking.)

SVG-иконки геометрически центрируются в контейнерах с отклонением не более одного пикселя.  
(SVG icons are geometrically centered in their containers with no more than one pixel deviation.)

Зависимость chat-controls от внешнего icon font запрещена.  
(Chat controls must not depend on an external icon font.)

### SHELL-005. Production-режим

Production не показывает баннер `TEST — Sayt test rejimida ishlayapti`.  
(Production does not display the `TEST — Sayt test rejimida ishlayapti` banner.)

Причина устраняется в environment/configuration, а не скрывается CSS.  
(The cause is corrected in environment/configuration rather than hidden with CSS.)

---

## 6. Нормативный список общих admin-экранов

### ADM-001. Обязательные экраны

Общий административный продукт должен содержать следующие функциональные области, когда они разрешены ролью.  
(The general administrative product must contain the following functional areas when permitted by role.)

| Маршрут | Нормативное назначение |
|---|---|
| `/admin-dashboard` | Сводка, актуальные показатели, последние действия и уведомления. (Summary, current metrics, recent activity, and notifications.) |
| `/admin-membership-requests` | Очередь и полный workflow заявок на членство. (Membership application queue and complete workflow.) |
| `/admin-registry` | Канонический `NNTlar reyestri`. (Canonical `NNTlar reyestri`.) |
| `/admin-tasks` | Региональные задачи, файлы, обсуждение и история. (Regional tasks, files, discussion, and history.) |
| `/admin-messages` | Внутренние личные и групповые сообщения. (Internal direct and group messaging.) |
| `/admin-users` | Управление общими admin-пользователями, кроме комиссии. (Management of general admin users, excluding commission.) |
| `/admin-reports` | Только если отчётность остаётся утверждённой web-функцией. (Only if reporting remains an approved web capability.) |
| `/admin-service-requests` | Обработка сервисных запросов. (Processing service requests.) |
| `/admin-corruption-reports` | Защищённая обработка коррупционных обращений. (Protected processing of corruption reports.) |
| `/admin-feedback` | Обработка обратной связи. (Processing feedback.) |
| `/admin-news` | Управление новостями и медиа. (News and media management.) |
| `/admin-events` | Управление мероприятиями, если функция используется. (Event management if the feature is used.) |
| `/admin-grants` | Управление опубликованными грантами. (Management of published grants.) |
| `/admin-notifications` | Inbox и отправка разрешённых уведомлений. (Notification inbox and authorized sending.) |
| `/admin-settings` | Настройки профиля, уведомлений, безопасности и системы согласно роли. (Role-appropriate profile, notification, security, and system settings.) |

### ADM-002. Полностью удалённые области

Следующие старые общие admin-экраны, пункты меню, маршруты, assets и deploy-копии должны быть полностью удалены, если бизнес-владелец письменно не возвращает их.  
(The following old general admin screens, menu items, routes, assets, and deploy copies must be completely removed unless the business owner explicitly restores them.)

- `Grant arizalari` и `/admin-grant-applications`.  
  (`Grant arizalari` and `/admin-grant-applications`.)
- `Hududlar` и `/admin-regions`.  
  (`Hududlar` and `/admin-regions`.)
- `Hujjatlar` и `/admin-documents`.  
  (`Hujjatlar` and `/admin-documents`.)
- `Tahliliy ma’lumotlar` и `/admin-analytics`.  
  (`Tahliliy ma’lumotlar` and `/admin-analytics`.)

Удаление означает отсутствие навигации, страницы, obsolete JavaScript, CSS, route mapping, service-worker precache и stale deploy-артефакта.  
(Removal means absence of navigation, page, obsolete JavaScript, CSS, route mapping, service-worker precache, and stale deployment artifact.)

### ADM-003. Нерешённые бизнес-модули

`/admin-murojaat` и другие неясные legacy-модули нельзя молча сохранять или удалять.  
(`/admin-murojaat` and other unclear legacy modules must not be silently retained or removed.)

Для каждого требуется отдельное решение владельца: сохранить, объединить с сервисными запросами или удалить.  
(Each requires an explicit owner decision: retain, merge with service requests, or remove.)

---

## 7. Реестр NNT

### REG-001. Каноническая организация

Во всём продукте одна организация представлена одной канонической записью и стабильным ID.  
(Across the product, one organization is represented by one canonical record and stable ID.)

Список, dashboard, публичный реестр, карта, экспорт, заявки и аналитические показатели должны использовать одну каноническую выборку уникальных организаций.  
(The list, dashboard, public registry, map, exports, applications, and analytical metrics must use one canonical set of unique organizations.)

Текущее утверждённое production-значение для проверки миграции составляет 2392 уникальных NNT, но число должно далее вычисляться из канонических данных, а не быть захардкожено.  
(The currently approved production reference for migration verification is 2,392 unique NGOs, but the value must subsequently be calculated from canonical data rather than hard-coded.)

### REG-002. Никаких повторов

JOIN с документами, категориями, пользователями или заявками не должен дублировать строку организации.  
(A JOIN with documents, categories, users, or applications must not duplicate an organization row.)

API должен возвращать уникальные organization IDs, корректный `total` и стабильную pagination.  
(The API must return unique organization IDs, a correct `total`, and stable pagination.)

### REG-003. Название

Раздел и sidebar должны называться `NNTlar reyestri`.  
(The section and sidebar must be named `NNTlar reyestri`.)

### REG-004. Pagination

Admin-реестр показывает 20 организаций на страницу и предоставляет переход по всем страницам.  
(The admin registry shows 20 organizations per page and provides navigation through all pages.)

Поиск и фильтры должны применяться на сервере к полной выборке до pagination.  
(Search and filters must be applied server-side to the complete dataset before pagination.)

### REG-005. Фильтры

Реестр должен иметь общий поиск, фильтр региона с `Respublika ahamiyatidagi`, фильтр направления и утверждённые диапазоны дат.  
(The registry must have general search, a region filter including `Respublika ahamiyatidagi`, a direction filter, and approved date ranges.)

Из фильтров должны быть удалены `Faol`, статус членства, STIR, номер сертификата, номер рекомендации, номер договора и статус рекомендации.  
(`Faol`, membership status, STIR, certificate number, recommendation number, contract number, and recommendation status must be removed from the filters.)

### REG-006. Добавление NNT

Форма добавления NNT использует полный канонический каталог направлений, а не локальные пять или шесть значений.  
(The Add NGO form uses the complete canonical directions catalog rather than a local list of five or six values.)

Поле ручного выбора `Holat` полностью удаляется.  
(The manual `Holat` selector is completely removed.)

Статус определяется серверной бизнес-логикой.  
(Status is determined by server-side business logic.)

### REG-007. Просмотр и редактирование

Карточка каждой организации должна поддерживать просмотр, редактирование разрешённых сведений и документные операции.  
(Each organization card must support viewing, editing authorized information, and document operations.)

Изменения создают историю с actor, временем, причиной и old/new значениями.  
(Changes create history with actor, time, reason, and old/new values.)

### REG-008. Документы организации

Карточка организации должна поддерживать как минимум свидетельство о регистрации, копии устава, сведения о деятельности за последний год, сведения или объективку руководителя, паспорт руководителя и договор членства.  
(The organization card must support at minimum the registration certificate, charter copies, information about the last year of activity, leader information or CV, leader passport, and membership contract.)

Документы хранятся безопасно, версионируются и доступны только разрешённым ролям.  
(Documents are securely stored, versioned, and accessible only to authorized roles.)

### REG-009. Публичная приватность

На `/nntlar` год рождения в скобках не показывается, но не удаляется из базы.  
(On `/nntlar`, the birth year in parentheses is not displayed but is not deleted from the database.)

Телефонные номера организаций и руководителей не показываются публично, но сохраняются для разрешённых внутренних процессов.  
(Organization and leader phone numbers are not displayed publicly but remain available for authorized internal processes.)

Код `TSH` публично отображается как `Toshkent shahri`, а не как технический код.  
(The `TSH` code is publicly displayed as `Toshkent shahri`, not as a technical code.)

---

## 8. Членство: полный сквозной процесс

### MEM-001. Новая организация может подать заявку

Публичная форма `Assotsiatsiyaga a’zo bo‘lish` не требует существования организации в реестре.  
(The public `Assotsiatsiyaga a’zo bo‘lish` form does not require the organization to already exist in the registry.)

Ошибка `Reyestrdagi tashkilot nomini aniq kiriting` не должна блокировать новую организацию.  
(The `Reyestrdagi tashkilot nomini aniq kiriting` error must not block a new organization.)

Совпадение с реестром может предложить связать или предварительно заполнить данные, но не является обязательным условием.  
(A registry match may offer linking or prefill, but it is not a mandatory condition.)

### MEM-002. Проверки заявки

Backend проверяет обязательные поля, email, телефон, канонический регион, согласия и допустимую уникальность по утверждённой политике.  
(The backend validates required fields, email, phone, canonical region, consents, and permitted uniqueness according to approved policy.)

Название организации не используется как единственный идентификатор.  
(The organization name is not used as the sole identifier.)

### MEM-003. Создание заявки

Заявка, организация-кандидат, audit event и начальное уведомление создаются атомарно и идемпотентно.  
(The application, candidate organization, audit event, and initial notification are created atomically and idempotently.)

Успех показывается только после подтверждённого commit базы данных.  
(Success is shown only after a confirmed database commit.)

### MEM-004. Маршрутизация

Канонический код региона определяет владельца заявки.  
(The canonical region code determines application ownership.)

Региональная заявка появляется у ответственного администратора соответствующего региона и создаёт ровно одно предусмотренное долговечное уведомление.  
(A regional application appears for the responsible administrator of the matching region and creates exactly one intended durable notification.)

Она не появляется в рабочей очереди несвязанного региона.  
(It does not appear in an unrelated region’s work queue.)

Заявка `Respublika ahamiyatidagi` назначается суперадминистратору.  
(A `Respublika ahamiyatidagi` application is assigned to the superadmin.)

### MEM-005. Состояния

Переходы состояний реализуются одной серверной state machine.  
(State transitions are implemented by one server-side state machine.)

Минимальный нормативный путь: `submitted → regional_review|superadmin_review → documents_prepared → forwarded_to_superadmin → superadmin_review → forwarded_to_leader → leader_review → accepted|rejected|returned`.  
(The minimum normative path is `submitted → regional_review|superadmin_review → documents_prepared → forwarded_to_superadmin → superadmin_review → forwarded_to_leader → leader_review → accepted|rejected|returned`.)

Для республиканской заявки региональный этап пропускается.  
(For a republic-level application, the regional stage is skipped.)

Возврат обязан указывать получателя, причину и разрешённый следующий переход.  
(A return must specify the recipient, reason, and permitted next transition.)

Терминальное принятое состояние не показывает противоречивые действия возврата или повторного принятия.  
(A terminal accepted state does not show contradictory return or re-accept actions.)

### MEM-006. Четыре автоматических документа

Система генерирует четыре утверждённых документа из канонических шаблонов и данных заявки.  
(The system generates four approved documents from canonical templates and application data.)

1. Заявление о членстве в формате DOCX.  
   (Membership application in DOCX format.)
2. Договор членства в формате DOCX.  
   (Membership contract in DOCX format.)
3. Свидетельство о членстве в формате PPTX.  
   (Membership certificate in PPTX format.)
4. Рекомендация на основе утверждённого шаблона Фарғона ННТлар уйи в формате PPTX.  
   (Recommendation based on the approved Fergana NGO House template in PPTX format.)

Генерация обязана корректно заменять placeholders, сохранять стили, создавать открываемые Office-файлы и не оставлять placeholder-текст.  
(Generation must correctly replace placeholders, preserve styling, create valid Office files, and leave no placeholder text.)

### MEM-007. Версионирование документов

Каждый документ имеет стабильную логическую запись и неизменяемые версии.  
(Each document has a stable logical record and immutable versions.)

Версия хранит generated ID, original filename, MIME, extension, byte size, SHA-256, uploader, timestamp, source и ссылку на предыдущую версию.  
(A version stores generated ID, original filename, MIME, extension, byte size, SHA-256, uploader, timestamp, source, and a link to the previous version.)

Только одна версия является текущей, но предыдущие версии остаются в истории.  
(Only one version is current, while previous versions remain in history.)

### MEM-008. Действия регионального администратора

До отправки суперадмину региональный администратор может просмотреть, скачать, заменить и сохранить каждый из четырёх документов.  
(Before forwarding to the superadmin, the regional administrator may view, download, replace, and save each of the four documents.)

Он может добавлять подтверждающие документы.  
(They may add supporting documents.)

Сохранение документа не выполняет автоматическую отправку.  
(Saving a document does not automatically forward the application.)

Отправка суперадмину является отдельным подтверждённым действием.  
(Forwarding to the superadmin is a separate confirmed action.)

После отправки пакет блокируется для регионального редактирования, если суперадминистратор явно не возвращает его.  
(After forwarding, the package is locked against regional editing unless the superadmin explicitly returns it.)

### MEM-009. Действия суперадминистратора

Для республиканской заявки суперадминистратор имеет те же возможности подготовки, замены и добавления файлов до отправки руководителю.  
(For a republic-level application, the superadmin has the same preparation, replacement, and supporting-file capabilities before forwarding to the leader.)

Для региональной заявки суперадминистратор проверяет переданный пакет, может вернуть его с причиной или отправить руководителю.  
(For a regional application, the superadmin reviews the forwarded package, may return it with a reason, or forward it to the leader.)

### MEM-010. Действия руководителя

Руководитель видит только пакеты, официально отправленные ему.  
(The leader sees only packages officially forwarded to them.)

Он получает текущие версии четырёх документов, дополнительные файлы, историю передачи и понятные действия подписания, одобрения, отклонения или возврата.  
(They receive current versions of the four documents, supporting files, forwarding history, and clear sign, approve, reject, or return actions.)

Суперадминистратор не может открыть этот workspace с собственной сессией.  
(The superadmin cannot open this workspace using their own session.)

### MEM-011. Завершение членства

После окончательного принятия система фиксирует решение, номера документов, подписанные версии, дату членства и полную историю.  
(After final acceptance, the system records the decision, document numbers, signed versions, membership date, and complete history.)

Каноническая организация создаётся или связывается без дубля.  
(The canonical organization is created or linked without duplication.)

Кабинет активируется безопасным одноразовым процессом, а пароль не отправляется в открытом виде.  
(The cabinet is activated through a secure one-time process, and the password is not sent in plaintext.)

### MEM-012. История и уведомления

Каждый переход сохраняет actor, role, timestamp, old state, new state, reason, request ID и связанные document version IDs.  
(Every transition stores actor, role, timestamp, old state, new state, reason, request ID, and related document version IDs.)

Уведомления создаются только после успешного commit и не дублируются при повторе запроса.  
(Notifications are created only after a successful commit and are not duplicated on request retry.)

GET-запросы не создают историю и не изменяют состояние.  
(GET requests do not create history or change state.)

### MEM-013. Modal и доступность

Кнопка `×`, `Yopish`, Escape и backdrop закрывают modal согласно одному доступному компоненту.  
(The `×` button, `Yopish`, Escape, and backdrop close the modal through one accessible component.)

Фокус возвращается на открывшую modal кнопку.  
(Focus returns to the button that opened the modal.)

### MEM-014. Платёж

Попытка оплаты имеет уникальную provider-идентичность и не должна создавать несколько pending-строк для одного намерения.  
(A payment attempt has a unique provider identity and must not create multiple pending rows for one intent.)

Callback провайдера проверяется, идемпотентен и меняет статус ровно один раз.  
(The provider callback is authenticated, idempotent, and changes status exactly once.)

Статус членства нельзя отмечать оплаченным только по frontend redirect.  
(Membership status must not be marked paid solely from a frontend redirect.)

---

## 9. Внутренние сообщения

### MSG-001. Идентичность личного чата

Для одной пары пользователей существует один канонический личный thread.  
(One canonical direct thread exists for a pair of users.)

Повторный выбор того же человека открывает существующую историю, а не создаёт новый чат.  
(Selecting the same person again opens the existing history rather than creating a new chat.)

### MSG-002. Групповые чаты

Авторизованный пользователь может создать группу с разрешёнными участниками и названием.  
(An authorized user may create a group with permitted participants and a name.)

Создание группы с региональными администраторами не должно возвращать HTTP 500.  
(Creating a group with regional administrators must not return HTTP 500.)

Backend атомарно создаёт thread, membership и audit event.  
(The backend atomically creates the thread, membership, and audit event.)

### MSG-003. Сообщения

Сообщение поддерживает текст, attachments, reply, timestamps, edit history, soft delete, delivery и read receipts.  
(A message supports text, attachments, replies, timestamps, edit history, soft deletion, delivery, and read receipts.)

Отправка использует idempotency key и не создаёт дубль после восстановления сети.  
(Sending uses an idempotency key and does not create a duplicate after network recovery.)

### MSG-004. Реальное время

Новые сообщения, редактирование, удаление, typing/presence и receipts обновляются в реальном времени или через надёжный событийный fallback.  
(New messages, edits, deletions, typing/presence, and receipts update in real time or through a reliable event fallback.)

После reconnect клиент получает пропущенные события по cursor и сохраняет порядок.  
(After reconnect, the client retrieves missed events by cursor and preserves ordering.)

### MSG-005. Файлы

Поддерживаются image, PDF, DOC/DOCX, spreadsheet, video, audio и generic file.  
(Image, PDF, DOC/DOCX, spreadsheet, video, audio, and generic files are supported.)

Файлы имеют безопасные preview и download endpoints с проверкой membership thread.  
(Files have secure preview and download endpoints that validate thread membership.)

Файлы не исполняются из upload-каталога.  
(Files are not executed from the upload directory.)

### MSG-006. Telegram-подобный интерфейс

Chat использует различимые incoming/outgoing bubbles, reply block, attachments, timestamps и read ticks.  
(Chat uses distinct incoming/outgoing bubbles, reply blocks, attachments, timestamps, and read ticks.)

Иконки являются first-party inline SVG с семантическими цветами для send, attachment, image, PDF, document, spreadsheet, video, audio, download и remove.  
(Icons are first-party inline SVG with semantic colors for send, attachment, image, PDF, document, spreadsheet, video, audio, download, and remove.)

### MSG-007. Геометрия `/admin-messages`

Экран точно заполняет доступную высоту viewport.  
(The screen exactly fills the available viewport height.)

Header чата остаётся сверху, composer полностью виден снизу, а прокручивается только история сообщений.  
(The chat header remains at the top, the composer remains fully visible at the bottom, and only message history scrolls.)

Sidebar, список диалогов и активный chat прокручиваются независимо.  
(The sidebar, conversation list, and active chat scroll independently.)

### MSG-008. Mobile

На 390×844 список и активный chat имеют ясный переход назад, composer не перекрывается клавиатурой и touch-targets доступны.  
(At 390×844, the list and active chat have a clear back transition, the composer is not obscured by the keyboard, and touch targets are accessible.)

### MSG-009. Связь с задачей

Задача может иметь один привязанный discussion thread, доступный только участникам задачи и уполномоченному суперадмину.  
(A task may have one linked discussion thread accessible only to task participants and the authorized superadmin.)

---

## 10. Задачи

### TASK-001. Назначение по регионам

Суперадминистратор создаёт задачу и выбирает один или несколько регионов.  
(The superadmin creates a task and selects one or more regions.)

Система выводит ответственных региональных администраторов из канонического назначения регионов.  
(The system derives responsible regional administrators from canonical region assignments.)

Отдельный громоздкий блок `Mas’ul adminlar` не требуется, если он дублирует региональное назначение.  
(A separate bulky `Mas’ul adminlar` block is not required when it duplicates region assignment.)

### TASK-002. Упрощённая форма

Из формы удаляются `Kuzatuvchilar`, `Yorliqlar`, `Muhimlik` и `Taraqqiyot`.  
(`Kuzatuvchilar`, `Yorliqlar`, `Muhimlik`, and `Taraqqiyot` are removed from the form.)

Форма содержит title, description, regions, start, deadline и attachments.  
(The form contains title, description, regions, start, deadline, and attachments.)

### TASK-003. Attachments

Файлы можно приложить непосредственно при создании задачи и позже в обсуждении.  
(Files may be attached directly during task creation and later in discussion.)

Создание задачи и привязка уже загруженных файлов выполняются атомарно.  
(Task creation and attachment of uploaded files are performed atomically.)

### TASK-004. Состояния

Задача имеет ограниченный набор состояний, например `assigned`, `in_progress`, `submitted`, `completed`, `returned`, `cancelled`.  
(A task has a controlled set of states such as `assigned`, `in_progress`, `submitted`, `completed`, `returned`, and `cancelled`.)

Разрешённые переходы зависят от роли и фиксируются в истории.  
(Allowed transitions depend on role and are recorded in history.)

### TASK-005. История

Сервер хранит создание, изменения, assignees, сроки, статусы, комментарии, файлы и уведомления.  
(The server stores creation, changes, assignees, deadlines, statuses, comments, files, and notifications.)

История загружается после нового login и в чистом browser context.  
(History reloads after a new login and in a clean browser context.)

---

## 11. Пользователи и production-чистота

### USER-001. Добавление пользователя

Суперадминистратор может добавлять, редактировать, деактивировать и безопасно сбрасывать пароль обычного admin-пользователя.  
(The superadmin may add, edit, deactivate, and securely reset the password of a normal admin user.)

### USER-002. Комиссия отдельно

Члены комиссии не отображаются как обычные пользователи общего admin dashboard и управляются в commission-продукте.  
(Commission members are not managed as normal general-admin users and are managed within the commission product.)

### USER-003. Test-данные

Production не должен показывать `CODEX-*`, `QA`, `dummy`, `fixture`, `example.com` и другие подтверждённые тестовые сущности.  
(Production must not display confirmed `CODEX-*`, `QA`, `dummy`, `fixture`, `example.com`, or other test entities.)

Перед удалением каждая сущность классифицируется по доказанному provenance, экспортируется и удаляется транзакционно вместе только со своими зависимостями.  
(Before deletion, each entity is classified by proven provenance, exported, and transactionally removed together only with its own dependencies.)

Легитимные `leader@ngo.uz` и `app.review@ngo.uz` нельзя удалять как тестовые.  
(The legitimate `leader@ngo.uz` and `app.review@ngo.uz` accounts must not be deleted as test data.)

---

## 12. Комиссия и протоколы

### COM-001. Изолированный продукт

`/admin-commission` имеет отдельный shell и RBAC, не зависящий от общего admin navigation.  
(`/admin-commission` has its own shell and RBAC independent of general admin navigation.)

Изменение общего admin-дизайна не должно удалять или заменять функциональное содержание комиссии.  
(A general admin design change must not remove or replace commission functionality.)

### COM-002. Dashboard комиссии

Dashboard показывает доступные протоколы, статусы, требующие голоса элементы и последние действия.  
(The dashboard shows available protocols, statuses, items requiring a vote, and recent activity.)

### COM-003. Bayonnomalar

Председатель видит полный список `Bayonnomalar`, создаёт протокол, выбирает обращения или кандидатов, редактирует сведения и открывает голосование.  
(The chair sees the complete `Bayonnomalar` list, creates a protocol, selects applications or candidates, edits details, and opens voting.)

### COM-004. Члены комиссии

Председатель может просматривать, добавлять, редактировать, деактивировать и удалять члена комиссии согласно retention-политике.  
(The chair may view, add, edit, deactivate, and remove a commission member according to retention policy.)

Он может выдать безопасный password reset без раскрытия существующего hash или пароля.  
(They may issue a secure password reset without exposing the existing hash or password.)

### COM-005. Голосование

Член комиссии может проголосовать один раз согласно правилам протокола.  
(A commission member may vote once according to protocol rules.)

Повторная отправка не создаёт второй голос.  
(Retrying does not create a second vote.)

Tally отображает только допустимые агрегаты и не раскрывает закрытые голоса до разрешённого момента.  
(The tally displays only permitted aggregates and does not expose sealed votes before the permitted time.)

### COM-006. Документы протокола

Протокол поддерживает source DOCX, editor configuration, финальный PDF, download ticket и публичную QR-проверку подлинности без персональных данных.  
(A protocol supports source DOCX, editor configuration, final PDF, download ticket, and public QR authenticity verification without personal data.)

---

## 13. Контент, медиа и публичный сайт

### PUB-001. Языки

Публичный сайт полностью поддерживает узбекский, русский и английский языки через один канонический i18n-источник.  
(The public website fully supports Uzbek, Russian, and English through one canonical i18n source.)

Desktop top navigation и mobile hamburger показывают одинаковую структуру и ссылки.  
(Desktop top navigation and the mobile hamburger show the same structure and links.)

### PUB-002. Главная страница

Пустой блок `Yaqin tadbirlar topilmadi` удаляется, если отдельные ближайшие мероприятия не являются утверждённой функцией главной страницы.  
(The empty `Yaqin tadbirlar topilmadi` block is removed when a separate upcoming-events section is not an approved homepage feature.)

Новости отображаются двумя видимыми рядами на desktop и адаптивно на mobile.  
(News is displayed in two visible rows on desktop and responsively on mobile.)

### PUB-003. Медиа

Изображения и видео новостей, мероприятий и других content entities должны отображаться, а не оставаться серыми placeholders.  
(Images and videos for news, events, and other content entities must render rather than remain gray placeholders.)

CMS сохраняет canonical media ID и metadata, а frontend использует разрешённый URL и корректный MIME.  
(The CMS stores a canonical media ID and metadata, while the frontend uses an authorized URL and correct MIME.)

### PUB-004. Content lifecycle

News, events и grants поддерживают draft, published, scheduled и archived состояния, если они используются бизнесом.  
(News, events, and grants support draft, published, scheduled, and archived states where used by the business.)

Create, edit, publish и delete создают audit events.  
(Create, edit, publish, and delete create audit events.)

### PUB-005. Search и detail

Список и detail используют один API-контракт, стабильные IDs, корректные 404 и языковой fallback только к явно разрешённому тексту.  
(List and detail views use one API contract, stable IDs, correct 404 responses, and language fallback only to explicitly allowed text.)

### PUB-006. Карта

Числа карты полностью отделены от operational database организаций.  
(Map numbers are completely decoupled from the operational organization database.)

По умолчанию каждая область показывает `-`, пока Visual Admin вручную не установит значение.  
(By default, each region shows `-` until Visual Admin manually sets a value.)

Ручное значение сохраняется как CMS configuration и никогда автоматически не перезаписывается реестром.  
(The manual value is stored as CMS configuration and is never automatically overwritten by the registry.)

### PUB-007. Visual Admin

Visual Admin редактирует только разрешённые блоки через короткоживущий токен и сохраняет изменения на сервере.  
(Visual Admin edits only authorized blocks through a short-lived token and saves changes server-side.)

После сохранения значение остаётся после logout, cache clear и новой сессии.  
(After saving, a value remains after logout, cache clearing, and a new session.)

### PUB-008. Grant AI

Запрос пользователя нормализуется и преобразуется в качественный английский search intent перед внешним поиском.  
(The user’s query is normalized and transformed into a high-quality English search intent before external search.)

LLM возвращает строгую структурированную схему, а parser надёжно обрабатывает допустимые ответы и контролируемые ошибки.  
(The LLM returns a strict structured schema, and the parser reliably handles valid responses and controlled failures.)

Ошибка `llm2_parse_failed` не должна быть обычным пользовательским результатом.  
(The `llm2_parse_failed` error must not be a normal user-facing outcome.)

Результаты содержат актуальные названия, источники, ссылки, сроки и объяснение соответствия запросу.  
(Results contain current titles, sources, links, deadlines, and an explanation of relevance.)

### PUB-009. Accessibility и ошибки

Все публичные формы имеют labels, keyboard navigation, focus states, понятную валидацию и responsive layout.  
(All public forms have labels, keyboard navigation, focus states, clear validation, and responsive layout.)

404, 403, session expiry, offline и 500 имеют контролируемые страницы без утечки внутренних сведений.  
(404, 403, session expiry, offline, and 500 have controlled pages without internal information leakage.)

---

## 14. Публичные формы и uploads

### FORM-001. Общий контракт

Membership, service request, feedback, corruption report и утверждённые murojaat-формы используют общую безопасную boundary загрузок и структурированные ошибки.  
(Membership, service request, feedback, corruption report, and approved murojaat forms use a common secure upload boundary and structured errors.)

### FORM-002. Ограничения upload

Browser contract, proxy, web server, PHP и backend должны иметь согласованные per-file и total limits.  
(The browser contract, proxy, web server, PHP, and backend must have aligned per-file and total limits.)

Backend проверяет extension, detected MIME, signature, file integrity, filename length и total payload.  
(The backend validates extension, detected MIME, signature, file integrity, filename length, and total payload.)

Client filename никогда не используется как storage path.  
(The client filename is never used as a storage path.)

### FORM-003. Атомарность

Application row, document metadata, stored files, history и notifications должны завершаться как одна согласованная операция.  
(The application row, document metadata, stored files, history, and notifications must complete as one consistent operation.)

Ошибка базы или storage оставляет ноль partial rows и ноль orphaned files.  
(A database or storage failure leaves zero partial rows and zero orphaned files.)

### FORM-004. Ошибки

Пользователь получает конкретную локализованную ошибку для размера, типа, повреждённого файла, expired session, network и внутренней ошибки.  
(The user receives a specific localized error for size, type, corrupted file, expired session, network, and internal failure.)

Неожиданная ошибка показывает reference ID без stack trace, SQL, paths или credentials.  
(An unexpected error displays a reference ID without a stack trace, SQL, paths, or credentials.)

### FORM-005. Email attachments

Если бизнес-получатель требует документы в email, система прикладывает безопасные разрешённые файлы к письму, а не только отправляет ссылку.  
(When the business recipient requires documents in email, the system attaches safe authorized files rather than sending only a link.)

Email outbox хранит статус, попытки, provider ID и ошибку доставки.  
(The email outbox stores status, attempts, provider ID, and delivery error.)

---

## 15. Уведомления

### NOTIF-001. Долговечность

Уведомление является серверной сущностью с recipient, type, entity ID, payload, created time, delivered time и read time.  
(A notification is a server-side entity with recipient, type, entity ID, payload, created time, delivered time, and read time.)

### NOTIF-002. Получатели

Membership routing, task assignment, message mention, document return и leader decision должны уведомлять только предусмотренных получателей.  
(Membership routing, task assignment, message mention, document return, and leader decision must notify only intended recipients.)

Региональная заявка обязана уведомить ответственный региональный аккаунт, а не только суперадмина.  
(A regional application must notify the responsible regional account, not only the superadmin.)

### NOTIF-003. Exactly once

Один business event создаёт одно логическое уведомление на получателя даже при retry.  
(One business event creates one logical notification per recipient even on retry.)

### NOTIF-004. Read state

Mark-read проверяет ownership и сохраняет состояние на сервере.  
(Mark-read validates ownership and stores state server-side.)

Unread count одинаков после refresh и новой сессии.  
(Unread count remains consistent after refresh and a new session.)

---

## 16. Штат, вакансии и сотрудники

### STAFF-001. Одна lifecycle-модель

Вакансия и занятая позиция являются состояниями одной канонической staff position, а не независимыми копиями.  
(A vacancy and a filled position are states of one canonical staff position rather than independent copies.)

### STAFF-002. Переходы

Редактирование позиции позволяет переместить её между vacancy, leader, specialist и утверждёнными staff-категориями.  
(Editing a position allows it to transition between vacancy, leader, specialist, and approved staff categories.)

Fill связывает человека с позицией, а vacate сохраняет историю и возвращает позицию в vacant state.  
(Fill links a person to the position, while vacate preserves history and returns the position to the vacant state.)

### STAFF-003. Синхронность

Одна операция не должна одновременно оставлять человека в staff и старую vacancy активной.  
(One operation must not simultaneously leave a person in staff and the old vacancy active.)

### STAFF-004. История

История содержит позицию, человека, регион, actor, previous state, new state и timestamps.  
(History contains position, person, region, actor, previous state, new state, and timestamps.)

---

## 17. Кабинет участника и мобильные приложения

### APP-001. Доступ после принятия

Полноценный аккаунт приложения выдаётся принятой организации или разрешённому участнику через secure activation.  
(A full application account is issued to an accepted organization or authorized member through secure activation.)

Публичная membership application не должна зависеть от предварительного app-account.  
(Public membership application must not depend on a pre-existing app account.)

### APP-002. Нормативные области кабинета

Кабинет может содержать home, news, events, grants, saved grants, grant applications, members, organization profile, documents, notifications, sessions, login history, password, theme, language, settings, inbox и account deletion.  
(The cabinet may contain home, news, events, grants, saved grants, grant applications, members, organization profile, documents, notifications, sessions, login history, password, theme, language, settings, inbox, and account deletion.)

### APP-003. Удалённая отчётность

Функция `hisobot topshirish` полностью удалена из iOS и Android, включая navigation, routes, API calls, cached screens и deep links.  
(The `hisobot topshirish` feature is completely removed from iOS and Android, including navigation, routes, API calls, cached screens, and deep links.)

Backend legacy reporting нельзя случайно снова показывать в приложении.  
(Backend legacy reporting must not accidentally reappear in the application.)

### APP-004. Пользовательская история

Документы, grants, saved items, applications, notifications, sessions и security history загружаются с backend и сохраняются между устройствами.  
(Documents, grants, saved items, applications, notifications, sessions, and security history load from the backend and persist across devices.)

### APP-005. Native UI

Login, keyboard, safe areas, orientation, dynamic text, iPhone, iPad и Android layouts не должны обрезать элементы или показывать чёрные пустые области.  
(Login, keyboard, safe areas, orientation, dynamic text, iPhone, iPad, and Android layouts must not clip elements or display black empty areas.)

### APP-006. Offline и ошибки

Приложение различает offline, timeout, validation, expired session и server error и предоставляет безопасное повторное действие.  
(The app distinguishes offline, timeout, validation, expired session, and server error and provides a safe retry action.)

### APP-007. Demo account

Перед каждой store submission demo-учётная запись проверяется в точной release-сборке на физическом устройстве.  
(Before every store submission, the demo account is tested in the exact release build on a physical device.)

### APP-008. Firebase

Firebase не считается обязательной архитектурной частью без подтверждённого использования в каноническом source.  
(Firebase is not considered a required architectural component without confirmed use in canonical source.)

Authoritative data остаётся в NGO.UZ backend независимо от push-provider.  
(Authoritative data remains in the NGO.UZ backend regardless of push provider.)

---

## 18. Платежи и store compliance

### PAY-001. Web Payme

Web может перенаправлять на `checkout.paycom.uz`, если business и security contract утверждены.  
(The web product may redirect to `checkout.paycom.uz` when the business and security contract is approved.)

### PAY-002. iOS

До явного compliance-решения iOS не должен предлагать внешнюю оплату цифрового членства через Payme.  
(Until an explicit compliance decision is made, iOS must not offer external payment for digital membership through Payme.)

Если Apple квалифицирует членство как цифровую услугу, покупка в iOS должна использовать In-App Purchase либо платёжная функция должна быть удалена из iOS.  
(If Apple classifies membership as a digital service, purchase in iOS must use In-App Purchase or the payment feature must be removed from iOS.)

App Review должен получить точное объяснение природы членства и доступных функций.  
(App Review must receive an accurate explanation of the nature of membership and available functionality.)

### PAY-003. Apple organization account

Из-за обработки чувствительных данных iOS submission должна выполняться через Apple Developer Organization account согласно требованию Apple.  
(Because sensitive data is handled, iOS submission must use an Apple Developer Organization account as required by Apple.)

### PAY-004. Android

Google Play payment policy проверяется отдельно для точной Android-функциональности и release track.  
(Google Play payment policy is evaluated separately for the exact Android functionality and release track.)

### PAY-005. Store release

Новая build number создаётся только после закрытия release blockers и прохождения физического device gate.  
(A new build number is created only after release blockers are closed and the physical-device gate passes.)

Upload или submit не выполняется без явного разрешения для конкретной сборки.  
(Upload or submission is not performed without explicit authorization for the specific build.)

---

## 19. Безопасность файлов и данных

### SEC-001. Upload validation

Разрешённые типы определяются allowlist, а MIME определяется содержимым.  
(Allowed types are defined by an allowlist, and MIME is detected from content.)

Path traversal, double extension, executable content, malformed PDF и unauthorized access блокируются.  
(Path traversal, double extensions, executable content, malformed PDFs, and unauthorized access are blocked.)

### SEC-002. Storage

Файлы сохраняются под server-generated identifiers вне публично исполняемого каталога.  
(Files are stored under server-generated identifiers outside a publicly executable directory.)

Original filename хранится только как безопасная metadata.  
(The original filename is stored only as safe metadata.)

### SEC-003. Download authorization

Каждый download endpoint повторно проверяет роль, регион, organization ownership, thread membership или workflow ownership.  
(Every download endpoint revalidates role, region, organization ownership, thread membership, or workflow ownership.)

### SEC-004. Secrets

Credentials, tokens, signing keys и cookies не хранятся в repository, frontend bundle, logs, screenshots или test artifacts.  
(Credentials, tokens, signing keys, and cookies are not stored in repositories, frontend bundles, logs, screenshots, or test artifacts.)

Рабочие credentials нельзя вращать, удалять или менять без отдельного явного разрешения.  
(Working credentials must not be rotated, deleted, or changed without separate explicit authorization.)

### SEC-005. Audit

Security-sensitive действия сохраняют actor, target, request ID, IP policy result, timestamp и outcome.  
(Security-sensitive actions store actor, target, request ID, IP policy result, timestamp, and outcome.)

Audit history append-only для обычных приложений.  
(Audit history is append-only for normal application operations.)

---

## 20. История, retention и удаление

### HIST-001. Обязательная история

Сервер хранит историю membership, documents, tasks, messages, notifications, payments, registry edits, staff lifecycle, content lifecycle, sessions и security actions.  
(The server stores history for membership, documents, tasks, messages, notifications, payments, registry edits, staff lifecycle, content lifecycle, sessions, and security actions.)

### HIST-002. Fresh session proof

Долговечность считается доказанной только после logout, нового login и нового browser context без local storage.  
(Durability is proven only after logout, a new login, and a fresh browser context without local storage.)

### HIST-003. Soft deletion

Сообщения, задачи, пользователи, документы и заявки используют auditable soft deletion там, где история должна сохраняться.  
(Messages, tasks, users, documents, and applications use auditable soft deletion where history must be retained.)

### HIST-004. Physical cleanup

Физическое удаление допускается только для подтверждённой disposable fixture после export manifest, проверки зависимостей и transaction guard.  
(Physical deletion is allowed only for a confirmed disposable fixture after an export manifest, dependency verification, and transaction guard.)

### HIST-005. Backups

Перед production mutation создаётся узкая резервная копия только затрагиваемых таблиц и файлов.  
(Before a production mutation, a narrow backup is created only for affected tables and files.)

Архив от 3 августа должен быть сохранён.  
(The August 3 archive must be preserved.)

---

## 21. Наблюдаемость и ошибки

### OBS-001. Correlation ID

Каждый значимый запрос получает correlation ID, который связывает browser, proxy, application, database, outbox и logs.  
(Every significant request receives a correlation ID linking browser, proxy, application, database, outbox, and logs.)

### OBS-002. Structured errors

API возвращает стабильные error codes, локализуемое сообщение, field details и reference ID.  
(The API returns stable error codes, a localizable message, field details, and a reference ID.)

### OBS-003. Production logs

Logs не содержат passwords, bearer tokens, full cookies, full passports или document contents.  
(Logs do not contain passwords, bearer tokens, full cookies, full passports, or document contents.)

### OBS-004. Alerts

Повторяющиеся 500, upload failures, email outbox failures, payment callback failures и authentication spikes должны создавать operational signal.  
(Repeated 500 errors, upload failures, email outbox failures, payment callback failures, and authentication spikes must create an operational signal.)

---

## 22. Обязательная стратегия тестирования

### TEST-001. Requirement traceability

Каждое нормативное требование имеет автоматический тест, ручную проверку или явно документированную причину невозможности автоматизации.  
(Every normative requirement has an automated test, a manual check, or an explicitly documented reason why automation is impossible.)

### TEST-002. Уровни тестов

Проект должен иметь unit tests, schema/contract tests, backend integration tests, browser E2E, visual regression, accessibility checks и security-negative tests.  
(The project must have unit tests, schema/contract tests, backend integration tests, browser E2E, visual regression, accessibility checks, and security-negative tests.)

### TEST-003. Реальный UI

Критические сценарии выполняются через настоящий deployed UI с реальными click, type, upload, download и navigation действиями.  
(Critical journeys are executed through the real deployed UI using real click, type, upload, download, and navigation actions.)

### TEST-004. Много ролей

E2E использует отдельные browser contexts для суперадмина, ответственного региона, несвязанного региона, участника NNT, комиссии и руководителя.  
(E2E uses separate browser contexts for the superadmin, responsible region, unrelated region, NGO member, commission, and leader.)

### TEST-005. Доказательства

Тест сохраняет screenshots, trace, network outcome, entity IDs, relevant row counts, history events, notification IDs и file hashes.  
(A test stores screenshots, trace, network outcome, entity IDs, relevant row counts, history events, notification IDs, and file hashes.)

### TEST-006. Visual baseline

Ключевые экраны проверяются при 1440×900 и 390×844, а native-приложения на утверждённых физических iPhone, iPad и Android.  
(Key screens are verified at 1440×900 and 390×844, while native applications are verified on approved physical iPhone, iPad, and Android devices.)

### TEST-007. Shared-change impact

Изменение admin shell, shared CSS, API client, auth, RBAC или service worker запускает полный route sweep всех зависимых экранов.  
(A change to the admin shell, shared CSS, API client, auth, RBAC, or service worker triggers a full route sweep of every dependent screen.)

### TEST-008. Bug regression

Каждый исправленный production-дефект сначала воспроизводится тестом, а затем этот тест навсегда остаётся в regression suite.  
(Every fixed production defect is first reproduced by a test, and that test permanently remains in the regression suite.)

### TEST-009. Fixture safety

Тестовые сущности имеют уникальный prefix, явный provenance и обязательный teardown.  
(Test entities have a unique prefix, explicit provenance, and mandatory teardown.)

Production E2E не запускается без отдельного narrow flag и cleanup manifest.  
(Production E2E does not run without a separate narrow flag and cleanup manifest.)

---

## 23. Обязательный release gate

### REL-001. До merge

Перед merge должны пройти targeted tests, affected contract tests, lint, type/schema checks, visual impact checks и review diff.  
(Before merge, targeted tests, affected contract tests, lint, type/schema checks, visual impact checks, and diff review must pass.)

### REL-002. До deployment

Рабочие деревья должны быть чистыми, а все изменения — в task-scoped commits, входящих в production branch.  
(Worktrees must be clean, and all changes must be in task-scoped commits contained in the production branch.)

Frontend и backend release SHAs фиксируются в release manifest.  
(Frontend and backend release SHAs are recorded in a release manifest.)

### REL-003. Immutable artifact

Deployment выполняется из immutable build artifact, а не из изменяемого рабочего каталога.  
(Deployment is performed from an immutable build artifact rather than a mutable working directory.)

Artifact manifest содержит path, size и SHA-256 каждого deploy-файла.  
(The artifact manifest contains path, size, and SHA-256 for every deployed file.)

### REL-004. Staging

На staging выполняются route sweep, role matrix, critical E2E и visual comparison.  
(Staging runs the route sweep, role matrix, critical E2E, and visual comparison.)

### REL-005. Production

После deployment production hashes сравниваются с manifest, а custom domain проверяется отдельно от preview URL.  
(After deployment, production hashes are compared with the manifest, and the custom domain is verified separately from the preview URL.)

### REL-006. Cache

Cache purge или asset versioning выполняется только для затронутых assets через доказанный zone/project contract.  
(Cache purge or asset versioning is performed only for affected assets through a proven zone/project contract.)

Нельзя считать старый контент cache-проблемой без сравнения response headers и body hash.  
(Old content must not be labeled a cache problem without comparing response headers and body hashes.)

### REL-007. Rollback

Rollback использует предыдущий immutable artifact и проверенную совместимость базы.  
(Rollback uses the previous immutable artifact and verified database compatibility.)

### REL-008. Finish line

Release считается готовым, когда все blockers закрыты, critical journeys проходят, production hashes совпадают и известные остаточные проблемы классифицированы как non-blocking.  
(A release is ready when all blockers are closed, critical journeys pass, production hashes match, and known remaining issues are classified as non-blocking.)

Необязательное улучшение не должно бесконечно задерживать release.  
(Optional improvement must not indefinitely delay the release.)

---

## 24. Золотые сквозные сценарии

### GOLD-001. Новая региональная заявка

1. Анонимный пользователь подаёт новую организацию, которой нет в реестре.  
   (An anonymous user submits a new organization that is not in the registry.)
2. Создаётся одна заявка и один candidate organization.  
   (One application and one candidate organization are created.)
3. Заявка попадает правильному региону.  
   (The application reaches the correct region.)
4. Правильный регион получает уведомление, несвязанный регион не получает доступ.  
   (The correct region receives a notification, while an unrelated region receives no access.)
5. Региональный администратор генерирует четыре документа, заменяет один и добавляет supporting file.  
   (The regional administrator generates four documents, replaces one, and adds a supporting file.)
6. Он сохраняет без отправки, затем отдельно отправляет суперадмину.  
   (They save without forwarding, then separately forward to the superadmin.)
7. Суперадминистратор проверяет и отправляет руководителю.  
   (The superadmin reviews and forwards to the leader.)
8. Руководитель входит отдельной ролью и принимает пакет.  
   (The leader signs in under a separate role and accepts the package.)
9. Организация появляется в реестре один раз, документы и история сохраняются.  
   (The organization appears once in the registry, and documents and history persist.)

### GOLD-002. Республиканская заявка

Республиканская заявка направляется суперадмину, который готовит и заменяет документы и отправляет руководителю без регионального этапа.  
(A republic-level application routes to the superadmin, who prepares and replaces documents and forwards to the leader without a regional stage.)

### GOLD-003. Возврат пакета

Руководитель или суперадминистратор возвращает пакет с причиной, пакет разблокируется только для правильного предыдущего владельца, создаётся одно уведомление и сохраняется version history.  
(The leader or superadmin returns a package with a reason, the package unlocks only for the correct previous owner, one notification is created, and version history is preserved.)

### GOLD-004. Личный чат

Суперадминистратор открывает регионального пользователя дважды и оба раза получает один и тот же thread с сохранённой историей, файлами, reply и read receipts.  
(The superadmin opens the same regional user twice and receives the same thread both times, with persistent history, files, replies, and read receipts.)

### GOLD-005. Группа

Суперадминистратор создаёт группу с двумя региональными администраторами, отправляет сообщение и PDF, оба получают real-time update, а посторонний регион не получает доступ.  
(The superadmin creates a group with two regional administrators, sends a message and PDF, both receive a real-time update, and an unrelated region receives no access.)

### GOLD-006. Задача

Суперадминистратор назначает задачу региону с файлом и deadline, регион отвечает в discussion и завершает задачу, а история остаётся после нового login.  
(The superadmin assigns a task to a region with a file and deadline, the region responds in discussion and completes the task, and history remains after a new login.)

### GOLD-007. Комиссия

Председатель создаёт протокол, добавляет кандидатов и членов комиссии, члены голосуют один раз, председатель завершает протокол и скачивает финальный PDF.  
(The chair creates a protocol, adds candidates and commission members, members vote once, and the chair finalizes the protocol and downloads the final PDF.)

### GOLD-008. Реестр

Admin и public registry возвращают одинаковые канонические organization IDs, корректные totals, отсутствие duplicates и stable pagination по 20 элементов в admin.  
(Admin and public registry return the same canonical organization IDs, correct totals, no duplicates, and stable pagination of 20 items in admin.)

### GOLD-009. Upload failure

Один upload намеренно получает storage failure, после чего база и storage не содержат partial data; повтор успешен и создаёт ровно одну сущность.  
(One upload intentionally encounters a storage failure, after which the database and storage contain no partial data; retry succeeds and creates exactly one entity.)

### GOLD-010. Fresh session durability

Для каждой роли создаётся разрешённое событие, затем выполняются logout, новый login и чистый browser context, после чего данные и история остаются доступными только правильной роли.  
(For every role, an authorized event is created, followed by logout, a new login, and a clean browser context, after which data and history remain available only to the correct role.)

---

## 25. Постоянный список ранее известных регрессий

Следующие дефекты должны иметь отдельные автоматические regression tests и никогда не удаляться из suite без письменного изменения требования.  
(The following defects must have dedicated automated regression tests and must never be removed from the suite without a written requirement change.)

- Новая membership-заявка блокируется требованием существовать в реестре.  
  (A new membership application is blocked by a requirement to already exist in the registry.)
- Ташкентская заявка направляется только суперадмину и не уведомляет Ташкентского администратора.  
  (A Tashkent application routes only to the superadmin and does not notify the Tashkent administrator.)
- Кнопки `×` и `Yopish` не закрывают membership modal.  
  (The `×` and `Yopish` buttons do not close the membership modal.)
- Один платёж создаёт две pending Payme-строки.  
  (One payment creates two pending Payme rows.)
- Accepted-заявка показывает противоречивые действия или отсутствующие документы.  
  (An accepted application displays contradictory actions or missing documents.)
- Создание messaging group возвращает HTTP 500.  
  (Creating a messaging group returns HTTP 500.)
- Composer или send button обрезается на `/admin-messages`.  
  (The composer or send button is clipped on `/admin-messages`.)
- Chat icons отображаются пустыми кругами.  
  (Chat icons appear as empty circles.)
- Изменение общего admin-дизайна удаляет commission screens.  
  (A general admin design change removes commission screens.)
- Admin registry показывает одну организацию несколько раз.  
  (The admin registry shows one organization multiple times.)
- Разные экраны показывают разные totals NNT.  
  (Different screens show different NGO totals.)
- Generated membership documents имеют неправильный формат или template.  
  (Generated membership documents use an incorrect format or template.)
- Региональный или республиканский reviewer не может заменить документы до forwarding.  
  (A regional or republic-level reviewer cannot replace documents before forwarding.)
- Images или videos остаются серыми.  
  (Images or videos remain gray.)
- Grant AI возвращает `llm2_parse_failed`.  
  (Grant AI returns `llm2_parse_failed`.)
- Production показывает TEST banner или CODEX fixtures.  
  (Production displays a TEST banner or CODEX fixtures.)
- Удалённые admin-страницы возвращаются из stale cache или старого artifact.  
  (Removed admin pages return from stale cache or an old artifact.)
- App Review demo credentials не работают в release build.  
  (App Review demo credentials do not work in the release build.)
- Native login screen обрезается клавиатурой или показывает чёрную область.  
  (The native login screen is clipped by the keyboard or shows a black area.)

---

## 26. Формат обязательного отчёта

Каждая завершённая работа должна предоставлять следующий отчёт.  
(Every completed task must provide the following report.)

```text
Requirement IDs:
Canonical frontend repository / branch / SHA:
Canonical backend repository / branch / SHA:
Changed files:
Removed obsolete files and routes:
Targeted tests:
Affected contract tests:
Critical E2E journeys:
Roles tested:
Desktop routes tested:
Mobile routes tested:
Native devices tested:
Visual snapshots:
Console errors:
Unexpected 4xx/5xx:
Database entity IDs and row counts:
History and notification evidence:
File hashes:
Deployment ID:
Production hash comparison:
Known blockers:
Known non-blocking issues:
Rollback artifact and instructions:
Final repository status:
```

Фраза `all tests passed` допустима только вместе с точным перечнем тестов и непроверенных областей.  
(The phrase `all tests passed` is allowed only together with an exact list of tests and untested areas.)

---

## 27. Порядок стабилизации текущего проекта

1. Исправить правило Git, запрещающее анализ dirty diff и требующее автоматического удаления repository.  
   (Correct the Git rule that prohibits dirty-diff analysis and requires automatic repository deletion.)
2. Определить canonical remote branches и восстановить рабочие checkout из уже pushed commits.  
   (Identify canonical remote branches and restore working checkouts from already-pushed commits.)
3. Найти commit SHA каждого ранее утверждённого исправления.  
   (Find the commit SHA for every previously approved fix.)
4. Сопоставить эти SHA с Cloudflare Pages deployment и hosting.st production files.  
   (Map those SHAs to the Cloudflare Pages deployment and hosting.st production files.)
5. Найти все duplicate deploy sources, static copies, staging directories и service-worker entries.  
   (Find all duplicate deployment sources, static copies, staging directories, and service-worker entries.)
6. Создать автоматическую traceability matrix из требований этого документа.  
   (Create an automated traceability matrix from the requirements in this document.)
7. Сначала добавить regression tests для уже возвращавшихся дефектов.  
   (First add regression tests for defects that have already returned.)
8. Исправлять дефекты небольшими функциональными партиями.  
   (Fix defects in small functional batches.)
9. После каждой партии запускать весь затронутый route/role matrix и полный critical gate.  
   (After each batch, run the entire affected route/role matrix and the complete critical gate.)
10. Развёртывать только immutable artifacts с manifest и проверкой production hashes.  
    (Deploy only immutable artifacts with a manifest and production hash verification.)

---

## 28. Критерий окончательной готовности

NGO.UZ считается production-ready, когда выполнены все нормативные требования, относящиеся к утверждённому release scope.  
(NGO.UZ is considered production-ready when all normative requirements applicable to the approved release scope are satisfied.)

Все critical journeys должны проходить в реальном UI, а данные, история, уведомления и файлы должны иметь серверные доказательства.  
(All critical journeys must pass in the real UI, and data, history, notifications, and files must have server-side evidence.)

Production должен обслуживать точные проверенные artifacts, а frontend и backend должны соответствовать recorded release SHAs.  
(Production must serve the exact verified artifacts, and frontend and backend must match recorded release SHAs.)

Не должно оставаться известных P0 или P1 дефектов в release scope.  
(No known P0 or P1 defects may remain within the release scope.)

Оставшиеся улучшения должны быть явно классифицированы как post-release и не должны бесконечно расширять критерий завершения.  
(Remaining improvements must be explicitly classified as post-release and must not indefinitely expand the completion criterion.)

---

## 29. Правило изменения этой спецификации

Требование можно изменить только явным бизнес-решением с указанием изменённого requirement ID, причины и влияния на тесты.  
(A requirement may be changed only by an explicit business decision identifying the changed requirement ID, reason, and test impact.)

Код, который случайно ведёт себя иначе, не изменяет спецификацию.  
(Code that accidentally behaves differently does not change the specification.)

Удаление функции требует одновременного удаления её UI, routes, API, permissions, data contract, tests, cache entries и deploy artifacts либо документированной retention-причины для backend data.  
(Removing a feature requires simultaneous removal of its UI, routes, API, permissions, data contract, tests, cache entries, and deployment artifacts, or a documented retention reason for backend data.)

Эта спецификация должна храниться рядом с проектом, версионироваться и использоваться как обязательный вход для любой будущей задачи Codex, Claude или человека-разработчика.  
(This specification must be stored alongside the project, versioned, and used as mandatory input for every future Codex, Claude, or human developer task.)
