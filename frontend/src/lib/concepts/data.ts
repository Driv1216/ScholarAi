export type EvidenceState = 'pass' | 'unknown' | 'concern';
export type ConceptKey = 'editorial' | 'terminal' | 'calendar' | 'notebook' | 'triage' | 'atlas' | 'compare' | 'studio' | 'portfolio' | 'graph' | 'expedition' | 'inbox' | 'passport' | 'simulator' | 'commons';

export interface ConceptEvidence {
	label: string;
	detail: string;
	state: EvidenceState;
}

export interface ConceptScholarship {
	id: string;
	name: string;
	provider: string;
	country: string;
	degree: string;
	award: string;
	deadline: string;
	match: number;
	trust: number;
	effort: 'Low' | 'Medium' | 'High';
	summary: string;
	evidence: ConceptEvidence[];
}

export interface ConceptTask {
	id: string;
	title: string;
	due: string;
	done: boolean;
}

export interface ConceptApplication {
	id: string;
	scholarshipId: string;
	status: 'Planning' | 'In progress' | 'Submitted';
	tasks: ConceptTask[];
}

export interface OpportunityContext {
	coordinates: { x: number; y: number };
	city: string;
	route: string[];
	hours: number;
	probability: number;
	coverage: number;
	risk: 'Low' | 'Medium' | 'High';
	awardValue: number;
	prompts: string[];
	dependencies: string[];
}

export interface ReusableEvidence {
	id: string;
	title: string;
	type: 'achievement' | 'experience' | 'impact';
	detail: string;
}

export type NotebookResearchGroup = 'investigate' | 'shortlist' | 'keep-in-view';
export type NotebookEvidenceState = 'verified' | 'ready' | 'missing' | 'not-relevant';
export type NotebookDependencyState = 'verified' | 'ready' | 'in-progress' | 'missing' | 'external';

export interface NotebookResearchFile {
	scholarshipId: string;
	initialGroup: NotebookResearchGroup;
	initialAnnotation: string;
	recommendedVerdict: string;
	recommendedNextAction: string;
	reusableEvidenceIds: string[];
	dependencyIds: string[];
}

export interface NotebookEvidenceItem {
	id: string;
	title: string;
	kind: 'credential' | 'document' | 'achievement' | 'reference' | 'profile';
	state: NotebookEvidenceState;
	detail: string;
}

export interface NotebookDependency {
	id: string;
	scholarshipId: string;
	type: 'requirement' | 'document' | 'evidence' | 'recommender' | 'blocker';
	label: string;
	state: NotebookDependencyState;
	detail: string;
	nextAction: string;
	connectedTo: string[];
}

export const concepts = [
	{ key: 'editorial', name: 'Editorial Briefing', number: '01', thesis: 'Scholarships as researched dossiers.', tone: 'Calm · light · evidence-led' },
	{ key: 'terminal', name: 'Decision Terminal', number: '02', thesis: 'A dense professional decision workspace.', tone: 'Dense · dark · keyboard-first' },
	{ key: 'calendar', name: 'Application Calendar', number: '03', thesis: 'Deadlines and workload drive every decision.', tone: 'Temporal · operational · visual' },
	{ key: 'notebook', name: 'Research Notebook', number: '04', thesis: 'Scholarships as annotated research files.', tone: 'Warm · tactile · comparative' },
	{ key: 'triage', name: 'Guided Triage', number: '05', thesis: 'Review one opportunity deeply, then decide.', tone: 'Focused · decisive · guided' },
	{ key: 'atlas', name: 'Opportunity Atlas', number: '06', thesis: 'Explore scholarships as geographic routes.', tone: 'Spatial · expansive · route-led' },
	{ key: 'compare', name: 'Comparison Room', number: '07', thesis: 'Put serious contenders under equal scrutiny.', tone: 'Parallel · rigorous · decisive' },
	{ key: 'studio', name: 'Application Studio', number: '08', thesis: 'Turn evidence into compelling applications.', tone: 'Creative · structured · draft-led' },
	{ key: 'portfolio', name: 'Funding Portfolio', number: '09', thesis: 'Invest limited effort for the strongest return.', tone: 'Strategic · quantitative · scenario-led' },
	{ key: 'graph', name: 'Relationship Graph', number: '10', thesis: 'See every dependency before it blocks you.', tone: 'Connected · systemic · diagnostic' },
	{ key: 'expedition', name: 'Readiness Expedition', number: '11', thesis: 'Turn preparation into a guided journey.', tone: 'Motivating · progressive · quest-led' },
	{ key: 'inbox', name: 'Signal Inbox', number: '12', thesis: 'Process every scholarship signal without dropping the ball.', tone: 'Fast · event-driven · responsive' },
	{ key: 'passport', name: 'Scholarship Passport', number: '13', thesis: 'Build one verified identity that travels everywhere.', tone: 'Verified · reusable · identity-led' },
	{ key: 'simulator', name: 'Future Simulator', number: '14', thesis: 'Rehearse different futures before committing.', tone: 'Branching · uncertain · counterfactual' },
	{ key: 'commons', name: 'Cohort Commons', number: '15', thesis: 'Make better decisions with peers who have been there.', tone: 'Social · verified · collective' }
] as const;

