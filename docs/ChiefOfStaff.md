# Chief of Staff

## Purpose
Proactively monitor business activity and create executive insights.

## Architecture
The module contains `ExecutiveInsightEngine`, `RiskAnalyzer`, `OpportunityDetector`, `PriorityManager`, and `NotificationPlanner`. It uses dependency injection so future delivery channels can be added without changing analysis logic.

## Components
Executive cards, risk detection, opportunity detection, Business Pulse, executive timeline, notification planning, critical alerts, and today's priorities.

## Current Status
`app/lib/chief-of-staff.ts` generates executive briefings from leads, knowledge files, orchestration logs, audits, and Business Brain scores. The Command Center displays the output.

## Future Roadmap
Scheduled insight generation, email/push/SMS/WhatsApp/Slack/Teams delivery, owner acknowledgment workflow, insight persistence, and outcome tracking.

## Dependencies
Leads, knowledge files, orchestration logs, audit reports, Business Brain scores, and Morning Brief.

## Known Limitations
Insights are generated at dashboard render time, are not persisted as database records, and estimated values are heuristic.
