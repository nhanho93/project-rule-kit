---
name: project-delivery-pipeline
description: >-
  Reusable end-to-end project delivery pipeline covering planning, implementation,
  host-aware browser QC, evidence, and a bundled Browser MCP X fallback. Use for
  project-delivery-pipeline, full-pipeline, plan+qc, or design+qc work.
---
# Project Delivery Pipeline

> Pipeline: Brainstorm -> Plan -> Implement -> Hybrid QC -> Evidence Commit

---

## ⚠️ MANDATORY EXECUTION PROTOCOL (P0 BẮT BUỘC)

1. **FIRST TOOL CALL MANDATE (ĐỌC FILE SKILL ĐẦU TIÊN):**
   - Khi user gọi `/project-delivery-pipeline` hoặc đề cập `project-delivery-pipeline`, Tool Call ĐẦU TIÊN của Agent **BẮT BUỘC** phải là `view_file` tới `.agents/skills/project-delivery-pipeline/SKILL.md`.
   - **KHÔNG ĐƯỢC PHÉP** gọi bất kỳ tool sửa code/chẩn đoán nào khác trước khi hoàn thành lệnh `view_file` này.

2. **PHÂN LOẠI QUY TRÌNH THỰC THI (SIMPLE TWEAK VS LARGE TASK):**
   - **⚡ SIMPLE TWEAK (Chỉnh sửa nhỏ 1 file CSS/Fix typo/Spacing):**
     - *Nhận diện:* Sửa 1 file CSS/TSX đơn lẻ, không chạm DB/API/Data flow, không có rủi ro breaking change.
     - *Quy trình:* Thực thi sửa code trực tiếp (Inline Edit) -> Chạy lint/vitest verify -> Báo cáo ngắn gọn. KHÔNG bắt buộc tạo Plan Master rườm rà.
   - **🚀 LARGE / COMPLEX TASK (Feature mới / Task ≥2 file / DB Schema / Redesign UI / QC):**
     - *Nhận diện:* Chạm ≥2 file, thay đổi DB/Migration, Auth/RBAC, redesign UI, hoặc có yêu cầu QC.
     - *Quy trình:* BẮT BUỘC tuân thủ đúng thứ tự Pipeline bên dưới, KHÔNG NHẢY CÓC:
       `Gate A ➔ Gate B ➔ Gate C ➔ Gate D ➔ Phase Close`

3. **🚫 PHASE CLOSE HARD GATE — BLOCKING (Large Task):**
   **CHÍNH SÁCH CHỐNG NHẢY CÓC (ANTI-SHORTCUT ENFORCEMENT):**
   - **NGHIÊM CẤM** tự viết evidence hoặc đánh dấu hoàn tất nếu chưa có trajectory và screenshot/artifact từ browser surface hợp lệ.
   - Khi chạy Gate D với ứng dụng web/UI: BẮT BUỘC phải thực hiện 2 bước tool call thật:
     1. Khởi chạy dev server local (`npm run dev` hoặc tương đương).
     2. Kiểm tra native browser tool. Nếu khả dụng thì dùng native; nếu không, chạy bundled Browser MCP X preflight/installer rồi dùng MCP trong session mới.
   - Không ghi `todo/handover/pending_todo` là COMPLETED cho đến khi:
     - `tsc --noEmit` + `eslint` + `vitest` → 0 error
     - Có migration → `npm run check:migration-applied` exit 0
     - Native browser hoặc Browser MCP X đã có tool trajectory và screenshot/artifact hợp lệ (Gate D)
   - Nếu chưa có browser trajectory thật từ surface đã khai báo, PHASE CLOSE bị KHÓA CỨNG. Agent không được tuyên bố hoàn tất 100%.

---

## 1. TASK CLASSIFIER

| Tin hieu tu request | Pipeline |
|---|---|
| "idea", "y tuong", "co nen", "brainstorm" | Gate A |
| "plan", "len ke hoach", feature >=2 wave, DB schema | Gate B |
| "implement", "lam", "code" + spec ro | Gate C |
| "QC", "test", "kiem tra giao dien", "screenshot" | Gate D |
| UI + project/brand conventions | Opt-PROJ |
| UI khong co project/brand conventions | Opt-FD |
| >=3 domain song song | Opt-ORC |