export const profile = {
	name: 'Maya Rao',
	degree: 'Computer Science',
	target: 'Masters',
	countries: ['Germany', 'UK', 'Canada'],
	cgpa: '8.7',
	nationality: 'India'
};

export const scholarships: ConceptScholarship[] = [
	{
		id: 'daad',
		name: 'DAAD Study Scholarship',
		provider: 'German Academic Exchange Service',
		country: 'Germany',
		degree: 'Masters',
		award: '€934 monthly + travel',
		deadline: '2026-09-30',
		match: 95,
		trust: 98,
		effort: 'High',
		summary: 'A strong academic and geographic fit with a demanding research proposal.',
		evidence: [
			{ label: 'Target country', detail: 'Germany is one of your preferred destinations.', state: 'pass' },
			{ label: 'Degree goal', detail: 'Supports your planned Masters degree.', state: 'pass' },
			{ label: 'Academic record', detail: 'Your CGPA clears the stated minimum.', state: 'pass' },
			{ label: 'Research proposal', detail: 'A detailed proposal is required and not started.', state: 'concern' }
		]
	},
	{
		id: 'chevening',
		name: 'Chevening Scholarship',
		provider: 'UK Foreign, Commonwealth & Development Office',
		country: 'UK',
		degree: 'Masters',
		award: 'Full tuition + stipend',
		deadline: '2026-10-07',
		match: 88,
		trust: 99,
		effort: 'High',
		summary: 'Excellent funding and destination fit; leadership evidence will decide competitiveness.',
		evidence: [
			{ label: 'Target country', detail: 'UK is one of your preferred destinations.', state: 'pass' },
			{ label: 'Work experience', detail: 'Required experience needs manual verification.', state: 'unknown' },
			{ label: 'Leadership essays', detail: 'Four substantial essays are required.', state: 'concern' }
		]
	},
	{
		id: 'vector',
		name: 'Vector Scholarship in AI',
		provider: 'Vector Institute',
		country: 'Canada',
		degree: 'Masters',
		award: 'CAD 17,500',
		deadline: '2026-08-28',
		match: 91,
		trust: 94,
		effort: 'Medium',
		summary: 'Direct field match with a comparatively focused application.',
		evidence: [
			{ label: 'Field alignment', detail: 'Your computer science profile is directly relevant.', state: 'pass' },
			{ label: 'Target country', detail: 'Canada is one of your preferred destinations.', state: 'pass' },
			{ label: 'Program nomination', detail: 'Your university program must nominate you.', state: 'unknown' }
		]
	},
	{
		id: 'erasmus',
		name: 'Erasmus Mundus Joint Masters',
		provider: 'European Commission',
		country: 'Europe',
		degree: 'Masters',
		award: 'Full tuition + €1,400 monthly',
		deadline: '2027-01-12',
		match: 82,
		trust: 97,
		effort: 'High',
		summary: 'High-value opportunity with broad mobility, but program selection needs research.',
		evidence: [
			{ label: 'Degree goal', detail: 'Supports your planned Masters degree.', state: 'pass' },
			{ label: 'Mobility', detail: 'Requires study across at least two countries.', state: 'unknown' },
			{ label: 'Program fit', detail: 'Specific computer science pathway is not selected.', state: 'concern' }
		]
	},
	{
		id: 'women-techmakers',
		name: 'Women Techmakers Scholars Program',
		provider: 'Google',
		country: 'Global',
		degree: 'Masters',
		award: 'USD 10,000',
		deadline: '2026-11-18',
		match: 79,
		trust: 93,
		effort: 'Medium',
		summary: 'Strong field alignment and attainable effort, with community impact as the key unknown.',
		evidence: [
			{ label: 'Field alignment', detail: 'Computer science is directly eligible.', state: 'pass' },
			{ label: 'Community impact', detail: 'Evidence of supporting women in technology is needed.', state: 'unknown' }
		]
	},
	{
		id: 'commonwealth',
		name: 'Commonwealth Masters Scholarship',
		provider: 'Commonwealth Scholarship Commission',
		country: 'UK',
		degree: 'Masters',
		award: 'Full tuition + living allowance',
		deadline: '2026-12-03',
		match: 76,
		trust: 98,
		effort: 'High',
		summary: 'Strong funding fit, but development-impact positioning needs careful work.',
		evidence: [
			{ label: 'Nationality', detail: 'India is an eligible Commonwealth country.', state: 'pass' },
			{ label: 'Development impact', detail: 'Application must demonstrate measurable future impact.', state: 'concern' }
		]
	}
];

