# Optional Skill Routing

## OPTIONAL SKILLS

### Opt-PROJ — Project UI Conventions
**Trigger:** User yeu cau dung design system, brand token, component library hoac UI convention cua project
**Classify truoc khi load skill** (quyet dinh nay khong co trong ref):
- User muon *styling component hien co*? → ap dung project token, giu layout hien tai
- User muon *man hinh moi*? → thiet ke IA truoc, chon component project phu hop
- User noi "clone", "recreate", "y het"? → chi sao chep composition khi co reference va quyen su dung ro rang
**Ref:** `.agents/skills/project-ui-conventions/SKILL.md`

### Opt-FD — Frontend Design (khong co project-specific design system)
**Trigger:** "design", "layout", "animation", "dark mode", "component", "CSS"
**Anti-patterns (check TRUOC khi design, khong can doc ref):**
- Purple/indigo khong lam mau chu dao tru khi user yeu cau ro
- Khong mac dinh Bento grid, glass morphism, blue SaaS template
- Design commitment bat buoc: xac dinh topology va cliche can tranh truoc khi code
- Server Component mac dinh; `use client` chi khi can interaction
**Ref:** `.agents/skills/frontend-design/reference.md` + `ui-ux-pro-max/reference.md`

### Opt-ORC — Orchestrate
**Trigger:** >=3 domain doc lap co the chay song song (VD: backend + frontend + DB + security)
**KHONG dung** neu task chi cham 1-2 domain — dung plan-master thay the
**Contract bat buoc:**
- Phase 1 (sequential): project-planner tao PLAN.md → xin user approve → moi dispatch
- Phase 2 (parallel): moi subagent PHAI nhan du: Original request + Decision record + Plan state + Work summary den hien tai
- Thieu context passing = subagent lam sai scope
**Ref:** `/orchestrate workflow`

---
