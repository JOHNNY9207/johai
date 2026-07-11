import ExecutiveBrief from "./ExecutiveBrief";
import BusinessPulse from "./BusinessPulse";
import DecisionQueue, { type ExecutiveDecision } from "./DecisionQueue";
import AIWorkReport from "./AIWorkReport";
import BusinessBrainInsights, { type KnowledgeArea } from "./BusinessBrainInsights";
import CompactCRMSummary from "./CompactCRMSummary";
import ExecutiveOutlook, { type OutlookItem } from "./ExecutiveOutlook";
import type { ActivityItem } from "./LiveAIActivity";
import type { AttentionItem } from "./AttentionCenter";
import type { ImpactMetric } from "./BusinessImpact";
import type { BrainArea } from "./BusinessBrainSummary";
import type { BriefLine } from "./MorningBriefCard";

export type CurrentTask = { title: string; stage: string; progress: number; nextAction: string };
export type CompletedWork = { label: string; value: number };
type LegacyProps = { status: string; completed: CompletedWork[]; task: CurrentTask; attention: AttentionItem[]; opportunityValue: string; activities: ActivityItem[]; impact: ImpactMetric[]; brain: { completeness: number; confidence: number; areas: BrainArea[]; recommendation: string }; brief: { greeting: string; lines: BriefLine[] } };
type V3Props = LegacyProps & { businessName?: string; businessStatus?: string; updatedAt?: string; crm?: { counts: { new: number; qualified: number; booked: number }; interpretation: string; priorityLead: string; nextMeeting: string }; outlook?: OutlookItem[]; learning?: string };

export default function AIEmployeeOverview(props: V3Props) {
  const decisionItems: ExecutiveDecision[] = props.attention.slice(0,3).map((item,index)=>({ id:`decision-${index}-${item.href}`, title:item.title, why:item.detail, urgency:"Review today", action:item.action, href:item.href, after:"JOHAI will continue the appropriate follow-up after your decision." }));
  const areas: KnowledgeArea[] = props.brain.areas.map((area,index)=>({ id:`knowledge-${index}-${area.label}`, label:area.label, known:area.learned }));
  const completedTotal = props.completed.reduce((sum,item)=>sum+item.value,0);
  const recordedSummary = completedTotal > 0 ? `JOHAI recorded ${completedTotal} completed business actions. ${props.completed.map((item)=>`${item.value} ${item.label.toLowerCase()}`).join(", ")}.` : "No completed work has been recorded yet. JOHAI is ready for the next customer or business signal.";
  const importantLine = props.brief.lines.find((line)=>line.label === "What matters")?.text ?? "JOHAI is monitoring the business.";
  const riskLine = props.brief.lines.find((line)=>line.label === "At risk")?.text ?? "No material risk is currently detected.";
  const changeLine = props.brief.lines.find((line)=>line.label === "What happened")?.text ?? "No new activity has been recorded.";
  const businessStatus = props.businessStatus ?? (props.attention.length ? "Attention required" : props.brain.completeness < 70 ? "Setup limiting performance" : "Operating normally");
  const evidence = props.activities.map((item,index)=>({ id:`evidence-${index}-${item.time}`, label:item.title, detail:`${item.time} · ${item.detail}` }));
  const missing = props.brain.areas.filter((area)=>!area.learned).map((area)=>area.label);
  const nextWork = props.brief.lines.find((line)=>line.label === "JOHAI next")?.text ?? props.task.nextAction;
  return <div id="command-center" className="mb-10 scroll-mt-36 space-y-5">
    <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]"><ExecutiveBrief greeting={props.brief.greeting} businessName={props.businessName ?? "your business"} status={businessStatus} narrative={`${changeLine} ${importantLine}`} change={changeLine} consequence={riskLine} decision={props.attention[0]?.title ?? "No owner decision is required right now."} next={nextWork} updatedAt={props.updatedAt ?? "when this page loaded"} /><DecisionQueue items={decisionItems} /></div>
    <BusinessPulse status={businessStatus === "Operating normally" ? "Stable" : businessStatus} explanation={importantLine} trend={props.completed.some((item)=>item.value>0) ? "up" : "steady"} positive={props.completed.find((item)=>item.value>0)?.label ?? "JOHAI is ready to begin work"} constraint={missing[0] ? `${missing[0]} information is incomplete` : riskLine} confidence={props.brain.completeness} updatedAt={props.updatedAt ?? "on page load"} />
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><AIWorkReport summary={recordedSummary} current={props.task.title} stage={props.task.stage} progress={props.task.progress} expected={props.task.nextAction} next={nextWork} approval={props.attention.length>0} evidence={evidence} /><CompactCRMSummary counts={props.crm?.counts ?? {new:0,qualified:0,booked:0}} interpretation={props.crm?.interpretation ?? "No active pipeline movement is available yet."} priorityLead={props.crm?.priorityLead ?? "—"} nextMeeting={props.crm?.nextMeeting ?? "—"} /></div>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]"><BusinessBrainInsights areas={areas} confidence={props.brain.confidence} completeness={props.brain.completeness} learning={props.learning ?? "JOHAI needs more business activity before it can identify reliable patterns."} missing={missing} recommendation={props.brain.recommendation} /><ExecutiveOutlook items={props.outlook ?? []} /></div>
    <p className="px-1 text-xs leading-5 text-slate-600">Trust note: activity counts are recorded from existing business data. Opportunity values are estimates and are not recognized revenue. Recommendations require owner judgment.</p>
  </div>;
}