export const applications: ConceptApplication[] = [
	{ id: 'app-vector', scholarshipId: 'vector', status: 'In progress', tasks: [
		{ id: 'vector-statement', title: 'Draft AI impact statement', due: '2026-07-03', done: false },
		{ id: 'vector-reference', title: 'Request faculty nomination', due: '2026-07-08', done: false }
	] },
	{ id: 'app-daad', scholarshipId: 'daad', status: 'Planning', tasks: [
		{ id: 'daad-proposal', title: 'Outline research proposal', due: '2026-07-12', done: false },
		{ id: 'daad-programs', title: 'Shortlist German programs', due: '2026-07-15', done: true }
	] },
	{ id: 'app-chevening', scholarshipId: 'chevening', status: 'Submitted', tasks: [
		{ id: 'chevening-interview', title: 'Prepare interview examples', due: '2026-08-02', done: false }
	] }
];

export const opportunityContext: Record<string, OpportunityContext> = {
	daad: { coordinates: { x: 52, y: 34 }, city: 'Berlin', route: ['Bengaluru', 'Berlin'], hours: 34, probability: 38, coverage: 92, risk: 'Medium', awardValue: 16800, prompts: ['Research proposal', 'Academic motivation'], dependencies: ['Research proposal', 'German program shortlist', 'Academic reference'] },
	chevening: { coordinates: { x: 45, y: 30 }, city: 'London', route: ['Bengaluru', 'London'], hours: 42, probability: 22, coverage: 100, risk: 'High', awardValue: 42000, prompts: ['Leadership', 'Networking', 'Career plan', 'Course choices'], dependencies: ['Work experience proof', 'Two referees', 'University offers'] },
	vector: { coordinates: { x: 21, y: 32 }, city: 'Toronto', route: ['Bengaluru', 'Toronto'], hours: 18, probability: 54, coverage: 55, risk: 'Low', awardValue: 12800, prompts: ['AI impact statement'], dependencies: ['Program nomination', 'Faculty reference'] },
	erasmus: { coordinates: { x: 50, y: 39 }, city: 'Multi-city', route: ['Bengaluru', 'Paris', 'Barcelona'], hours: 38, probability: 31, coverage: 100, risk: 'High', awardValue: 48000, prompts: ['Academic motivation', 'Mobility statement'], dependencies: ['Program selection', 'Transcript verification', 'Two references'] },
	'women-techmakers': { coordinates: { x: 72, y: 47 }, city: 'Global', route: ['Bengaluru', 'Global network'], hours: 16, probability: 43, coverage: 30, risk: 'Low', awardValue: 10000, prompts: ['Community impact', 'Technical leadership'], dependencies: ['Community evidence', 'Resume'] },
	commonwealth: { coordinates: { x: 44, y: 27 }, city: 'United Kingdom', route: ['Bengaluru', 'United Kingdom'], hours: 40, probability: 27, coverage: 100, risk: 'High', awardValue: 39000, prompts: ['Development impact', 'Career plan'], dependencies: ['Development impact plan', 'Nominating body', 'References'] }
};

export const reusableEvidence: ReusableEvidence[] = [
	{ id: 'evidence-ai-lab', title: 'AI Lab Research Assistant', type: 'experience', detail: 'Built an evaluation pipeline used by a five-person research team.' },
	{ id: 'evidence-women-code', title: 'Women Who Code Mentor', type: 'impact', detail: 'Mentored 18 first-year students through weekly programming clinics.' },
	{ id: 'evidence-hackathon', title: 'National AI Hackathon Winner', type: 'achievement', detail: 'Led a four-person team building an accessibility-focused ML prototype.' },
	{ id: 'evidence-cgpa', title: '8.7 CGPA', type: 'achievement', detail: 'Consistent top-decile academic performance in computer science.' }
];

