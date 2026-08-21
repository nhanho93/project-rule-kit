# Phase Close and Learning

## Phase Close PHASE CLOSE (P0 bat buoc)

> **⛔ STOP — Đã thỏa mãn HARD GATE (#3) chưa? Nếu chưa chạy Gate D hoặc migration drift → chạy trước.**

```
Thu tu: todo -> handover -> pending_todo
[ ] HARD GATE CHECK: xác nhận tất cả pre-condition ở mục #3 đã thỏa mãn
[ ] todo-N.md: mark [x]/[/]/[ ] dung thuc te; >400 lines -> suffix moi
[ ] handover-N.md: append Wave section (files/decisions/risk/QC); >450 lines -> suffix moi
[ ] pending_todo.md: them deferred/skipped; xoa completed; update quick stats
[ ] Commit: evidence + code cung 1 wave; chi push sau Gate D PASS
```

---

<!-- PERSONA / BEHAVIOR LAYER -- chinh sua o day khi thay doi cach giao tiep, khong cham SKILL ENGINE -->

## CHALLENGE & AUDIT PLAN

**Khi nao:** Ngay sau Gate B tao xong MASTER, TRUOC khi xin GO.

```
[ ] Scope creep: task nao vuot scope?
[ ] Dependency: wave sau phu thuoc wave truoc dung khong?
[ ] Risk: migration/breaking change co rollback plan?
[ ] Effort: uoc tinh co thuc te?
[ ] QC coverage: moi wave co QC Spec?
[ ] Open questions: con gi chua ro?
```

FAIL bat ky item -> hoi "[AUDIT] {item}: {van de} -- Ban muon xu ly the nao?"
**Output:** Append `## Audit Result` vao MASTER file.

---

## FEEDBACK LOOP SAU MOI TASK

**Step 1 — Task Close** (toi da 3 dong):
```
[DONE]    Task {N}: {ten} -- {ket qua}
[FLAG]    {van de ngoai scope} -- Can xu ly? (Y/skip)
[BLOCKED] {loi} -- Phuong an: a)Fix b)Defer c)Escalate
```

**Step 2 — Knowledge Impact Check:**

| Signal | Hanh dong | Ghi |
|---|---|---|
| Khong anh huong | N/A | `[KI] N/A` |
| Pattern moi, chua chac (lan dau) | CANDIDATE | `KI-CANDIDATE: {mo ta}` vao handover |
| Fix confirmed, se dung lai | UPDATE | Sua canonical skill cung wave nay |
| Lap >=2 lan / ADR / CI xac nhan | CANONICALIZE | Sua skill + ghi `tasks/lessons-learned/` |

---

## AUTO-UPDATE HANDOVER / TODO / PENDING

Thu tu bat buoc: **todo -> handover -> pending_todo**

| File | Action |
|---|---|
| `tasks/todo-N.md` | Mark [x]/[/]/[ ]; glob max suffix; >400 lines -> suffix moi |
| `tasks/handover-N.md` | Append Wave section (files/decisions/risk/QC); >450 lines -> suffix moi |
| `tasks/pending_todo.md` | Them deferred/skip; xoa completed; update stats; KHONG tao file moi |

---
