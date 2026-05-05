# Notification System Design

---

## Stage 5 — Reliability: Why `notify_all()` Fails at Scale

### The Problem

The naive implementation loops synchronously over 50,000 users and fires an individual notification call per user:

```python
def notify_all(users, message):
    for user in users:          # 50,000 iterations
        send_notification(user, message)   # blocking network I/O
```

**Why this is broken:**

| Issue | Explanation |
|---|---|
| **Single point of failure** | If the process crashes at user #30,000, the remaining 20,000 users are silently skipped with no record of what was sent. |
| **No retry logic** | A transient network error on one user causes that notification to be permanently lost. |
| **Blocking I/O** | Each `send_notification` call blocks the thread. 50,000 sequential HTTP calls at ~100 ms each = ~83 minutes to complete. |
| **No backpressure** | All 50,000 jobs are created instantly, overwhelming downstream services (email/SMS gateways have rate limits). |
| **No observability** | There is no way to inspect progress, failures, or retry counts mid-run. |

---

### Revised Architecture: Async Queue + Worker + Retry Pattern

**Components:**
- **Producer**: enqueues one job per user into a Redis-backed BullMQ queue
- **Worker pool**: N concurrent workers pull jobs and call the notification service
- **Retry policy**: exponential backoff with a dead-letter queue (DLQ) for permanent failures

```pseudocode
// --- PRODUCER (runs once per broadcast event) ---
function enqueue_notify_all(users, message):
    for each user in users:
        queue.add("send-notification", { userId: user.id, message }, {
            attempts: 5,
            backoff: { type: "exponential", delay: 2000 }
        })
    log("backend", "info", "cron_job", `Enqueued ${users.length} notification jobs`)


// --- WORKER (N instances running concurrently) ---
worker = new Worker("send-notification", async (job) => {
    { userId, message } = job.data

    try:
        await notificationService.send(userId, message)
        log("backend", "info", "cron_job", `Notification sent to ${userId}`)

    catch error:
        log("backend", "warn", "cron_job", `Attempt ${job.attemptsMade} failed for ${userId}: ${error.message}`)
        throw error   // BullMQ catches this and schedules retry with backoff

}, { concurrency: 50 })   // 50 parallel workers — tune to gateway rate limits


// --- DEAD LETTER QUEUE HANDLER ---
worker.on("failed", (job, error) => {
    if (job.attemptsMade >= job.opts.attempts):
        dlq.add({ job: job.data, error: error.message, failedAt: Date.now() })
        log("backend", "error", "cron_job", `Permanently failed for userId=${job.data.userId}`)
})
```

**Key improvements:**
- **Fault isolation**: each job fails independently; one bad user ID cannot block others
- **Automatic retry**: exponential backoff (2 s → 4 s → 8 s → 16 s → 32 s) handles transient failures
- **Controlled throughput**: `concurrency: 50` acts as a rate limiter against downstream gateways
- **Full observability**: BullMQ dashboard shows pending/active/completed/failed counts in real time
- **Resumability**: if the process restarts, Redis retains all pending jobs — nothing is lost

---

## Stage 6 — Priority Inbox: Top-10 Selection Algorithm

### Weighting Scheme

| Type | Weight |
|---|---|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

### Scoring Formula

```
priority_score = TYPE_WEIGHT × RECENCY_SCORE

where:
  RECENCY_SCORE = 1 / (1 + hours_since_created)
```

`RECENCY_SCORE` decays toward 0 as a notification ages. This ensures a recent `Event` (score ≈ 1.0) can outrank an old `Placement` (score ≈ 0.05) — recency always matters.

### Top-10 Selection (Frontend, O(n log n))

```typescript
function getTop10(notifications: Notification[]): Notification[] {
    const now = Date.now()

    scored = notifications.map(n => ({
        notification: n,
        score: TYPE_WEIGHT[n.type] * (1 / (1 + hoursSince(n.created_at, now)))
    }))

    scored.sort((a, b) => b.score - a.score)   // descending

    return scored.slice(0, 10).map(s => s.notification)
}
```

### Maintaining Top-10 Efficiently as New Data Arrives

For a backend implementation with a continuous stream of new notifications, a full re-sort on every insert is wasteful. Use a **min-heap of size 10**:

```pseudocode
// Min-heap keyed on priority_score — O(log 10) = O(1) per insert
heap = MinHeap(capacity=10)

function on_new_notification(notification):
    score = compute_score(notification)

    if heap.size < 10:
        heap.push({ notification, score })

    else if score > heap.peek().score:
        // New item beats the lowest-priority item in the top-10
        heap.pop()
        heap.push({ notification, score })

    // Otherwise discard — it doesn't make the top-10


// Periodic re-score (e.g., every 5 minutes via cron)
// Required because RECENCY_SCORE decays over time — an item that was
// top-10 an hour ago may no longer qualify.
function rescore_heap():
    all_items = heap.drain()
    for item in all_items:
        item.score = compute_score(item.notification)
    heap.rebuild(all_items)
    // Evict any items that have decayed below newer candidates
```

**Complexity:**
- Insert: O(log 10) ≈ O(1)
- Full re-score: O(10 log 10) ≈ O(1) — negligible even at high frequency
- Storage: O(10) — constant regardless of total notification count

**Why not a sorted list?** Inserting into a sorted array is O(n). A heap gives O(log k) where k=10, which is effectively constant and scales to millions of incoming notifications without degradation.

---

## Architecture Overview

```
[React Frontend :3000]
        │  axios (logged interceptor)
        ▼
[Express Backend :5000]
        │  requestLogger middleware
        │  GET /api/notifications?limit&page&notification_type
        ▼
[Upstream Evaluation API]
  POST /auth  →  Bearer token (cached, auto-refresh)
  GET  /notifications
  POST /logs

[BullMQ + Redis]  ←  notify_all producer
        │
   [Worker Pool]  →  notification gateway
        │
   [Dead Letter Queue]  →  alerting / manual review
```