export const documents = [
	{ id: 'doc-transcript', title: 'Official transcript', status: 'Ready' },
	{ id: 'doc-resume', title: 'Academic resume', status: 'Ready' },
	{ id: 'doc-proposal', title: 'Research proposal', status: 'Drafting' },
	{ id: 'doc-work', title: 'Work experience proof', status: 'Missing' }
] as const;

export const recommenders = [
	{ id: 'ref-mehta', name: 'Prof. R. Mehta', relation: 'Research supervisor', status: 'Confirmed' },
	{ id: 'ref-shah', name: 'Dr. N. Shah', relation: 'Course instructor', status: 'Needs brief' }
] as const;

export const notebookEvidence: NotebookEvidenceItem[] = [
	{ id: 'cred-transcript', title: 'Official transcript', kind: 'credential', state: 'verified', detail: 'Verified academic record with an 8.7 CGPA.' },
	{ id: 'cred-identity', title: 'Identity and nationality', kind: 'credential', state: 'verified', detail: 'Government identity and Indian nationality verified.' },
	{ id: 'doc-resume', title: 'Academic resume', kind: 'document', state: 'ready', detail: 'Current resume reviewed and ready to reuse.' },
	{ id: 'doc-proposal', title: 'Research proposal', kind: 'document', state: 'missing', detail: 'A scholarship-specific research proposal has not been completed.' },
	{ id: 'doc-work', title: 'Work experience proof', kind: 'document', state: 'missing', detail: 'Employer confirmation is still required.' },
	{ id: 'evidence-ai-lab', title: 'AI Lab Research Assistant', kind: 'achievement', state: 'ready', detail: 'Research experience supporting technical and academic narratives.' },
	{ id: 'evidence-women-code', title: 'Women Who Code Mentor', kind: 'achievement', state: 'ready', detail: 'Community-impact evidence supporting leadership applications.' },
	{ id: 'evidence-hackathon', title: 'National AI Hackathon Winner', kind: 'achievement', state: 'ready', detail: 'Competitive technical achievement with team-leadership evidence.' },
	{ id: 'evidence-cgpa', title: '8.7 CGPA', kind: 'profile', state: 'verified', detail: 'Top-decile academic performance.' },
	{ id: 'ref-mehta', title: 'Prof. R. Mehta', kind: 'reference', state: 'ready', detail: 'Confirmed research supervisor; still needs a concise brief.' },
	{ id: 'ref-shah', title: 'Dr. N. Shah', kind: 'reference', state: 'ready', detail: 'Potential second referee; relationship brief is incomplete.' }
];

