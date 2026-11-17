// Demo recommendations are scoped to the first HR vacancy; employee pages use their own data.
(() => {
  const { Avatar } = window.SkillazCoreDesignSystem_bf9566;
  const { Icons } = window.Site;
  function IconExternal({ size = 16 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h6v6m0-6L10 14M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  function IconChart({ size = 26 }) {
    return <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" /><path d="M8 20v-8m6 8V7m6 13v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  }
  function IconCompass({ size = 27 }) {
    return <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" /><path d="m19 9-3 7-7 3 3-7 7-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
  }
  const employees = [
    { id: "yaroslav", name: "Виноградов Ярослав", position: "Начальник планово — экономического отдела", department: "Планово-экономический отдел", percent: 90, photo: "avatar-male.jpg", phone: "+7 999 888 1234", email: "ya.vinogradov@company.com" },
    { id: "darya", name: "Белозёрова Дарья", position: "Менеджер отдела продаж", department: "Департамент продаж", percent: 85, photo: "avatar-female.jpg", phone: "+7 916 500 2381", email: "d.belozerova@company.com", isNew: true },
    { id: "victoria", name: "Миронова Виктория", position: "Младший специалист по обучению и развитию", department: "Департамент обучения и развития", percent: 81, photo: "avatar-female.jpg", phone: "+7 916 500 1427", email: "v.mironova@company.com" },
    { id: "dmitry", name: "Иванов Дмитрий Александрович", position: "Специалист поддержки", department: "Контактный центр", percent: 79, photo: "avatar-male.jpg", phone: "+7 916 500 1263", email: "d.ivanov@company.com" },
    { id: "anna", name: "Миронова Анна", position: "Младший специалист по обучению и развитию", department: "Департамент обучения и развития", percent: 72, photo: "avatar-female.jpg", phone: "+7 916 500 1864", email: "a.mironova@company.com" },
    { id: "petr", name: "Петров Дмитрий", position: "Младший специалист по обучению и развитию", department: "Департамент обучения и развития", percent: 70, photo: "avatar-male.jpg", phone: "+7 916 500 1492", email: "d.petrov@company.com" },
    { id: "sidorov", name: "Сидоров Дмитрий", position: "Младший специалист по обучению и развитию", department: "Департамент обучения и развития", percent: 70, photo: "avatar-male.jpg", phone: "+7 916 500 1728", email: "d.sidorov@company.com" },
  ];

  function useRecommendations() {
    const [viewed, setViewed] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [updatedAt, setUpdatedAt] = React.useState("11 ноября");
    const [fresh, setFresh] = React.useState(false);
    const timer = React.useRef(null);
    React.useEffect(() => () => window.clearTimeout(timer.current), []);
    function refresh() {
      if (loading) return;
      setLoading(true);
      timer.current = window.setTimeout(() => {
        setLoading(false);
        setUpdatedAt(new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: "Europe/Moscow" }).format(new Date()));
        setFresh(true);
      }, 1500);
    }
    function cancel() { window.clearTimeout(timer.current); setLoading(false); }
    return {
      employees: employees.map(e => ({ ...e, viewed: viewed.includes(e.id), isNew: (e.isNew || (fresh && e.id === "sidorov")) && !viewed.includes(e.id) })),
      loading, updatedAt, refresh, cancel,
      hasNew: employees.some(e => e.isNew && !viewed.includes(e.id)) || (fresh && !viewed.includes("sidorov")),
      markViewed: id => setViewed(previous => previous.includes(id) ? previous : [...previous, id]),
    };
  }

  function PersonAvatar({ employee, size = 32 }) {
    return <Avatar name={employee.name} src={"../assets/" + employee.photo} size={size} />;
  }

  function Match({ value }) {
    return <span className={"ai-match" + (value < 80 ? " ai-match-blue" : "")} title="Соответствие вакансии">{value}%</span>;
  }

  function Refresh({ refresh }) {
    return <button type="button" className="ai-refresh" onClick={refresh}><Icons.IconSparkles size={16} />Обновить рекомендации</button>;
  }

  function Loading({ cancel }) {
    return <div className="ai-loading" role="status" aria-live="polite">
      <div className="ai-loading-track"><span /></div>
      <strong>Пожалуйста, подождите…</strong><span>Подбираем лучших кандидатов</span>
      <button type="button" className="ai-cancel" onClick={cancel}>Отменить</button>
    </div>;
  }

  function RecommendationCard({ employees, updatedAt, loading, refresh, cancel, onOpen, onShowAll }) {
    return <section className="ai-recommendation-panel" aria-label="AI-рекомендации">
      <h2>AI - рекомендации <Icons.IconSparkles size={19} color="#a563ff" /></h2>
      {!loading && <div className="ai-updated"><Icons.IconCalendar size={14} />от {updatedAt}</div>}
      {loading ? <Loading cancel={cancel} /> : <>
        <div className="ai-person-list">
          {employees.slice(0, 5).map(employee => <button type="button" key={employee.id} className="ai-person-row" onClick={() => onOpen(employee)} aria-label={"Открыть основания рекомендации: " + employee.name}>
            <PersonAvatar employee={employee} />
            <span className="ai-person-name"><span>{employee.name}</span><small title={employee.position}>{employee.position}</small></span>
            <Match value={employee.percent} />
          </button>)}
        </div>
        {employees.length > 5 && <button type="button" className="ai-show-all" onClick={onShowAll}>Смотреть все</button>}
        <Refresh refresh={refresh} />
      </>}
    </section>;
  }

  function RecommendationTab({ employees, loading, refresh, cancel, onOpen }) {
    return <div className="ai-recommendations-tab">
      <div className="ai-info"><Icons.IconInfo size={18} color="var(--sk-icon-accent)" /><span>AI помощник нашёл сотрудников, которые могут подойти на вакансию. Сопоставили их компетенции, пройденное обучение и интересы с требованиями из вакансии. Откройте карточку, чтобы узнать, почему они попали в рекомендации.</span></div>
      {loading ? <Loading cancel={cancel} /> : <div className="ai-candidate-grid">
        {employees.map(employee => <button type="button" key={employee.id} className={"ai-candidate-card" + (employee.viewed ? " is-viewed" : "")} onClick={() => onOpen(employee)} aria-label={"Открыть основания рекомендации: " + employee.name}>
          {employee.isNew && <span className="ai-new-label">Новое</span>}
          <span className="ai-candidate-top"><PersonAvatar employee={employee} size={40} /><span className="ai-candidate-name"><strong>{employee.name}</strong><small>{employee.position}</small></span><span className="ai-candidate-spark"><Icons.IconSparkles size={16} /></span></span>
          <span className="ai-candidate-bottom"><span><small>Соответствие</small><span className="ai-candidate-match"><Match value={employee.percent} />{employee.viewed && <span className="ai-viewed"><Icons.IconCheck size={12} />Просмотрено</span>}</span></span><span className="ai-more">Подробнее <Icons.IconChevronRight size={12} /></span></span>
        </button>)}
      </div>}
      {!loading && <div className="ai-tab-refresh"><Refresh refresh={refresh} /></div>}
    </div>;
  }

  function SkillTags({ tags, colorful = false }) {
    return <div className="ai-skill-tags">{tags.map((tag, i) => <span key={tag} className={colorful ? "ai-tag-color-" + i : ""}>{tag}</span>)}</div>;
  }

  function EvidenceSection({ title, subtitle, icon, children, href }) {
    return <section className="ai-evidence-section">
      <div className="ai-evidence-heading"><span className="ai-evidence-icon">{icon}</span><div><h3>{title}</h3><p>{subtitle}{href && <a href={href} title={title === "Навыки" ? "Открыть полный отчёт" : "Перейти в ИПР"}><IconExternal size={15} /></a>}</p></div></div>
      {children}
    </section>;
  }

  function RecommendationModal({ employee, vacancy, onClose }) {
    const dialog = React.useRef(null);
    const closeButton = React.useRef(null);
    const closeHandler = React.useRef(onClose);
    closeHandler.current = onClose;
    React.useEffect(() => {
      const previous = document.activeElement;
      closeButton.current.focus();
      function handleKey(event) {
        if (event.key === "Escape") { event.stopPropagation(); closeHandler.current(); }
        if (event.key === "Tab") {
          const focusable = dialog.current.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]');
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener("keydown", handleKey);
      return () => { document.removeEventListener("keydown", handleKey); if (previous && previous.isConnected) previous.focus(); };
    }, []);
    const tags = ["Анализ количественных данных", "Наставничество и развитие команды", "Управление собой"];
    return ReactDOM.createPortal(<div className="ai-modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="ai-reason-modal" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="ai-reason-title">
        <header><h2 id="ai-reason-title">Основания рекомендации на вакансию «{vacancy.title}»</h2><button type="button" ref={closeButton} onClick={onClose} aria-label="Закрыть основания рекомендации"><Icons.IconX size={20} /></button></header>
        <div className="ai-modal-content sk-scroll">
          <section className="ai-employee-summary">
            <PersonAvatar employee={employee} size={44} />
            <div className="ai-employee-details"><a className="ai-profile-link" href="../stub.html?role=hr&section=profile" title="Перейти в профиль"><strong>{employee.name}</strong><IconExternal size={14} /></a><div>{employee.position}</div><p>{employee.department}</p><div className="ai-employee-contacts"><a href={"tel:" + employee.phone.replace(/\s/g, "")}><Icons.IconPhone size={14} />{employee.phone}</a><a href={"mailto:" + employee.email}><Icons.IconMail size={14} />{employee.email}</a></div></div>
            <div className="ai-summary-match"><small>Соответствие</small><Match value={employee.percent} /></div>
          </section>
          <EvidenceSection title="Навыки" subtitle="Уровень владения навыками из вакансии по результатам Оценки 360" icon={<IconChart size={26} />} href="../stub.html?role=hr&section=report360">
            <div className="ai-evidence-body ai-skills">{[["Стратегическое мышление", "8.1"], ["Инициативность", "7.5"], ["Экспертиза в области (hard skills)", "6.8"]].map(([name, score], i) => <div key={name}><span>{name}</span><span className={"ai-skill-score" + (i === 2 ? " is-warning" : "")}>{score}</span></div>)}</div>
          </EvidenceSection>
          <EvidenceSection title="Курсы" subtitle="Курсы, в которых сотрудник развил навыки, требуемые для вакансии" icon={<Icons.IconGraduationCap size={27} />}>
            <div className="ai-course"><div className="ai-course-name"><span className="ai-course-cover"><Icons.IconBookOpen size={20} /></span>Работа с REST API: интеграция данных в веб-приложения</div><p>Развиты навыки:</p><SkillTags tags={tags} colorful /></div>
            <div className="ai-course"><div className="ai-course-name"><img src="../assets/cover%2002.png" alt="" />Figma для Senior designer. Секреты мастерства 2025</div><p>Развиты навыки:</p><SkillTags tags={[tags[0], tags[2]]} /></div>
          </EvidenceSection>
          <EvidenceSection title="ИПР" subtitle="Сотрудник успешно завершил ИПР по развитию навыков, необходимых для вакансии" icon={<Icons.IconTarget size={27} />}>
            <div className="ai-evidence-body"><a className="ai-plan-link" href="../employee/plan.html" title="Перейти в ИПР"><Icons.IconTarget size={20} />Развитие навыков с Middle до уровня Senior дизайнер<IconExternal size={14} /></a><p className="ai-caption">Развиты навыки:</p><SkillTags tags={tags.slice(1)} /></div>
          </EvidenceSection>
          <EvidenceSection title="Интересы" subtitle="Навыки, которые сотрудник указал в качестве желаемых к развитию, подходящие под вакансию" icon={<IconCompass size={27} />}>
            <div className="ai-evidence-body"><SkillTags tags={tags} colorful /></div>
          </EvidenceSection>
        </div>
      </div>
    </div>, document.body);
  }

  window.VacancyRecommendations = { RecommendationCard, RecommendationTab, RecommendationModal, useRecommendations };
})();
