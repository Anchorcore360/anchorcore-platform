(function () {
  if (window.__rrtaPortalNavigationLoaded) return;
  window.__rrtaPortalNavigationLoaded = true;

  function addSharedPolish() {
    if (document.getElementById("rrta-shared-polish")) return;
    const style = document.createElement("style");
    style.id = "rrta-shared-polish";
    style.textContent = `
      .portal-side .brand{padding:8px 9px 15px!important;border-bottom:1px solid rgba(255,255,255,.09)!important}
      .rrta-brand-lockup{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;min-width:0;padding:4px 3px}
      .rrta-brand-mark{width:38px;height:38px;flex:0 0 38px;filter:drop-shadow(0 4px 9px rgba(0,0,0,.18))}
      .rrta-brand-copy{min-width:0;line-height:1.02}
      .rrta-brand-copy strong{display:block;color:#fff;font-size:13px;font-weight:950;letter-spacing:.055em;white-space:nowrap}
      .rrta-brand-copy span{display:block;color:#d6dce4;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;margin-top:5px;white-space:nowrap}
      .rrta-brand-accent{color:#ef4056!important}
      .accreditation-toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:16px 0 10px;padding:10px 12px;border:1px solid #e2e6ea;border-radius:10px;background:#f8f9fb}
      .accreditation-toolbar-copy strong{display:block;font-size:11px;color:#18202a}.accreditation-toolbar-copy span{display:block;font-size:9px;color:#6f7a88;margin-top:2px}
      .view-toggle{display:inline-flex;padding:3px;border:1px solid #d8dde4;border-radius:9px;background:#fff;box-shadow:0 2px 6px rgba(18,24,33,.04)}
      .view-toggle button{border:0;background:transparent;color:#586474;border-radius:7px;padding:7px 10px;font:inherit;font-size:9px;font-weight:850;cursor:pointer;display:flex;align-items:center;gap:5px}
      .view-toggle button.active{background:#20262d;color:#fff}
      .accreditation-grid-view{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:12px}
      .accreditation-card{position:relative;border:1px solid #e0e4e9;border-radius:13px;background:linear-gradient(180deg,#fff,#fafbfc);padding:16px;cursor:pointer;box-shadow:0 7px 18px rgba(18,24,33,.04);transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;min-height:180px}
      .accreditation-card:hover{transform:translateY(-2px);box-shadow:0 12px 25px rgba(18,24,33,.08);border-color:#d1a9af}
      .accreditation-card-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.accreditation-card h3{margin:10px 0 4px;font-size:15px;line-height:1.3;color:#18202a}.accreditation-card p{margin:0;color:#6f7a88;font-size:10px;line-height:1.45}
      .accreditation-card-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #e7eaee}.accreditation-card-meta span{font-size:9px;color:#75808e}.accreditation-card-meta strong{display:block;color:#313b47;font-size:10px;margin-top:3px}
      .accreditation-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:13px}.evidence-mini-btn{border:0;background:#b20f22;color:#fff;border-radius:8px;padding:7px 9px;font-size:9px;font-weight:850;cursor:pointer}.certificate-mini-link{display:inline-flex;align-items:center;text-decoration:none;border:1px solid #dce1e7;background:#fff;color:#313b47;border-radius:8px;padding:7px 9px;font-size:9px;font-weight:850}
      .accreditation-body-grid>table,.accreditation-body-grid>h3,.accreditation-body-grid>table+h3{display:none!important}.accreditation-body-list>.accreditation-grid-view{display:none!important}
      .list-evidence-btn{border:0;background:#b20f22;color:#fff;border-radius:7px;padding:6px 8px;font-size:8px;font-weight:850;cursor:pointer;white-space:nowrap}
      .rrta-evidence-drawer{position:fixed;inset:0;z-index:9999;background:rgba(17,23,31,.48);display:flex;justify-content:flex-end;backdrop-filter:blur(2px)}
      .rrta-evidence-drawer-panel{width:min(430px,94vw);height:100%;background:#fff;box-shadow:-20px 0 45px rgba(13,20,28,.18);padding:24px;overflow:auto;animation:rrtaSlide .18s ease-out}
      @keyframes rrtaSlide{from{transform:translateX(35px);opacity:.6}to{transform:none;opacity:1}}
      .rrta-drawer-head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;padding-bottom:16px;border-bottom:1px solid #e5e8ec}.rrta-drawer-head h2{margin:4px 0 0;font-size:20px}.rrta-close{border:0;background:#eef1f4;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer}.rrta-drawer-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}.rrta-drawer-meta div{padding:11px;border:1px solid #e4e7eb;border-radius:10px;background:#fafbfc}.rrta-drawer-meta span{display:block;color:#7a8491;font-size:9px}.rrta-drawer-meta strong{display:block;margin-top:4px;font-size:11px}.rrta-drawer-actions{display:grid;gap:9px;margin-top:20px}.rrta-drawer-actions .btn{justify-content:center;padding:11px}
      @media(max-width:1050px){.accreditation-grid-view{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:650px){.accreditation-grid-view{grid-template-columns:1fr}.rrta-brand-copy strong{font-size:12px}.rrta-brand-copy span{font-size:7px}}
    `;
    document.head.appendChild(style);
  }

  function applySharedBrand(side, type) {
    const brand = side.querySelector(".brand");
    if (!brand || brand.dataset.rrtaBrand === "1") return;
    brand.dataset.rrtaBrand = "1";
    const subtitle = type === "learner" ? "Learner Portal" : type === "workforce" ? "Workforce Platform" : "Training Academy";
    brand.innerHTML = `<a class="rrta-brand-lockup" href="${type === "learner" ? "learner-portal.html" : type === "workforce" ? "workforce.html" : "academy-admin.html"}" aria-label="Rapid Response ${subtitle}"><svg class="rrta-brand-mark" viewBox="0 0 42 42" role="img" aria-hidden="true"><defs><linearGradient id="rrtaBrandGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4243b"/><stop offset="1" stop-color="#980d1d"/></linearGradient></defs><path d="M6 3h24l6 6v24l-6 6H6L2 35V7z" fill="url(#rrtaBrandGradient)"/><path d="M12 11h12.2c5.2 0 8.8 2.8 8.8 7.4 0 3.3-1.9 5.7-5.2 6.8L34 32h-7.1l-5.3-6.1h-3.2V32H12V11zm6.4 5.3v4.6h5.2c1.9 0 3-.8 3-2.3 0-1.5-1.1-2.3-3-2.3h-5.2z" fill="#fff"/></svg><span class="rrta-brand-copy"><strong>RAPID <span class="rrta-brand-accent" style="display:inline;color:#ef4056">RESPONSE</span></strong><span>${subtitle}</span></span></a>`;
  }

  function wireLearnerAccreditationExperience() {
    const body = document.getElementById("accreditationBody");
    if (!body || body.dataset.rrtaExperienceWired === "1") return;
    body.dataset.rrtaExperienceWired = "1";
    const section = body.closest(".panel");
    if (!section) return;

    const toolbar = document.createElement("div");
    toolbar.className = "accreditation-toolbar";
    toolbar.innerHTML = `<div class="accreditation-toolbar-copy"><strong>Choose how you view your record</strong><span>Select an accreditation to view it or send replacement evidence for Academy review.</span></div><div class="view-toggle" role="group" aria-label="Accreditation view"><button type="button" data-acc-view="grid">▦ Grid</button><button type="button" data-acc-view="list">☷ List</button></div>`;
    body.parentNode.insertBefore(toolbar, body);

    const preference = localStorage.getItem("rrtaAccreditationView") || "grid";
    const setView = (mode) => {
      const actual = mode === "list" ? "list" : "grid";
      body.classList.toggle("accreditation-body-grid", actual === "grid");
      body.classList.toggle("accreditation-body-list", actual === "list");
      toolbar.querySelectorAll("[data-acc-view]").forEach((b) => b.classList.toggle("active", b.dataset.accView === actual));
      localStorage.setItem("rrtaAccreditationView", actual);
    };
    toolbar.querySelectorAll("[data-acc-view]").forEach((b) => b.onclick = () => setView(b.dataset.accView));
    setView(preference);

    function submitEvidenceFor(qualification, awarding) {
      if (typeof window.show === "function") window.show("requests");
      else location.hash = "requests";
      setTimeout(() => {
        const form = document.getElementById("evidenceForm");
        if (!form) return;
        const q = form.elements?.qualification;
        const a = form.elements?.awarding;
        if (q) q.value = qualification || "";
        if (a && awarding && awarding !== "—") a.value = awarding;
        form.scrollIntoView({ behavior: "smooth", block: "start" });
        if (form.querySelector('input[name="file"]')) form.querySelector('input[name="file"]').focus({ preventScroll: true });
      }, 60);
    }

    function openDrawer(data) {
      document.querySelector(".rrta-evidence-drawer")?.remove();
      const overlay = document.createElement("div");
      overlay.className = "rrta-evidence-drawer";
      overlay.innerHTML = `<aside class="rrta-evidence-drawer-panel" role="dialog" aria-modal="true" aria-label="Accreditation details"><div class="rrta-drawer-head"><div><div class="eyebrow">Accreditation Record</div><h2>${data.name}</h2></div><button class="rrta-close" type="button" aria-label="Close">×</button></div><div class="rrta-drawer-meta"><div><span>Awarding Body</span><strong>${data.awarding}</strong></div><div><span>Status</span><strong>${data.status}</strong></div><div><span>Issue Date</span><strong>${data.issue}</strong></div><div><span>Expiry Date</span><strong>${data.expiry}</strong></div></div><p style="font-size:11px;color:#687484;line-height:1.55">If you have a newer certificate or supporting evidence, send it to RRTA from here. It will go to the Training Academy review queue and will not replace your official record until it is approved.</p><div class="rrta-drawer-actions">${data.certificateHtml || ""}<button type="button" class="btn" data-submit-evidence>Submit / Update Evidence</button></div></aside>`;
      document.body.appendChild(overlay);
      const close = () => overlay.remove();
      overlay.querySelector(".rrta-close").onclick = close;
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
      overlay.querySelector("[data-submit-evidence]").onclick = () => { close(); submitEvidenceFor(data.nameText, data.awardingText); };
    }

    function enhance() {
      const table = body.querySelector("table");
      if (!table || table.dataset.rrtaEnhanced === "1") return;
      table.dataset.rrtaEnhanced = "1";
      const heading = [...body.querySelectorAll("h3")].find((h) => h.textContent.trim().toLowerCase().includes("course certificates"));
      const standaloneTable = heading?.nextElementSibling?.matches("table") ? heading.nextElementSibling : null;
      if (standaloneTable) standaloneTable.dataset.rrtaStandalone = "1";

      const headRow = table.querySelector("thead tr");
      if (headRow && !headRow.querySelector("[data-evidence-col]")) {
        const th = document.createElement("th");
        th.dataset.evidenceCol = "1";
        th.textContent = "Evidence";
        headRow.appendChild(th);
      }

      const grid = document.createElement("div");
      grid.className = "accreditation-grid-view";
      table.querySelectorAll("tbody tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 6) return;
        const nameText = cells[0].textContent.trim();
        const awardingText = cells[1].textContent.trim();
        const issue = cells[2].textContent.trim();
        const expiry = cells[3].textContent.trim();
        const status = cells[4].textContent.trim();
        const certLinks = [...cells[5].querySelectorAll("a")];
        const viewLink = certLinks.find((a) => /view/i.test(a.textContent));
        const downloadLink = certLinks.find((a) => /download/i.test(a.textContent));
        const safe = (s) => String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c]);
        const statusClass = /expired/i.test(status) ? "bad" : /expiring/i.test(status) ? "warn" : "good";
        const card = document.createElement("article");
        card.className = "accreditation-card";
        card.tabIndex = 0;
        card.innerHTML = `<div class="accreditation-card-top"><span class="pill ${statusClass}">${safe(status)}</span><span style="font-size:9px;color:#86909c;font-weight:800">VIEW DETAILS →</span></div><h3>${safe(nameText)}</h3><p>${safe(awardingText)}</p><div class="accreditation-card-meta"><span>Issued<strong>${safe(issue)}</strong></span><span>Expires<strong>${safe(expiry)}</strong></span></div><div class="accreditation-card-actions">${viewLink ? `<a class="certificate-mini-link" href="${viewLink.href}" target="_blank" rel="noopener">View certificate</a>` : ""}${downloadLink ? `<a class="certificate-mini-link" href="${downloadLink.href}" download>Download</a>` : ""}<button class="evidence-mini-btn" type="button">Add evidence</button></div>`;
        const data = { name: safe(nameText), nameText, awarding: safe(awardingText), awardingText, issue: safe(issue), expiry: safe(expiry), status: safe(status), certificateHtml: viewLink ? `<a class="btn" href="${viewLink.href}" target="_blank" rel="noopener" style="background:#20262d;text-align:center">Open Current Certificate</a>` : "" };
        card.addEventListener("click", (e) => { if (!e.target.closest("a,button")) openDrawer(data); });
        card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(data); } });
        card.querySelector(".evidence-mini-btn").onclick = (e) => { e.stopPropagation(); submitEvidenceFor(nameText, awardingText); };
        grid.appendChild(card);

        const td = document.createElement("td");
        td.innerHTML = `<button class="list-evidence-btn" type="button">Add evidence</button>`;
        td.querySelector("button").onclick = () => submitEvidenceFor(nameText, awardingText);
        row.appendChild(td);
        row.style.cursor = "pointer";
        row.addEventListener("click", (e) => { if (!e.target.closest("a,button")) openDrawer(data); });
      });
      body.insertBefore(grid, table);
      setView(localStorage.getItem("rrtaAccreditationView") || "grid");
    }

    const observer = new MutationObserver(enhance);
    observer.observe(body, { childList: true, subtree: true });
    enhance();
  }

  function boot() {
    const nav = window.RRTAPlatformNavigation,
      type = document.body.dataset.portalNav;
    if (!nav || !nav.menus[type]) return;
    addSharedPolish();
    const side = document.querySelector(
      type === "learner" ? ".sidebar" : ".side",
    );
    if (!side) return;
    side.classList.add("portal-side");
    applySharedBrand(side, type);
    const shell = side.closest(".shell,.portal-shell");
    if (shell) shell.classList.add("portal-shell-standard");
    const current = new URL(location.href),
      page = (current.pathname.split("/").pop() || "").toLowerCase(),
      icon = nav.icon;
    const active = (href) => {
      const target = new URL(href, location.href),
        targetPage = (target.pathname.split("/").pop() || "").toLowerCase();
      if (page !== targetPage) return false;
      if (target.search) {
        for (const [k, v] of target.searchParams) {
          if (current.searchParams.get(k) !== v) return false;
        }
      } else if (
        current.search &&
        targetPage === page &&
        [
          "courses.html",
          "workforce-directory.html",
          "external-customers.html",
        ].includes(page)
      )
        return false;
      if (target.hash) {
        if (target.hash !== current.hash) return false;
      } else if (
        current.hash &&
        targetPage === page &&
        ["learner-portal.html", "workforce.html"].includes(page)
      )
        return false;
      return true;
    };
    const link = (label, ic, href, id = "") =>
      `<a ${id ? `id="${id}"` : ""} class="portal-nav-link${active(href) ? " active" : ""}" href="${href}">${icon(ic)}<span>${label}</span></a>`;
    const menu = nav.menus[type]
      .map((item) => {
        if (item.type === "section")
          return `<div class="portal-nav-label">${item.label}</div>`;
        if (item.type === "link") return link(item.label, item.icon, item.href);
        if (item.type === "group") {
          const groupActive = item.items.some(([, , href]) => active(href));
          return `<div class="portal-nav-group${groupActive ? " current" : ""}" data-group="${item.label}"><button class="portal-nav-parent${groupActive ? " active" : ""}" type="button">${icon(item.icon)}<span>${item.label}</span><span class="portal-nav-chevron">›</span></button><template class="portal-nav-template">${item.items.map(([label, ic, href]) => link(label, ic, href)).join("")}</template></div>`;
        }
        return "";
      })
      .join("");
    const switches =
      type === "academy"
        ? `${link("My Learning", "course", "learner-portal.html")}${link("Portal Home", "dashboard", "portal.html")}`
        : type === "workforce"
          ? `${link("Academy Administration", "course", "academy-admin.html", "academyLink")}${link("Portal Home", "dashboard", "portal.html")}`
          : "";
    side
      .querySelectorAll(
        ".nav,.label,.side-title,.course-sub,.portal-switch,.portal-nav,.portal-nav-label,.portal-nav-group",
      )
      .forEach((n) => n.remove());
    const spacer = side.querySelector(".spacer"),
      account = side.querySelector(".account,.user-box"),
      logout = side.querySelector("#logout,#logoutBtn");
    const box = document.createElement("div");
    box.innerHTML = `<div class="portal-nav-label">${type === "academy" ? "Academy Control Centre" : type === "workforce" ? "RRT Workforce Management" : "RRT Learner Portal"}</div><nav class="portal-nav">${menu}</nav>${switches ? `<div class="portal-switch"><nav class="portal-nav">${switches}</nav></div>` : ""}`;
    const frag = document.createDocumentFragment();
    while (box.firstChild) frag.appendChild(box.firstChild);
    const anchor = spacer || account || logout;
    if (anchor) side.insertBefore(frag, anchor);
    else side.appendChild(frag);
    let overlay = null,
      activeGroup = null;
    function closeFlyout() {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
      if (activeGroup) {
        activeGroup.classList.remove("open");
        activeGroup = null;
      }
    }
    function openFlyout(group, btn) {
      closeFlyout();
      const tpl = group.querySelector(".portal-nav-template");
      if (!tpl) return;
      group.classList.add("open");
      activeGroup = group;
      overlay = document.createElement("div");
      overlay.className = "portal-nav-global-flyout";
      overlay.innerHTML = tpl.innerHTML;
      document.body.appendChild(overlay);
      const r = btn.getBoundingClientRect();
      const maxTop = Math.max(
        10,
        window.innerHeight - overlay.offsetHeight - 10,
      );
      overlay.style.top = Math.min(r.top - 4, maxTop) + "px";
      overlay.style.left = r.right + 10 + "px";
      overlay
        .querySelectorAll("a")
        .forEach((a) => a.addEventListener("click", () => closeFlyout()));
    }
    side.querySelectorAll(".portal-nav-parent").forEach(
      (btn) =>
        (btn.onclick = (e) => {
          e.stopPropagation();
          const g = btn.closest(".portal-nav-group");
          if (activeGroup === g) {
            closeFlyout();
            return;
          }
          openFlyout(g, btn);
        }),
    );
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".portal-nav-global-flyout") &&
        !e.target.closest(".portal-nav-group")
      )
        closeFlyout();
    });
    window.addEventListener("scroll", closeFlyout, true);
    window.addEventListener("resize", closeFlyout);
    side.querySelectorAll("a[href]").forEach((a) =>
      a.addEventListener("click", (e) => {
        const u = new URL(a.href, location.href);
        if (
          u.pathname === location.pathname &&
          u.hash &&
          typeof window.show === "function"
        ) {
          e.preventDefault();
          const view = u.hash.slice(1);
          window.show(
            view === "compliance" && type === "learner" ? "compliance" : view,
          );
          history.replaceState(null, "", u.hash);
          side
            .querySelectorAll(".portal-nav-link")
            .forEach((x) => x.classList.remove("active"));
          a.classList.add("active");
        }
      }),
    );
    if (page === "external-customers.html") {
      const requested = current.searchParams.get("view") || "all";
      setTimeout(() => {
        const f = document.getElementById("filter");
        if (f && ["all", "rrt", "rrta", "both"].includes(requested)) {
          f.value = requested;
          f.dispatchEvent(new Event("input", { bubbles: true }));
          f.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, 0);
    }
    wireProjectManagePages(page);
    if (type === "academy") cleanAcademyDashboard();
    if (type === "learner" && page === "learner-portal.html") setTimeout(wireLearnerAccreditationExperience, 0);
  }
  function wireProjectManagePages(page) {
    if (page === "manage-companies.html") {
      setTimeout(() => {
        const b = document.getElementById("newCompany");
        if (b) b.onclick = () => (location.href = "add-company.html");
        const wireCards = () =>
          document
            .querySelectorAll(".company-card[data-id]")
            .forEach((card) => {
              if (card.dataset.profileWired) return;
              card.dataset.profileWired = "1";
              card.onclick = () =>
                (location.href = `company-profile.html?id=${encodeURIComponent(card.dataset.id)}`);
              card.title = "Open company profile";
            });
        wireCards();
        const list = document.getElementById("companyList");
        if (list)
          new MutationObserver(wireCards).observe(list, {
            childList: true,
            subtree: true,
          });
      }, 0);
    }
    if (page === "manage-person.html") {
      const s = document.createElement("script");
      s.src = "smart-awards-profile.js?v=20260913-1";
      document.body.appendChild(s);
    }
  }
  function cleanAcademyDashboard() {
    if (
      (location.pathname.split("/").pop() || "").toLowerCase() !==
      "academy-admin.html"
    )
      return;
    const head = document.querySelector(".head p.muted");
    if (head)
      head.textContent =
        "Manage RRT compliance, academy delivery and external customers from one control centre.";
    document.querySelectorAll(".workspace").forEach((card) => {
      const title = card.querySelector("strong");
      if (!title) return;
      const label = title.textContent.trim();
      if (label === "Workforce Administration") {
        card.href = "compliance-operatives.html";
        title.textContent = "Compliance Overview";
        const s = card.querySelector("span");
        if (s)
          s.textContent =
            "See workforce compliance across RRT, then drill into people, teams, managers and job-role gaps.";
      }
      if (label === "Reports") {
        card.href = "reports.html";
        const s = card.querySelector("span");
        if (s)
          s.textContent =
            "Compliance, expiry, booking and training history reporting.";
      }
    });
    const panel = [...document.querySelectorAll(".panel")].find(
      (x) => x.querySelector("h2")?.textContent.trim() === "Platform Boundary",
    );
    if (panel) {
      const h = panel.querySelector("h2");
      if (h) h.textContent = "How The Platform Is Split";
      const p = panel.querySelector("p.muted");
      if (p)
        p.innerHTML =
          "<strong>Academy Administration</strong> has full control. <strong>Workforce Management</strong> is the restricted manager view. <strong>Learner Portal</strong> is the individual self-service view.";
    }
  }
  const s = document.createElement("script");
  s.src = "platform-navigation.js";
  s.onload = boot;
  document.head.appendChild(s);
})();