export const notebookResearchFiles: NotebookResearchFile[] = [
	{ scholarshipId: 'daad', initialGroup: 'shortlist', initialAnnotation: 'The strongest research-led option. The proposal is the real test: it must name a credible lab and a precise question.', recommendedVerdict: 'Shortlist', recommendedNextAction: 'Outline the research proposal around one German lab.', reusableEvidenceIds: ['cred-transcript','cred-identity','doc-resume','doc-proposal','evidence-ai-lab','evidence-cgpa','ref-mehta'], dependencyIds: ['daad-proposal','daad-transcript','daad-lab','daad-mehta'] },
	{ scholarshipId: 'chevening', initialGroup: 'investigate', initialAnnotation: 'Funding is excellent, but the leadership narrative and work-proof requirement make this expensive to defend.', recommendedVerdict: 'Investigate', recommendedNextAction: 'Confirm eligible work experience before drafting essays.', reusableEvidenceIds: ['cred-transcript','cred-identity','doc-resume','doc-work','evidence-women-code','evidence-hackathon','ref-mehta','ref-shah'], dependencyIds: ['chev-work','chev-leadership','chev-references','chev-offers'] },
	{ scholarshipId: 'vector', initialGroup: 'shortlist', initialAnnotation: 'Best effort-to-upside ratio. Nomination is outside direct control, so faculty outreach determines whether this stays viable.', recommendedVerdict: 'Lead Contender', recommendedNextAction: 'Request faculty nomination this week.', reusableEvidenceIds: ['cred-transcript','doc-resume','evidence-ai-lab','evidence-hackathon','evidence-cgpa','ref-mehta'], dependencyIds: ['vector-nomination','vector-ai','vector-transcript','vector-mehta'] },
	{ scholarshipId: 'erasmus', initialGroup: 'keep-in-view', initialAnnotation: 'High-value and intellectually attractive, but choosing the right program pathway comes before application work.', recommendedVerdict: 'Keep in View', recommendedNextAction: 'Compare two computer-science mobility pathways.', reusableEvidenceIds: ['cred-transcript','cred-identity','doc-resume','evidence-ai-lab','evidence-cgpa','ref-mehta','ref-shah'], dependencyIds: ['erasmus-program','erasmus-mobility','erasmus-transcript','erasmus-refs'] },
	{ scholarshipId: 'women-techmakers', initialGroup: 'shortlist', initialAnnotation: 'A focused application with a credible mentoring story. Community impact needs sharper measurement.', recommendedVerdict: 'Shortlist', recommendedNextAction: 'Quantify mentoring outcomes and technical leadership.', reusableEvidenceIds: ['cred-transcript','doc-resume','evidence-women-code','evidence-hackathon','evidence-cgpa'], dependencyIds: ['wtm-impact','wtm-technical','wtm-resume'] },
	{ scholarshipId: 'commonwealth', initialGroup: 'investigate', initialAnnotation: 'Strong coverage, but the development-impact case currently feels broad. Needs a specific future intervention.', recommendedVerdict: 'Investigate', recommendedNextAction: 'Define one measurable development-impact outcome.', reusableEvidenceIds: ['cred-transcript','cred-identity','doc-resume','evidence-women-code','evidence-cgpa','ref-mehta','ref-shah'], dependencyIds: ['common-impact','common-nomination','common-refs','common-transcript'] }
];