---

## 2. SKILL LOADING MAP (Lazy Load — chi doc khi gate duoc kich hoat)

> **KHONG** doc het tat ca skills truoc khi quyet dinh. Doc routing table nay -> xac dinh gate -> load dung skill do.

| Gate | Trigger chinh xac | Load skill nay | Khi nao load |
|---|---|---|---|
| **Gate A** | Request thieu: muc tieu / user / scope / constraint / edge case | `brainstorming/reference.md` | Truoc khi hoi cau dau tien |
| **Gate B** | Request co: "plan", schema, migration, feature cham >=2 file/wave | `plan-master/SKILL.md` | Truoc Phase 0 Discovery |
| **Gate C** | Da co MASTER/task-detail + operator GO | `bounded-wave-execution/SKILL.md` | Truoc package implementation dau tien; moi package tu quyet dinh E2E REQUIRED/NOT_REQUIRED |
| **Gate C + UI** | Gate C va task co CSS/component/layout | + `frontend-design/reference.md` HOAC `project-ui-conventions/SKILL.md` | Truoc khi viet code UI |
| **Gate D — E2E** | Wave implement xong; can chay browser test | `e2e-qc/SKILL.md` | Bat dau QC session |
| **Gate D — Visual** | E2E mo trang xong HOAC task la pure visual audit | `frontend-ui-qc/SKILL.md` | Song song voi hoac sau E2E |
| **Gate D — Design** | Component co form/input/contrast | `web-design-guidelines/reference.md` | Truoc khi viet evidence |
| **Opt-PROJ** | Request yeu cau dung design system, brand token, component library hoac UI convention cua project | `project-ui-conventions/SKILL.md` | Truoc khi design/code UI |
| **Opt-FD** | UI/UX task khong Opt-PROJ; user noi "design", "layout", "animation" | `frontend-design/reference.md` + `ui-ux-pro-max/reference.md` | Truoc khi design/code UI |
| **Opt-ORC** | >=3 domain doc lap can chay song song | `/orchestrate workflow` | Truoc khi dispatch subagent |

**Quy tac load:**
- Load **toi da** skill tuong ung voi gate dang chay — khong pre-load
- Neu co nghi ngo gate nao: chon gate it rui ro hon (A truoc B, B truoc C)
- Neu task cham nhieu gate cung luc: load theo thu tu A -> B -> C -> D



## 2. GATE A -- SOCRATIC BRAINSTORM

**Khi nao:** Request mo ho, y tuong chua ro scope.

- Hoi toi thieu 3 cau (muc tieu, nguoi dung, edge case)
- Tinh nang moi: hoi them "Tich hop hay tach biet?", "Can QC ngay hay defer?"
- **Output:** Decision Record (Scope, User Story, Constraints, QC level)
- **Ref:** `.agents/skills/brainstorming/reference.md`

---

## 3. GATE B -- PLAN MASTER SSOT

**Phase 0 Discovery (BAT BUOC truoc khi viet plan)**

```
[ ] Glob file lien quan (schema, components, API, services)
[ ] Xac dinh reuse vs net-new (%)
[ ] Kiem tra migration pending
```

**Phase 1-N Plan Authoring** — output: `tasks/plans/{SLUG}-MASTER-YYYYMMDD.md`

```markdown
## Overview | ## Wave Map | ## Wave A: Tasks / QC Spec / Evidence | ## DB Migration | ## Open Questions
```

**Phase Post** — output: `tasks/plans/{SLUG}-IMPACT-YYYYMMDD.md`
Verify path/DB; GO / NO-GO. **Khong dispatch Wave A cho den khi GO.**

**Ref:** `.agents/skills/plan-master/SKILL.md`

---

## 4. GATE C -- IMPLEMENT

- **Truoc khi code:** Doc MASTER plan, xac nhan task thuoc wave nao, scope gi
- clean-code: <=100 lines/function, <=200 lines/file
- tsc --noEmit sau moi file; khong commit neu fail
- task.md: [/] khi bat dau, [x] khi xong
- Co UI? -> doc Opt-FD hoac Opt-PROJ TRUOC khi viet dong code dau tien

