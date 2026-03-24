# CalmLane Safety Architecture

## Product framing

CalmLane is an AI emotional support companion for reflection and coping tools.
It must never present itself as a licensed therapist, doctor, psychologist, psychiatrist, or crisis service.

## Safety flow

1. User message arrives in `app/api/chat/route.ts`.
2. Lightweight risk classification runs via local high-signal heuristics (`lib/safety.ts`).
3. If risk is `high` or `critical`:
   - Log minimal safety event metadata to `safety_events`.
   - Surface crisis guidance panel in UI.
   - Prioritize emergency escalation language.
4. Response generation uses bounded supportive prompt (`lib/prompts.ts`) that:
   - avoids diagnosis and certainty claims
   - avoids harmful instructions
   - keeps identity as AI support companion

## Crisis categories covered

- self-harm / suicide indicators
- harm to others
- abuse danger
- psychosis/severe dissociation indicators
- medical emergency indicators

## Privacy principle for safety logs

Store the minimum useful data for operational awareness and quality/safety review; avoid unnecessary sensitive details.