export const notebookDependencies: NotebookDependency[] = [
	{ id:'daad-proposal',scholarshipId:'daad',type:'blocker',label:'Research proposal',state:'missing',detail:'A focused research proposal is mandatory and has not been started.',nextAction:'Outline one research question and identify one German lab.',connectedTo:['daad'] },
	{ id:'daad-transcript',scholarshipId:'daad',type:'document',label:'Verified transcript',state:'verified',detail:'Academic record is verified and ready.',nextAction:'No action required.',connectedTo:['daad'] },
	{ id:'daad-lab',scholarshipId:'daad',type:'requirement',label:'German lab fit',state:'in-progress',detail:'Potential programs are shortlisted, but no lab has been selected.',nextAction:'Review faculty research at the top two programs.',connectedTo:['daad','daad-proposal'] },
	{ id:'daad-mehta',scholarshipId:'daad',type:'recommender',label:'Prof. Mehta',state:'ready',detail:'Confirmed referee who needs a concise application brief.',nextAction:'Send the one-page reference brief.',connectedTo:['daad','daad-proposal'] },
	{ id:'chev-work',scholarshipId:'chevening',type:'blocker',label:'Work proof',state:'missing',detail:'Eligible work experience needs confirmation and documentary proof.',nextAction:'Request employer confirmation.',connectedTo:['chevening'] },
	{ id:'chev-leadership',scholarshipId:'chevening',type:'evidence',label:'Leadership narrative',state:'in-progress',detail:'Strong raw evidence exists, but the narrative is not assembled.',nextAction:'Connect mentoring and hackathon leadership into one story.',connectedTo:['chevening'] },
	{ id:'chev-references',scholarshipId:'chevening',type:'recommender',label:'Two referees',state:'ready',detail:'Two possible referees are identified; one still needs a brief.',nextAction:'Brief Dr. Shah.',connectedTo:['chevening'] },
	{ id:'chev-offers',scholarshipId:'chevening',type:'requirement',label:'University offers',state:'external',detail:'Offers depend on separate university applications.',nextAction:'Track course application timelines.',connectedTo:['chevening'] },
	{ id:'vector-nomination',scholarshipId:'vector',type:'blocker',label:'Program nomination',state:'external',detail:'The university program must nominate the applicant.',nextAction:'Ask the program coordinator about nomination timing.',connectedTo:['vector'] },
	{ id:'vector-ai',scholarshipId:'vector',type:'evidence',label:'AI impact evidence',state:'ready',detail:'Research assistant and hackathon evidence strongly support fit.',nextAction:'Draft the AI impact statement.',connectedTo:['vector'] },
	{ id:'vector-transcript',scholarshipId:'vector',type:'document',label:'Verified transcript',state:'verified',detail:'Academic record is verified and ready.',nextAction:'No action required.',connectedTo:['vector'] },
	{ id:'vector-mehta',scholarshipId:'vector',type:'recommender',label:'Faculty reference',state:'ready',detail:'Prof. Mehta can support the application.',nextAction:'Include the nomination request in the reference brief.',connectedTo:['vector','vector-nomination'] },
	{ id:'erasmus-program',scholarshipId:'erasmus',type:'blocker',label:'Program pathway',state:'missing',detail:'No specific joint masters pathway has been selected.',nextAction:'Compare two relevant program pathways.',connectedTo:['erasmus'] },
	{ id:'erasmus-mobility',scholarshipId:'erasmus',type:'requirement',label:'Mobility readiness',state:'in-progress',detail:'Multi-country study is attractive but logistics remain untested.',nextAction:'Estimate moving and housing transition costs.',connectedTo:['erasmus'] },
	{ id:'erasmus-transcript',scholarshipId:'erasmus',type:'document',label:'Verified transcript',state:'verified',detail:'Academic record is verified and ready.',nextAction:'No action required.',connectedTo:['erasmus'] },
	{ id:'erasmus-refs',scholarshipId:'erasmus',type:'recommender',label:'Two references',state:'ready',detail:'Potential referees exist but require pathway-specific briefs.',nextAction:'Select the program before briefing referees.',connectedTo:['erasmus','erasmus-program'] },
	{ id:'wtm-impact',scholarshipId:'women-techmakers',type:'evidence',label:'Community impact',state:'in-progress',detail:'Mentoring evidence exists but outcomes need measurement.',nextAction:'Quantify participant progress and retention.',connectedTo:['women-techmakers'] },
	{ id:'wtm-technical',scholarshipId:'women-techmakers',type:'evidence',label:'Technical leadership',state:'ready',detail:'Hackathon and research evidence support technical leadership.',nextAction:'Select two concise examples.',connectedTo:['women-techmakers'] },
	{ id:'wtm-resume',scholarshipId:'women-techmakers',type:'document',label:'Academic resume',state:'ready',detail:'Resume is current and reusable.',nextAction:'Tailor the community-impact section.',connectedTo:['women-techmakers'] },
	{ id:'common-impact',scholarshipId:'commonwealth',type:'blocker',label:'Development impact',state:'in-progress',detail:'The future-impact case is too broad to be persuasive.',nextAction:'Define one measurable outcome and beneficiary group.',connectedTo:['commonwealth'] },
	{ id:'common-nomination',scholarshipId:'commonwealth',type:'requirement',label:'Nominating body',state:'external',detail:'The nominating route requires external confirmation.',nextAction:'Confirm the applicable nominating body.',connectedTo:['commonwealth'] },
	{ id:'common-refs',scholarshipId:'commonwealth',type:'recommender',label:'References',state:'ready',detail:'Two possible referees are identified.',nextAction:'Prepare a development-impact brief.',connectedTo:['commonwealth'] },
	{ id:'common-transcript',scholarshipId:'commonwealth',type:'document',label:'Verified transcript',state:'verified',detail:'Academic record is verified and ready.',nextAction:'No action required.',connectedTo:['commonwealth'] }
];

export const readinessMilestones = [
	{ id: 'identity', title: 'Establish your basecamp', detail: 'Profile, goals, and academic record are ready.', status: 'complete', xp: 120, unlock: 'Foundational matches' },
	{ id: 'evidence', title: 'Prove your strongest signals', detail: 'Verify experience and community-impact evidence.', status: 'current', xp: 180, unlock: 'Leadership awards' },
	{ id: 'references', title: 'Secure your expedition team', detail: 'Brief two recommenders with reusable evidence.', status: 'current', xp: 140, unlock: 'Reference-heavy awards' },
	{ id: 'proposal', title: 'Chart a research direction', detail: 'Shape one adaptable research proposal.', status: 'locked', xp: 260, unlock: 'DAAD and research funding' },
	{ id: 'mobility', title: 'Open a wider route', detail: 'Evaluate multi-country study pathways.', status: 'optional', xp: 90, unlock: 'Erasmus mobility route' }
] as const;