---

## 5. GATE D -- HYBRID QC

| Sub-gate | Hard rules | Ref |
|---|---|---|
| D1 E2E Functional | Native browser nếu khả dụng; nếu không chạy bundled Browser MCP X ensure/install; createQc*() factories; teardown cả FAIL; DEV only | `.agents/skills/e2e-qc/SKILL.md` |
| D2 Visual Screenshot | 4 viewports (1920/1280/820/390px); Light+Dark; mo dropdown truoc chup; 100% coverage | `.agents/skills/frontend-ui-qc/SKILL.md` |
| D3 Design Compliance | Form repeat(2,1fr); input padding 8px 12px / min-h 38px; dual-theme contrast explicit | `.agents/skills/web-design-guidelines/` |
| D4 Evidence | `tasks/qc-evidence/{SLUG}-WAVE-N-YYYYMMDD.md`; commit truoc Wave N+1 | — |

### Gate D browser fallback preflight

1. Xác định host: Antigravity IDE/2.0, Agy CLI hay Codex.
2. Thử native browser tool trước. Agy CLI hiện không có Browser Subagent native; không dùng `/browser` hay lời model tự khai làm bằng chứng.
3. Khi native browser không khả dụng hoặc không healthy, chạy installer đóng gói trong skill:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\.agents\skills\project-delivery-pipeline\scripts\ensure-browser-mcp-x.ps1 -Agent Antigravity -InstallIfMissing
```

Nếu host là Codex, dùng `-Agent Codex`. Package gồm ZIP, SHA256 và version sidecar tại `.agents/skills/project-delivery-pipeline/assets/`.

4. Nếu script trả `RESTART_REQUIRED=true`, restart host rồi tiếp tục trong session mới; không cố dùng tool vừa cài trong session cũ.
5. Xác nhận `/mcp` đã load `browser_qc_current` và `browser_qc_dedicated`; trạng thái `LOADED` chưa đủ.
6. Mặc định chọn `browser_qc_dedicated`; chỉ dùng `browser_qc_current` khi cần session Chrome hiện tại của operator.
7. Gọi `qc_session_info`, xác nhận instance và live connection trước navigation; sau đó mới chạy case matrix và thu evidence.
8. Nếu MCP install/load/connect thất bại và không còn native/headed-browser fallback hợp lệ, ghi BLOCKED; cấm giả lập PASS bằng terminal-only test.

---

## 6. Conditional References

- Read [references/optional-skill-routing.md](references/optional-skill-routing.md) only when a design, orchestration, or specialist branch is activated.
- Read [references/phase-close-and-learning.md](references/phase-close-and-learning.md) before closing any implementation wave or when reusable knowledge changes.

Completion: every activated branch is loaded, and phase close has updated required continuity/evidence surfaces before the task is declared complete.

## P4. COMMUNICATION STYLE

- Tieng Viet trong chat; code/comment tieng Anh
- Action-oriented: khong noi "Toi se..." -- noi thang ket qua
- Flag van de som; checklist progress [x]/[ ] cho task nhieu buoc

| Tag | Y nghia |
|---|---|
| [DONE] | Task hoan thanh |
| [IN PROG] | Dang chay |
| [BLOCKED] | Can user input |
| [FLAG] | Van de ngoai scope |
| [AUDIT] | Challenge plan item |
| [KI] | Knowledge impact |
| [UPDATE] | Da cap nhat handover/todo/pending |

## When to Use

Use this pipeline for an end-to-end delivery that spans at least planning and
implementation, or implementation plus browser QC/evidence. Route a single
read-only review, one-file tweak, Git-only action, or VM-only action to its
narrower skill instead of forcing every gate.

## Limitations and Stop Conditions

- A gate does not grant permission for a later Git, push, deployment, migration,
  credential, or production action; authorize each mutation separately.
- Do not close a complex task from summaries alone or continue to the next wave
  while a blocking edge, verification, continuity update, or owner is unresolved.
- If no healthy browser surface exists for REQUIRED E2E, mark the wave BLOCKED
  rather than substituting terminal-only checks.