export type SignalCategory = 'Priority' | 'Opportunities' | 'Waiting' | 'Done';
export interface SignalEvent {
	id: string;
	category: SignalCategory;
	title: string;
	detail: string;
	source: string;
	time: string;
	scholarshipId?: string;
	action: string;
}
export const signalEvents = [
	{ id: 'sig-ref', category: 'Priority', title: 'Professor Mehta replied', detail: 'Your research supervisor can provide a reference, but needs a one-page brief.', source: 'Reference', time: '11 min', scholarshipId: 'daad', action: 'Send brief' },
	{ id: 'sig-vector', category: 'Priority', title: 'Nomination window closes early', detail: 'Vector Institute nominations now close two weeks before the public deadline.', source: 'Deadline change', time: '42 min', scholarshipId: 'vector', action: 'Update plan' },
	{ id: 'sig-match', category: 'Opportunities', title: 'A stronger match appeared', detail: 'Your AI research experience raises the DAAD evidence confidence to 95%.', source: 'Match', time: '2 hr', scholarshipId: 'daad', action: 'Inspect match' },
	{ id: 'sig-doc', category: 'Waiting', title: 'Work proof requested', detail: 'Chevening work-experience evidence still needs employer confirmation.', source: 'Document', time: 'Yesterday', scholarshipId: 'chevening', action: 'Follow up' },
	{ id: 'sig-done', category: 'Done', title: 'Transcript verified', detail: 'Your official transcript can now be reused across four applications.', source: 'Credential', time: 'Friday', action: 'View credential' }
] satisfies SignalEvent[];

export const verifiedCredentials = [
	{ id: 'cred-transcript', title: 'Academic transcript', issuer: 'National Institute of Technology', status: 'Verified', coverage: '6 applications' },
	{ id: 'cred-identity', title: 'Identity and nationality', issuer: 'Government ID', status: 'Verified', coverage: '6 applications' },
	{ id: 'cred-resume', title: 'Academic resume', issuer: 'Self-declared · reviewed', status: 'Ready', coverage: '5 applications' },
	{ id: 'cred-impact', title: 'Community impact record', issuer: 'Women Who Code', status: 'Ready', coverage: '3 applications' },
	{ id: 'cred-work', title: 'Work experience proof', issuer: 'Employer confirmation needed', status: 'Missing', coverage: '2 applications' }
] as const;

export const sponsorInvitations = [
	{ id: 'invite-vector', scholarshipId: 'vector', message: 'Your AI research profile meets the sponsor’s early-interest criteria.', packetCoverage: 82 },
	{ id: 'invite-wtm', scholarshipId: 'women-techmakers', message: 'Your mentoring evidence aligns with this year’s community theme.', packetCoverage: 74 }
] as const;

export const alumniJourneys = [
	{ id: 'alumni-anika', name: 'Anika S.', scholarshipId: 'daad', destination: 'Berlin', year: '2025', verified: true, insight: 'The proposal became much stronger after I named one lab and one specific research question.' },
	{ id: 'alumni-omar', name: 'Omar K.', scholarshipId: 'chevening', destination: 'London', year: '2024', verified: true, insight: 'Treat the four essays as one connected leadership story, not separate answers.' },
	{ id: 'alumni-lena', name: 'Lena P.', scholarshipId: 'erasmus', destination: 'Barcelona', year: '2025', verified: true, insight: 'Mobility is rewarding, but housing changes need a real contingency budget.' }
] as const;

export const cohorts = [
	{ id: 'cohort-germany', name: 'Germany 2027', members: 184, next: 'Proposal clinic · Wed', focus: 'DAAD and research programs' },
	{ id: 'cohort-ai', name: 'AI funding circle', members: 76, next: 'Portfolio review · Fri', focus: 'Technical evidence and nominations' },
	{ id: 'cohort-uk', name: 'UK leadership awards', members: 132, next: 'Essay room · Sun', focus: 'Chevening and Commonwealth' }
] as const;

export const peerCheckIns = [
	{ id: 'checkin-1', person: 'Mira', task: 'Sent reference brief', time: '18 min ago', verified: true },
	{ id: 'checkin-2', person: 'Dev', task: 'Finished DAAD proposal outline', time: '1 hr ago', verified: false },
	{ id: 'checkin-3', person: 'Sara', task: 'Compared three German programs', time: '3 hr ago', verified: true }
] as const;

export function scholarshipById(id: string) {
	return scholarships.find((scholarship) => scholarship.id === id) ?? scholarships[0];
}
