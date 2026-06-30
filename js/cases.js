// Landmark Supreme Court cases — a browsable registry derived from content.js.
//
// The cases themselves (name, year, holding) live inline on each amendment in
// content.js, in two places: the top-level `cases[]` array and individual
// `scenarios[].case` references. This module gathers them into one deduped list
// and pairs each with a longer human-readable detail (CASE_DETAILS, keyed by the
// exact case name) for the dedicated "Landmark cases" browser.

import { AMENDMENTS } from "./content.js";

// URL/data-attribute-safe id for a case name.
export const caseSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Longer detail for each case, keyed by its exact `name` in content.js.
// Each entry: { background, who, rights, impact } — plain-language, ~1-2 sentences.
export const CASE_DETAILS = {
  "Tinker v. Des Moines": {
    background: "In 1965, a handful of Iowa students wore black armbands to school to mourn Vietnam War dead and back a truce. School officials had banned the armbands in advance and suspended the kids who wore them anyway.",
    who: "Students Mary Beth Tinker, her brother John, and Christopher Eckhardt, backed by their parents, sued the Des Moines public school district.",
    rights: "It pitted students' First Amendment right to free speech against a school's authority to keep order in its hallways.",
    impact: "Students don't shed their free-speech rights at the schoolhouse gate. Schools can only silence student expression that genuinely disrupts learning, which still shapes campus speech fights today.",
  },
  "Brandenburg v. Ohio": {
    background: "A Ku Klux Klan leader gave a hateful, threatening speech at an Ohio rally that was filmed and aired on TV. Ohio convicted him under a law banning advocacy of violence to push political change.",
    who: "Clarence Brandenburg, a Klan organizer, challenged his conviction against the state of Ohio.",
    rights: "It tested how far the First Amendment protects speech that promotes violence or lawbreaking.",
    impact: "The government can only punish speech that's meant to spark imminent lawless action and is likely to actually cause it. Even ugly, extreme advocacy stays protected, setting the modern bar for incitement.",
  },
  "Engel v. Vitale": {
    background: "New York officials wrote a short, nondenominational prayer for public school students to recite each morning. Some parents objected to the state putting prayer into their kids' school day.",
    who: "A group of Long Island parents, led by Steven Engel, sued school board president William Vitale.",
    rights: "It centered on the First Amendment's Establishment Clause, which bars the government from setting up or sponsoring religion.",
    impact: "Public schools can't compose or lead official prayers, even voluntary ones. This decision still anchors the wall between church and state in America's classrooms.",
  },
  "West Virginia v. Barnette": {
    background: "West Virginia required every public school student to salute the flag and recite the Pledge of Allegiance. Jehovah's Witness children refused on religious grounds and faced expulsion and threats of reform school.",
    who: "The Barnette family, Jehovah's Witnesses, sued the West Virginia State Board of Education.",
    rights: "It raised whether the First Amendment lets the government force people to express beliefs they reject.",
    impact: "The government can't compel anyone to salute the flag or speak a patriotic pledge. The right to stay silent and not be forced into official orthodoxy remains a bedrock free-speech principle.",
  },
  "Texas v. Johnson": {
    background: "During the 1984 Republican National Convention in Dallas, protester Gregory Lee Johnson doused an American flag in kerosene and set it ablaze outside city hall. Texas convicted him of desecrating a venerated object.",
    who: "Gregory Lee Johnson, a political demonstrator, fought his conviction against the state of Texas.",
    rights: "It asked whether burning the flag in protest counts as symbolic speech shielded by the First Amendment.",
    impact: "Burning the flag as political protest is protected expression the government can't outlaw. The ruling cemented that offensive symbolic acts are still free speech, and it has blocked flag-burning bans ever since.",
  },
  "Employment Division v. Smith": {
    background: "Two drug-rehab counselors in Oregon were fired and denied unemployment benefits after using peyote in a Native American Church religious ceremony. The state treated the peyote use as illegal drug use.",
    who: "Alfred Smith and Galen Black, members of the Native American Church, challenged Oregon's Employment Division.",
    rights: "It involved the First Amendment's Free Exercise Clause and whether religion exempts people from neutral laws.",
    impact: "Neutral laws that apply to everyone can be enforced even when they burden religious practice. The decision narrowed religious exemptions and prompted Congress to pass new laws trying to restore stronger protections.",
  },
  "New York Times Co. v. Sullivan": {
    background: "A civil-rights fundraising ad in the New York Times contained a few factual errors about police conduct in Montgomery, Alabama. A local official sued for libel and won a large judgment in state court.",
    who: "Montgomery commissioner L.B. Sullivan sued the New York Times over the ad.",
    rights: "It weighed freedom of the press under the First Amendment against an official's ability to sue for defamation.",
    impact: "Public officials can only win a libel suit by proving a falsehood was published knowingly or with reckless disregard for the truth. This actual-malice rule gives the press breathing room to cover powerful people.",
  },
  "District of Columbia v. Heller": {
    background: "Washington, D.C. banned residents from keeping handguns and required any legal firearm at home to be unloaded and locked. A special police officer who wanted a handgun for self-defense was denied a permit.",
    who: "D.C. resident and security guard Dick Heller sued the District of Columbia over its handgun ban.",
    rights: "It settled whether the Second Amendment protects an individual's right to own guns or only a militia-related one.",
    impact: "Americans have an individual right to keep a handgun at home for self-defense, separate from militia service. The ruling reframed gun-rights law and launched a wave of challenges to firearm regulations.",
  },
  "McDonald v. Chicago": {
    background: "Chicago effectively banned private handgun ownership through strict registration rules. A 76-year-old resident who wanted a gun to protect himself in a high-crime neighborhood challenged the ban after Heller struck down D.C.'s.",
    who: "Chicago resident Otis McDonald, joined by others, sued the city of Chicago.",
    rights: "It asked whether the Second Amendment applies to states and cities through the Fourteenth Amendment.",
    impact: "The individual right to bear arms binds state and local governments, not just the federal government. This extended Heller nationwide and put every city and state gun law on Second Amendment footing.",
  },
  "N.Y. State Rifle & Pistol Assn. v. Bruen": {
    background: "New York required anyone seeking a license to carry a handgun in public to show a special need, or proper cause, beyond a general wish for self-defense. Two men denied unrestricted permits sued.",
    who: "The New York State Rifle & Pistol Association and two residents sued New York official Kevin Bruen.",
    rights: "It tested whether the Second Amendment protects carrying a handgun outside the home for self-defense.",
    impact: "People have a right to carry handguns in public for self-defense, and gun laws must square with the nation's historical tradition of regulation. The history-and-tradition test now governs how courts judge firearm rules.",
  },
  "Engblom v. Carey": {
    background: "When New York's prison guards went on strike in 1979, the state evicted them from their on-site staff housing and moved National Guard troops into those rooms.",
    who: "Two striking corrections officers at a Hudson Valley prison sued New York's governor, Hugh Carey, and state officials over losing their employer-provided homes to soldiers.",
    rights: "The Third Amendment's bar on quartering soldiers in any home during peacetime without the owner's consent.",
    impact: "It remains one of the only cases to ever interpret the Third Amendment, hinting it could protect tenants and apply beyond literal homeownership, though the right is rarely tested in modern life.",
  },
  "Mapp v. Ohio": {
    background: "Cleveland police forced their way into Dollree Mapp's home hunting for a bombing suspect, found none, but seized allegedly obscene materials and arrested her, never producing a valid search warrant.",
    who: "Dollree Mapp, a Cleveland woman convicted on the seized evidence, challenged her conviction against the State of Ohio.",
    rights: "The Fourth Amendment's protection against unreasonable searches and seizures.",
    impact: "Evidence gathered through an illegal search can't be used in state criminal trials, forcing police nationwide to follow warrant rules or risk seeing their case thrown out.",
  },
  "Katz v. United States": {
    background: "FBI agents taped a recording device to the outside of a public phone booth to capture Charles Katz placing illegal gambling bets, without ever getting a warrant.",
    who: "Charles Katz, a bookmaker convicted using the recordings, fought his conviction against the federal government.",
    rights: "The Fourth Amendment's protection against unreasonable searches, reframed around personal privacy rather than physical trespass.",
    impact: "Privacy travels with you, not just your property, so the government generally needs a warrant to eavesdrop wherever you reasonably expect to be left alone.",
  },
  "Terry v. Ohio": {
    background: "A Cleveland detective watched two men repeatedly pace past a store window as if casing it for a robbery, stopped them, patted them down, and found concealed guns.",
    who: "John Terry, convicted of carrying a concealed weapon, challenged the pat-down against the State of Ohio.",
    rights: "The Fourth Amendment's protection against unreasonable searches and seizures.",
    impact: "Police can briefly stop and frisk someone based on reasonable suspicion of crime, short of full probable cause, which underlies modern stop-and-frisk policing and ongoing fights over its fairness.",
  },
  "Riley v. California": {
    background: "After arresting David Riley on a weapons charge, police scrolled through his smartphone without a warrant and used photos and contacts to tie him to a gang shooting.",
    who: "David Riley, a California man linked to a shooting through his phone's contents, challenged the search against the State of California.",
    rights: "The Fourth Amendment's protection against warrantless searches incident to arrest.",
    impact: "Police must get a warrant before searching the cellphone of someone they arrest, recognizing that modern phones hold the private details of nearly our entire lives.",
  },
  "Carpenter v. United States": {
    background: "Investigating a string of robberies, the government collected 127 days of Timothy Carpenter's cellphone location records from his carrier, mapping his movements without a warrant.",
    who: "Timothy Carpenter, convicted of armed robberies traced through his phone's location history, challenged the data grab against the federal government.",
    rights: "The Fourth Amendment's protection against unreasonable searches, applied to digital location tracking.",
    impact: "Police generally need a warrant to pull your historical cellphone location data, limiting how easily the government can reconstruct where you've been over time.",
  },
  "Miranda v. Arizona": {
    background: "Police in Phoenix interrogated Ernesto Miranda for hours and got a written confession, but never told him he could stay silent or talk to a lawyer first.",
    who: "Ernesto Miranda, convicted of kidnapping and rape on his confession, challenged his conviction against the State of Arizona.",
    rights: "The Fifth Amendment right against self-incrimination and the Sixth Amendment right to counsel during questioning.",
    impact: "Before any custodial interrogation, police must read the now-famous warning about your right to remain silent and to a lawyer, or the confession can't be used against you.",
  },
  "Kelo v. City of New London": {
    background: "New London, Connecticut used eminent domain to seize Susette Kelo's well-kept home and her neighbors' houses, handing the land to a private developer for an economic revitalization plan.",
    who: "Susette Kelo, a homeowner in the Fort Trumbull neighborhood, sued the City of New London to stop the taking of her property.",
    rights: "The Fifth Amendment's Takings Clause, which lets government seize property only for public use and with just compensation.",
    impact: "Government can take private property and give it to another private party for economic development, a ruling so unpopular that most states passed laws tightening their own eminent domain limits.",
  },
  "Gideon v. Wainwright": {
    background: "Charged with breaking into a Florida pool hall, Clarence Earl Gideon asked the court for a lawyer because he couldn't afford one, was refused, defended himself, and lost.",
    who: "Clarence Earl Gideon, a poor Florida man convicted of burglary, challenged the prison official, Louie Wainwright, who held him.",
    rights: "The Sixth Amendment right to the assistance of counsel in criminal cases.",
    impact: "Anyone facing serious criminal charges who can't afford a lawyer must be given one for free, creating the public defender system that represents millions of defendants today.",
  },
  "Sheppard v. Maxwell": {
    background: "Dr. Sam Sheppard was convicted of murdering his pregnant wife after a sensational 1954 trial where reporters packed the courtroom and saturated the public with prejudicial coverage.",
    who: "Dr. Sam Sheppard, an Ohio osteopath convicted of his wife's murder, challenged his imprisonment under warden E.L. Maxwell.",
    rights: "The Sixth Amendment guarantee of a fair trial by an impartial jury, threatened by a media circus.",
    impact: "Judges must shield trials from prejudicial publicity, using tools like sequestering juries, moving venues, and limiting press, to protect a defendant's right to an impartial jury.",
  },
  "Crawford v. Washington": {
    background: "At Michael Crawford's assault trial, prosecutors played a recorded police statement from his wife, who didn't testify, so he never got to question her about it in court.",
    who: "Michael Crawford, a Washington man convicted partly on his absent wife's recorded statement, challenged his conviction against the State of Washington.",
    rights: "The Sixth Amendment's Confrontation Clause, which guarantees the accused the right to cross-examine witnesses against them.",
    impact: "Prosecutors generally can't use a witness's out-of-court statements unless the defense gets a chance to cross-examine that witness, strengthening the right to face your accuser.",
  },
  "Minneapolis & St. Louis R. Co. v. Bombolis": {
    background: "A railroad worker's widow won a damages verdict in Minnesota state court, where state rules let a jury reach a verdict without all members agreeing. The railroad appealed, arguing this violated the federal jury-trial guarantee.",
    who: "The Minneapolis & St. Louis Railroad challenged a judgment won by Bombolis, the widow of a railroad employee suing under a federal workers' injury law in state court.",
    rights: "Whether the Seventh Amendment's right to a unanimous civil jury binds state courts as well as federal ones.",
    impact: "States remain free to run their own civil juries however they choose, from non-unanimous verdicts to smaller panels, because the federal civil-jury rule applies only in federal court.",
  },
  "Colgrove v. Battin": {
    background: "A federal trial court in Montana, following a local rule, used a jury of only six people instead of twelve in a civil lawsuit. A party objected that a real jury had to have twelve members.",
    who: "Colgrove, a litigant in a federal civil case, challenged a ruling by Battin, the federal district judge who seated the six-person jury.",
    rights: "Whether the Seventh Amendment requires twelve jurors in federal civil trials.",
    impact: "Federal civil cases can be decided by six-person juries, making trials faster and cheaper, and many federal courts have used smaller juries ever since.",
  },
  "Gregg v. Georgia": {
    background: "After murdering and robbing two men, Troy Gregg was sentenced to death under Georgia's new system, which split trials into guilt and sentencing phases and guided juries with specific aggravating factors.",
    who: "Troy Gregg, a convicted murderer, challenged Georgia and its revamped death-penalty statute passed after the Supreme Court had struck down arbitrary capital sentencing.",
    rights: "Whether the death penalty itself is cruel and unusual punishment barred by the Eighth Amendment.",
    impact: "Capital punishment returned to the United States, and the guided-discretion model Georgia pioneered became the template states still use for death-penalty sentencing today.",
  },
  "Atkins v. Virginia": {
    background: "Daryl Atkins, who had an IQ around 59, was convicted of abduction, robbery, and murder and sentenced to death. He argued his intellectual disability made executing him unconstitutional.",
    who: "Daryl Atkins, a man with intellectual disability convicted of murder, challenged his death sentence in Virginia.",
    rights: "Whether executing a person with intellectual disability is cruel and unusual punishment under the Eighth Amendment.",
    impact: "States can no longer execute people with intellectual disability, and courts must evaluate disability claims before carrying out a death sentence.",
  },
  "Timbs v. Indiana": {
    background: "Tyson Timbs sold a small amount of heroin to undercover officers, and Indiana seized his $42,000 Land Rover, which he had bought with life-insurance money, even though the maximum fine for his crime was only $10,000.",
    who: "Tyson Timbs, a man whose vehicle was forfeited after a minor drug sale, sued the State of Indiana to get his car back.",
    rights: "Whether the Eighth Amendment's ban on excessive fines applies to the states and limits property forfeiture.",
    impact: "States and local governments can no longer impose grossly disproportionate fines or seize property far exceeding the offense, curbing aggressive civil forfeiture nationwide.",
  },
  "Griswold v. Connecticut": {
    background: "Estelle Griswold ran a Planned Parenthood clinic in Connecticut and was fined for giving married couples advice and prescriptions for birth control, which a state law made a crime.",
    who: "Estelle Griswold, head of Planned Parenthood in Connecticut, and a clinic doctor challenged Connecticut's law banning the use of contraceptives.",
    rights: "Whether a right to privacy, drawn from several amendments and unenumerated rights, protects married couples' choices about contraception.",
    impact: "The Court recognized a constitutional right to privacy that shaped later rulings on contraception, abortion, and personal relationships, becoming a cornerstone of modern privacy law.",
  },
  "New York v. United States": {
    background: "A federal law told states to find a way to dispose of their low-level radioactive waste or be forced to \"take title\" to it and assume liability. New York sued, saying Washington couldn't order states around like that.",
    who: "The State of New York challenged the United States over a federal radioactive-waste law that pressured states to handle their own waste.",
    rights: "Whether the Tenth Amendment bars the federal government from commandeering state legislatures to carry out federal programs.",
    impact: "Congress cannot force states to pass or enforce federal regulatory programs, a limit that protects state sovereignty across environmental, gun, and health policy fights today.",
  },
  "Printz v. United States": {
    background: "The Brady gun-control law temporarily ordered local sheriffs to run background checks on handgun buyers. Sheriffs in Montana and Arizona sued, arguing the federal government couldn't draft them into federal duty.",
    who: "Sheriff Jay Printz and a fellow local sheriff challenged the United States over the Brady Act's mandate that they perform federal background checks.",
    rights: "Whether the federal government can compel state and local officials to administer a federal program, consistent with the Tenth Amendment.",
    impact: "Washington cannot order local police or officials to enforce federal law, reinforcing that federal programs must be run with federal resources.",
  },
  "Chisholm v. Georgia": {
    background: "A South Carolina man, acting as executor for a merchant Georgia never paid for wartime supplies, sued the State of Georgia in federal court for the debt. Georgia refused to appear, claiming it couldn't be sued.",
    who: "Alexander Chisholm, a South Carolina citizen suing on behalf of an unpaid creditor's estate, took the State of Georgia to court.",
    rights: "Whether a private citizen of one state can sue another state in federal court without its consent.",
    impact: "The ruling allowed such suits, sparking such backlash that states quickly ratified the Eleventh Amendment to overturn it and shield states from many private lawsuits.",
  },
  "Ex parte Young": {
    background: "Minnesota passed steep railroad-rate limits with crushing penalties for violations. When the state attorney general moved to enforce them, shareholders sued to block him, and a federal court jailed him for defying its order.",
    who: "Edward Young, Minnesota's attorney general, was held in contempt after railroad shareholders sued in federal court to stop him from enforcing the rate law.",
    rights: "Whether state sovereign immunity blocks federal courts from stopping a state official from enforcing an unconstitutional law.",
    impact: "Federal courts can order state officials to stop enforcing laws that violate the Constitution, the main avenue people still use to challenge state action in federal court.",
  },
  "Jones v. Alfred H. Mayer Co.": {
    background: "Joseph Lee Jones, a Black man, tried to buy a home in a St. Louis-area subdivision and was refused solely because of his race. He sued the developer under a Reconstruction-era civil rights law.",
    who: "Joseph Lee Jones and his wife sued the Alfred H. Mayer Company, a private real-estate developer that refused to sell them a house because Jones was Black.",
    rights: "Whether Congress can ban private racial discrimination in property sales as a way to eliminate the badges of slavery under the Thirteenth Amendment.",
    impact: "Federal law bars racial discrimination in selling or renting property by private parties, giving buyers and renters a powerful tool against housing discrimination today.",
  },
  "United States v. Wong Kim Ark": {
    background: "Wong Kim Ark, born in San Francisco to Chinese immigrant parents, returned from a trip abroad and was denied reentry by officials who claimed he wasn't a U.S. citizen under the Chinese Exclusion laws.",
    who: "Wong Kim Ark, a cook born on American soil, sued the federal government after customs officials refused to let him back into the country.",
    rights: "The 14th Amendment's promise that everyone born in the United States is a citizen, regardless of their parents' race or nationality.",
    impact: "Birthright citizenship is the law of the land: if you're born here, you're an American, no matter where your parents came from.",
  },
  "Brown v. Board of Education": {
    background: "Black families in Topeka and several other districts challenged laws forcing their children into separate, often inferior, all-Black public schools.",
    who: "Linda Brown's father Oliver and other Black parents sued local school boards that barred their kids from nearby whites-only schools.",
    rights: "The 14th Amendment's guarantee of equal protection, applied to public education.",
    impact: "Segregated schools were ruled unconstitutional, igniting the civil rights movement and ending the lie that \"separate but equal\" could ever be equal.",
  },
  "United States v. Virginia": {
    background: "The Virginia Military Institute, a state-funded college, admitted only men and offered women a watered-down separate program instead.",
    who: "The federal government sued the Commonwealth of Virginia on behalf of women shut out of VMI's prestigious military-style education.",
    rights: "The 14th Amendment's equal protection clause, which demands an \"exceedingly persuasive\" reason for treating men and women differently.",
    impact: "Public institutions can't slam the door on women without an extremely strong justification, opening doors at military academies and beyond.",
  },
  "Obergefell v. Hodges": {
    background: "Jim Obergefell married his dying partner in another state, but Ohio refused to list him as the surviving spouse on the death certificate.",
    who: "Jim Obergefell and other same-sex couples sued state officials, including Ohio health director Richard Hodges, who refused to recognize their marriages.",
    rights: "The 14th Amendment's guarantees of liberty and equal protection, covering the fundamental right to marry.",
    impact: "Same-sex couples can marry in every state and have those marriages recognized nationwide, with the same legal rights as any other married couple.",
  },
  "Guinn v. United States": {
    background: "Oklahoma made voters pass a literacy test but exempted anyone whose grandfather could vote before the Civil War, a sneaky way to let whites skip the test while blocking Black citizens.",
    who: "The federal government prosecuted Oklahoma election officials, including Frank Guinn, for enforcing the rigged voting scheme.",
    rights: "The 15th Amendment's ban on denying the vote based on race.",
    impact: "\"Grandfather clauses\" designed to disenfranchise Black voters were struck down, an early crack in the wall of Jim Crow voting tricks.",
  },
  "Smith v. Allwright": {
    background: "Texas let the Democratic Party run its primaries as a private club that admitted only white members, effectively locking Black citizens out of the only elections that mattered in a one-party state.",
    who: "Lonnie Smith, a Black dentist in Houston, sued election official S.S. Allwright after being refused a primary ballot.",
    rights: "The 15th Amendment's guarantee that race can't be used to deny the right to vote.",
    impact: "The \"white primary\" was abolished, restoring Black voters' say in the elections that actually decided who held power across the South.",
  },
  "Pollock v. Farmers' Loan & Trust Co.": {
    background: "Congress passed a flat tax on income from property and investments, and a shareholder sued his own bank to stop it from paying the new tax.",
    who: "Charles Pollock, a stockholder, sued Farmers' Loan & Trust Company to block it from handing over income tax on his behalf.",
    rights: "The Constitution's rule that direct taxes must be split among the states by population, before the 16th Amendment existed.",
    impact: "A federal income tax was ruled unconstitutional, a roadblock that Americans removed years later by ratifying the 16th Amendment.",
  },
  "Brushaber v. Union Pacific R. Co.": {
    background: "Just after the 16th Amendment passed, a railroad shareholder sued to stop his company from paying the brand-new federal income tax, arguing it was still illegal.",
    who: "Frank Brushaber, a Union Pacific stockholder, sued the railroad to block it from paying the income tax.",
    rights: "The 16th Amendment's power letting Congress tax income without dividing it among the states by population.",
    impact: "The modern federal income tax was confirmed as fully constitutional, cementing the system that funds the U.S. government today.",
  },
  "Leser v. Garnett": {
    background: "After two Maryland women registered to vote, a local citizen sued to strike their names, claiming the newly ratified 19th Amendment wasn't validly added to the Constitution.",
    who: "Oscar Leser sued Baltimore election official J. Mercer Garnett to cancel the registration of women voters.",
    rights: "The 19th Amendment's guarantee that the vote can't be denied based on sex.",
    impact: "Women's right to vote was locked in as a legitimate part of the Constitution, shutting down challenges to its ratification for good.",
  },
  "Granholm v. Heald": {
    background: "Michigan and New York let their own wineries ship bottles straight to customers' doors but blocked out-of-state wineries from doing the same.",
    who: "Out-of-state wineries and wine lovers, including Eleanor Heald, sued state officials such as Michigan Governor Jennifer Granholm over the lopsided shipping rules.",
    rights: "The clash between the 21st Amendment's grant of state power over alcohol and the Constitution's ban on states discriminating against interstate commerce.",
    impact: "States must treat in-state and out-of-state wineries equally, which is why so many people can now order wine shipped directly from across the country.",
  },
  "Harman v. Forssenius": {
    background: "After the 24th Amendment banned poll taxes in federal elections, Virginia tried a workaround: voters who didn't pay the tax had to file a separate residency certificate weeks in advance.",
    who: "Voters led by the Forssenius family sued Virginia election official Harman to kill the burdensome certificate requirement.",
    rights: "The 24th Amendment's ban on conditioning the right to vote in federal elections on paying a poll tax.",
    impact: "States can't dodge the poll-tax ban with paperwork hurdles, keeping federal voting free of fees and obstacles meant to discourage the poor.",
  },
  "Harper v. Virginia Board of Elections": {
    background: "Virginia charged residents a small poll tax to vote in state elections, and a group of poor residents sued, saying they shouldn't have to pay to cast a ballot.",
    who: "Annie Harper and other low-income Virginia residents sued the state Board of Elections over the fee.",
    rights: "The 14th Amendment's equal protection clause, applied to wealth-based barriers at the ballot box.",
    impact: "Poll taxes were wiped out in all elections, establishing that your right to vote can never depend on how much money you have.",
  },
  "Oregon v. Mitchell": {
    background: "Congress passed a law lowering the voting age to 18 nationwide, and states pushed back, arguing Washington couldn't dictate the voting age for their own state and local elections.",
    who: "Oregon and other states squared off against U.S. Attorney General John Mitchell over the federal voting-age law.",
    rights: "The limits of Congress's power over elections, and the constitutional tug-of-war between federal and state control of voting rules.",
    impact: "The messy split ruling, valid for federal but not state elections, created such chaos that the country quickly passed the 26th Amendment setting the voting age at 18 everywhere.",
  },
  "Near v. Minnesota": {
    background: "Minnesota used a state law to permanently silence a scandal-mongering Minneapolis paper that ran sensational, anti-Semitic articles accusing local officials of corruption.",
    who: "Newspaper publisher Jay Near challenged Minnesota officials who had used a state nuisance law to shut his paper down.",
    rights: "The First Amendment's freedom of the press and its bar on prior restraint, applied to the states through the Fourteenth Amendment.",
    impact: "It became the foundation of American press freedom, establishing that censorship before publication is almost always unconstitutional.",
  },
  "New York Times Co. v. United States": {
    background: "Newspapers obtained a leaked classified history of the Vietnam War revealing how officials misled the public, and the Nixon administration sued to stop them from printing it.",
    who: "The federal government sued The New York Times and The Washington Post to halt publication of the leaked study.",
    rights: "The First Amendment's freedom of the press and its strong rule against prior restraint — censoring material before it is published.",
    impact: "It cemented the press's power to publish leaked government secrets, making prior restraint nearly impossible and protecting investigative journalism today.",
  },
  "Citizens United v. FEC": {
    background: "A conservative nonprofit wanted to air and advertise a film attacking Hillary Clinton during the 2008 primaries, but federal law barred corporations from funding such election-time broadcasts.",
    who: "Citizens United, a conservative advocacy group, sued the Federal Election Commission, the agency that enforces campaign finance laws.",
    rights: "The First Amendment's protection of free speech, including spending money to spread political messages.",
    impact: "It opened the floodgates for super PACs and unlimited outside spending, reshaping how billions of dollars flow into American elections every cycle.",
  },
  "United States v. Miller": {
    background: "Two men were charged with transporting an unregistered short-barreled shotgun across state lines in violation of a federal firearms tax law.",
    who: "The federal government prosecuted Jack Miller and Frank Layton for carrying an illegal sawed-off shotgun.",
    rights: "The Second Amendment's right to keep and bear arms, read in connection with maintaining a militia.",
    impact: "For decades it anchored the view that gun rights are tied to militia service, shaping firearms regulation until later cases recognized an individual right.",
  },
  "United States v. Rahimi": {
    background: "A Texas man under a protective order for assaulting his girlfriend was found with firearms after being tied to multiple shootings, and he challenged the federal law disarming him.",
    who: "Zackey Rahimi challenged his federal conviction; the United States defended the law banning gun possession by people under domestic-violence orders.",
    rights: "The Second Amendment's right to keep and bear arms, weighed against the government's power to disarm dangerous people.",
    impact: "It confirmed that proven-dangerous individuals can lose gun rights, clarifying how courts apply the history-and-tradition test from the Bruen decision.",
  },
  "New Jersey v. T.L.O.": {
    background: "A teacher caught a 14-year-old girl smoking in a school bathroom, and an assistant principal searched her purse, finding cigarettes plus evidence she was dealing marijuana.",
    who: "New Jersey prosecuted the student, identified only by her initials T.L.O., who argued the school's search of her purse was illegal.",
    rights: "The Fourth Amendment's protection against unreasonable searches and seizures, as it applies inside public schools.",
    impact: "It set the rules for searches in schools nationwide, letting administrators check students, bags, and lockers without a warrant or probable cause.",
  },
  "Powell v. Alabama": {
    background: "Nine Black teenagers, the Scottsboro Boys, were rushed to trial and sentenced to death for raping two white women on dubious evidence, with no meaningful legal help.",
    who: "Ozie Powell and the other Scottsboro defendants appealed their convictions against the state of Alabama.",
    rights: "The Sixth Amendment's right to counsel, enforced against the states through the Fourteenth Amendment's guarantee of due process.",
    impact: "It established that the poor must receive appointed lawyers in capital cases, an early step toward today's guaranteed right to a defense attorney.",
  },
  "Batson v. Kentucky": {
    background: "At a Black man's burglary trial, the prosecutor used jury strikes to remove every Black potential juror, leaving an all-white jury that convicted him.",
    who: "James Batson, a Black defendant, challenged the Kentucky prosecutor who struck all the Black jurors from his trial.",
    rights: "The right to an impartial jury and the Fourteenth Amendment's guarantee of equal protection against racial discrimination.",
    impact: "It gave defendants a tool to challenge race-based jury strikes, a safeguard known as a Batson challenge still used in courtrooms every day.",
  },
  "Furman v. Georgia": {
    background: "William Furman killed a homeowner during a botched burglary, reportedly when his gun went off as he fled. He was sentenced to death under a system that gave juries near-total discretion.",
    who: "William Furman, a Black man convicted of murder in Georgia, challenged his death sentence against the state of Georgia.",
    rights: "The Eighth Amendment's ban on cruel and unusual punishment, paired with concerns about arbitrary and discriminatory sentencing.",
    impact: "It halted executions across the country and forced states to rewrite their death-penalty laws, paving the way for the guided sentencing systems upheld four years later in Gregg v. Georgia.",
  },
  "Roper v. Simmons": {
    background: "At 17, Christopher Simmons planned and committed a brutal murder, then bragged he would get away with it because he was a minor. He was sentenced to death in Missouri.",
    who: "Missouri, represented by official Donald Roper, defended the death sentence against Christopher Simmons, who was a juvenile when he committed the crime.",
    rights: "The Eighth Amendment's protection against cruel and unusual punishment as applied to juvenile offenders.",
    impact: "It ended the juvenile death penalty nationwide, recognizing that teenagers are less mature and more capable of change than adults, and reshaping how the law treats youth crime.",
  },
  "Plessy v. Ferguson": {
    background: "Homer Plessy, who was one-eighth Black, deliberately sat in a whites-only railroad car in Louisiana to test the state's segregation law and was arrested.",
    who: "Homer Plessy, a mixed-race passenger, challenged Louisiana judge John Ferguson, who upheld the law requiring separate train cars by race.",
    rights: "The Fourteenth Amendment's guarantee of equal protection under the law.",
    impact: "It blessed 'separate but equal' and entrenched Jim Crow segregation for nearly 60 years, until Brown v. Board of Education overturned it in 1954.",
  },
  "Loving v. Virginia": {
    background: "Richard Loving, a white man, and Mildred Jeter, a Black and Native American woman, married in Washington, D.C., then returned home to Virginia, where police arrested them in their bedroom for violating the state's ban on interracial marriage.",
    who: "Richard and Mildred Loving, an interracial couple convicted under Virginia law, challenged the Commonwealth of Virginia.",
    rights: "The Fourteenth Amendment's equal protection and due process guarantees, including the fundamental right to marry.",
    impact: "It struck down interracial marriage bans across the country and became a cornerstone precedent later cited to support the right to same-sex marriage.",
  },
  "Roe v. Wade": {
    background: "An unmarried pregnant woman using the alias Jane Roe challenged a Texas law that banned abortion except to save the mother's life, arguing it violated her constitutional rights.",
    who: "Norma McCorvey, known as Jane Roe, sued Henry Wade, the district attorney of Dallas County, Texas.",
    rights: "The Fourteenth Amendment's due process clause and the right to privacy it was understood to protect.",
    impact: "It established a nationwide right to abortion for nearly 50 years and became one of the most debated rulings in American history, until it was overturned by Dobbs in 2022.",
  },
  "Lawrence v. Texas": {
    background: "Police entered John Lawrence's Houston apartment on a false report and found him having sex with another man. Both were arrested under a Texas law banning same-sex intimacy.",
    who: "John Lawrence and Tyron Garner, two men arrested in their home, challenged the state of Texas.",
    rights: "The Fourteenth Amendment's due process clause and the liberty and privacy of consenting adults.",
    impact: "It struck down sodomy laws nationwide, affirmed the dignity of gay and lesbian Americans, and laid the groundwork for the later recognition of same-sex marriage.",
  },
  "Dobbs v. Jackson Women's Health Organization": {
    background: "Mississippi passed a law banning most abortions after 15 weeks, directly challenging the framework set by Roe v. Wade. The state's last abortion clinic sued to block it.",
    who: "Mississippi health officer Thomas Dobbs defended the state law against Jackson Women's Health Organization, the state's only abortion clinic.",
    rights: "Whether the Fourteenth Amendment's due process clause protects a right to abortion.",
    impact: "It overturned Roe v. Wade and Casey, ending the federal right to abortion and leaving each state free to permit, restrict, or ban the procedure.",
  },
  "Shelby County v. Holder": {
    background: "Shelby County, Alabama sued to challenge the Voting Rights Act, arguing that the decades-old formula used to single out states with histories of discrimination no longer reflected current conditions.",
    who: "Shelby County, Alabama challenged U.S. Attorney General Eric Holder, who defended the federal law.",
    rights: "The Fifteenth Amendment's protection of voting rights and the limits on federal power over state elections.",
    impact: "It freed states with histories of discrimination from needing federal preclearance, and many quickly enacted new voting restrictions like voter ID laws and poll closures.",
  },
  "Schenck v. United States": {
    background: "During World War I, Charles Schenck mailed leaflets urging draftees to resist conscription. He was convicted under the Espionage Act for obstructing the military draft.",
    who: "Charles Schenck, a Socialist Party official, against the federal government prosecuting him for anti-draft leaflets.",
    rights: "The First Amendment's protection of free speech and how far it stretches during wartime.",
    impact: "It launched the 'clear and present danger' standard for limiting speech. The famous 'fire in a theater' line still echoes, though later cases sharply narrowed when speech can actually be punished.",
  },
  "Gitlow v. New York": {
    background: "Benjamin Gitlow published a radical manifesto calling for socialist revolution and was convicted under a New York law banning advocacy of overthrowing the government.",
    who: "Benjamin Gitlow, a Communist activist, against the state of New York, which prosecuted him for his published manifesto.",
    rights: "Free speech under the First Amendment, applied to states through the Fourteenth Amendment's due process clause.",
    impact: "It started 'incorporation' — the idea that the Bill of Rights binds state governments too. Today most constitutional rights protect you against your state, not just Washington.",
  },
  "Lemon v. Kurtzman": {
    background: "Pennsylvania and Rhode Island used taxpayer money to help pay salaries and costs at religious private schools. Taxpayers challenged the programs as government support for religion.",
    who: "Taxpayers and citizens challenging state officials, including Pennsylvania's superintendent Kurtzman, over public funding flowing to church-run schools.",
    rights: "The First Amendment's Establishment Clause, which bars government from promoting or supporting religion.",
    impact: "It created the three-part 'Lemon test' — secular purpose, no religion-advancing effect, no excessive entanglement — that courts used for decades to judge church-state disputes.",
  },
  "Wisconsin v. Yoder": {
    background: "Wisconsin fined Amish parents for refusing to send their teenagers to school past eighth grade, which conflicted with their faith's way of life. The parents fought the penalty.",
    who: "Amish families led by Jonas Yoder against the state of Wisconsin, which enforced its compulsory school-attendance law.",
    rights: "The First Amendment's Free Exercise Clause, protecting the right to live by religious belief.",
    impact: "It carved out a religious exemption from a neutral, generally applicable law, strengthening parents' power to direct their children's upbringing on faith grounds.",
  },
  "Miller v. California": {
    background: "Marvin Miller mass-mailed brochures advertising sexually explicit books, and unwilling recipients complained. He was convicted under California's obscenity law.",
    who: "Marvin Miller, who ran a mail-order adult-material business, against the state of California prosecuting him.",
    rights: "The First Amendment and the boundary between protected expression and unprotected obscene material.",
    impact: "It set the modern three-part test for obscenity, letting local 'community standards' decide what crosses the line — still the rule governing explicit material, art, and censorship today.",
  },
  "Weeks v. United States": {
    background: "Federal officers searched Fremont Weeks's home without a warrant and took papers used to convict him of running an illegal lottery by mail. He demanded the items back.",
    who: "Fremont Weeks against federal officers and prosecutors who searched his house and used the seized evidence against him.",
    rights: "The Fourth Amendment's ban on unreasonable searches and seizures.",
    impact: "It created the 'exclusionary rule,' throwing out illegally obtained evidence in federal cases. Later extended to states, it remains the main deterrent against unlawful police searches.",
  },
  "Olmstead v. United States": {
    background: "Federal agents tapped the phone lines of bootlegger Roy Olmstead by attaching to wires outside his property, gathering evidence of a massive Prohibition-era liquor operation.",
    who: "Roy Olmstead, a Seattle bootlegging kingpin, against federal agents who wiretapped his telephones.",
    rights: "The Fourth Amendment's protection against unreasonable searches, and whether it covers private conversations.",
    impact: "It let warrantless wiretaps stand for decades. Justice Brandeis's dissent championing 'the right to be let alone' later inspired the privacy rulings that overturned this decision.",
  },
  "Kyllo v. United States": {
    background: "Agents suspected Danny Kyllo of growing marijuana and used a thermal imager from the street to detect heat from grow lamps inside his home, then got a warrant.",
    who: "Danny Kyllo against federal agents who scanned his house with thermal-imaging technology.",
    rights: "The Fourth Amendment's protection of the home against warrantless searches using new technology.",
    impact: "It drew a firm line at the front door: police can't use sense-enhancing tech to explore a home's interior without a warrant, a key check on surveillance technology.",
  },
  "United States v. Jones": {
    background: "Police suspected Antoine Jones of drug trafficking, attached a GPS device to his wife's car without a valid warrant, and tracked his movements around the clock for 28 days.",
    who: "Antoine Jones, a nightclub owner accused of dealing drugs, against the federal government that tracked his vehicle.",
    rights: "The Fourth Amendment's protection against unreasonable searches, applied to physical GPS tracking devices.",
    impact: "It confirmed that long-term digital tracking is a search, shaping modern limits on how police use GPS, cellphones, and location data to monitor people.",
  },
  "Benton v. Maryland": {
    background: "John Benton was acquitted of larceny but convicted of burglary, then retried on both charges after his first trial was voided, and convicted of larceny the second time.",
    who: "John Benton, a Maryland man convicted of burglary and larceny, challenged his retrial against the State of Maryland.",
    rights: "The Fifth Amendment's Double Jeopardy Clause, which bars being prosecuted twice for the same offense.",
    impact: "Double jeopardy protection now applies in every state courtroom, so a fresh trial after acquittal is off the table nationwide.",
  },
  "Penn Central Transportation Co. v. New York City": {
    background: "Penn Central wanted to build a 50-story office tower over Grand Central Terminal, but the city's landmarks commission rejected the plan to protect the historic station.",
    who: "Penn Central, owner of Grand Central Terminal, sued New York City over its landmark-preservation denial.",
    rights: "The Fifth Amendment's Takings Clause, which requires just compensation when government takes private property.",
    impact: "Cities can enforce zoning and historic-preservation rules without paying owners, using the case's flexible test to weigh when regulation crosses into a taking.",
  },
  "Dickerson v. United States": {
    background: "After Charles Dickerson confessed without full Miranda warnings, prosecutors invoked an old federal law saying confessions only need to be voluntary, trying to sidestep Miranda entirely.",
    who: "Charles Dickerson, charged with bank robbery, fought the federal government's attempt to use his unwarned statement.",
    rights: "The Fifth Amendment privilege against self-incrimination, enforced through the familiar Miranda warnings.",
    impact: "Police everywhere must still warn suspects of their rights before questioning, and lawmakers cannot legislate Miranda away.",
  },
  "Duncan v. Louisiana": {
    background: "Gary Duncan was convicted of battery and sentenced to jail by a Louisiana judge alone, after the state denied his request for a jury trial on the misdemeanor.",
    who: "Gary Duncan, a young Black man convicted of simple battery, challenged the State of Louisiana's no-jury rule.",
    rights: "The Sixth Amendment right to a jury trial in serious criminal prosecutions.",
    impact: "Defendants facing serious charges in any state are guaranteed a jury of peers rather than a single judge deciding their fate.",
  },
  "Faretta v. California": {
    background: "Anthony Faretta wanted to represent himself at his theft trial, but the judge forced a public defender on him, and he was convicted.",
    who: "Anthony Faretta, a California defendant who insisted on conducting his own defense, fought the State of California.",
    rights: "The Sixth Amendment right to counsel, which includes the flip side: the right to refuse counsel and self-represent.",
    impact: "People can choose to act as their own lawyer in court, so long as they knowingly give up the help of an attorney.",
  },
  "Strickland v. Washington": {
    background: "David Washington pleaded guilty to murder and was sentenced to death, then argued his lawyer failed him by not gathering evidence to argue against execution.",
    who: "David Washington, a death-row inmate, claimed his trial attorney's poor performance violated his rights against the state.",
    rights: "The Sixth Amendment right to effective assistance of counsel.",
    impact: "Defendants challenging their lawyers must clear a high two-part bar, proving both serious errors and that those errors probably affected the verdict.",
  },
  "Trop v. Dulles": {
    background: "Albert Trop, an Army soldier, deserted for a single day during World War II and was later stripped of his U.S. citizenship as punishment.",
    who: "Albert Trop, a wartime deserter, challenged Secretary of State John Foster Dulles over the loss of his citizenship.",
    rights: "The Eighth Amendment ban on cruel and unusual punishment.",
    impact: "Government cannot use loss of citizenship as criminal punishment, and courts now judge cruelty by society's evolving standards of decency.",
  },
  "Estelle v. Gamble": {
    background: "Inmate J.W. Gamble injured his back doing prison labor and claimed Texas officials failed to properly diagnose and treat him over months of complaints.",
    who: "J.W. Gamble, a Texas prisoner, sued corrections official W.J. Estelle over his medical care behind bars.",
    rights: "The Eighth Amendment protection against cruel and unusual punishment.",
    impact: "Prisons must provide adequate medical care, and deliberately ignoring inmates' serious health needs can be a constitutional violation.",
  },
  "Graham v. Florida": {
    background: "Terrance Graham, 16 when he committed armed burglary and robbery, was sentenced to life without parole in Florida for violating his probation.",
    who: "Terrance Graham, a juvenile offender, challenged his life sentence against the State of Florida.",
    rights: "The Eighth Amendment ban on cruel and unusual punishment as applied to young offenders.",
    impact: "Juveniles convicted of non-homicide crimes must be given a realistic chance at release, reflecting that young people can change.",
  },
  "South Dakota v. Dole": {
    background: "Federal law withheld 5 percent of highway funds from any state that let people under 21 buy alcohol. South Dakota, which allowed 19-year-olds to buy low-alcohol beer, fought the condition as an overreach into state turf.",
    who: "The state of South Dakota challenged Elizabeth Dole, the U.S. Secretary of Transportation enforcing the funding rule.",
    rights: "The Tenth Amendment's reservation of powers to the states, set against Congress's spending power to attach conditions to federal grants.",
    impact: "Washington can nudge states toward national goals by dangling federal dollars with strings attached. This conditional-spending playbook now shapes everything from highway rules to education and health funding.",
  },
  "Murphy v. NCAA": {
    background: "A 1992 federal law barred states from legalizing sports betting. New Jersey, wanting casinos and tracks to take wagers, repealed its own ban and got sued by the sports leagues for defying the federal rule.",
    who: "New Jersey officials, led by Governor Phil Murphy, faced off against the NCAA and the major professional sports leagues.",
    rights: "The Tenth Amendment's anti-commandeering principle, which forbids Congress from forcing states to enact or maintain particular laws.",
    impact: "States are free to legalize and regulate sports betting, and dozens quickly did. The ruling also strengthened the broader shield against federal commandeering of state lawmaking.",
  },
  "Hans v. Louisiana": {
    background: "A Louisiana man held state bonds and sued Louisiana in federal court after it stopped paying the promised interest. The state argued it simply could not be sued without agreeing to it.",
    who: "Bondholder Bernard Hans sued his own state, Louisiana, to collect on defaulted bond interest.",
    rights: "The Eleventh Amendment and the underlying doctrine of state sovereign immunity from private lawsuits.",
    impact: "States enjoy broad immunity from being sued in federal court, even by their own residents. This expansive reading still limits when people can drag a state into federal litigation.",
  },
  "Seminole Tribe v. Florida": {
    background: "A federal gaming law let tribes sue states that refused to negotiate in good faith over casino compacts. The Seminole Tribe sued Florida under it, and Florida insisted it was immune from such a suit.",
    who: "The Seminole Tribe of Florida sued the state of Florida and its governor over stalled casino negotiations.",
    rights: "Congress's Article I commerce powers set against the Eleventh Amendment's protection of state sovereign immunity.",
    impact: "Congress mostly can't strip states of immunity using its everyday legislative powers. The decision fortified states' rights and reshaped how federal laws can be enforced against states.",
  },
  "Civil Rights Cases": {
    background: "The Civil Rights Act of 1875 made it illegal for hotels, theaters, and railroads to refuse Black customers. Several prosecutions of private businesses that turned people away were bundled together and challenged.",
    who: "The federal government prosecuted private businesses and individuals who had denied service to Black patrons.",
    rights: "The Thirteenth and Fourteenth Amendments, read as reaching government action rather than the conduct of private businesses.",
    impact: "Federal anti-discrimination power was confined to state action, leaving private racial discrimination untouched for decades. Not until the 1960s did Congress find new footing to outlaw it.",
  },
  "Bailey v. Alabama": {
    background: "Alabama law treated a worker who took an advance and then left the job as a criminal fraudster, with the unpaid debt as proof. Alonzo Bailey, a Black laborer, was convicted after walking off a farm job.",
    who: "Alonzo Bailey, a Black farm laborer, challenged his conviction against the state of Alabama.",
    rights: "The Thirteenth Amendment's ban on involuntary servitude and peonage — debt-bondage labor.",
    impact: "States could no longer use criminal law to chain workers to employers over small debts. The ruling struck a blow against the peonage that trapped many Black laborers across the South.",
  },
  "Slaughter-House Cases": {
    background: "Louisiana granted one company a monopoly over New Orleans slaughterhouses, forcing rival butchers to pay to use it. The shut-out butchers argued the new Fourteenth Amendment protected their right to work.",
    who: "Independent New Orleans butchers sued over a state-granted slaughterhouse monopoly backed by Louisiana.",
    rights: "The first reading of the Fourteenth Amendment's privileges or immunities clause and the scope of national citizenship rights.",
    impact: "By splitting national from state citizenship and reading the clause narrowly, the decision drained it of force. Much of the Amendment's promise later had to be revived through its due process and equal protection clauses instead.",
  },
  "Yick Wo v. Hopkins": {
    background: "San Francisco required permits to run laundries in wooden buildings, then granted them to nearly all white owners while denying virtually every Chinese applicant. Yick Wo kept operating and was jailed.",
    who: "Yick Wo, a Chinese immigrant laundry owner, challenged his jailing by sheriff Peter Hopkins.",
    rights: "The Fourteenth Amendment's Equal Protection Clause, held to protect all persons, not just citizens.",
    impact: "Even a neutral law becomes unconstitutional when officials wield it to discriminate by race. This early equal-protection win still anchors challenges to biased enforcement and protects non-citizens.",
  },
  "Reed v. Reed": {
    background: "When their teenage son died, an Idaho mother and father each sought to manage his small estate. State law broke the tie by automatically choosing the father simply because he was male.",
    who: "Sally Reed challenged her estranged husband Cecil Reed and the Idaho law that favored him.",
    rights: "The Fourteenth Amendment's Equal Protection Clause, applied to discrimination based on sex.",
    impact: "Laws that treat men and women differently without good reason now face real constitutional scrutiny. This breakthrough opened the door to decades of legal challenges to sex discrimination.",
  },
  "Reynolds v. Sims": {
    background: "Alabama hadn't redrawn its legislative maps in decades, so booming cities had the same representation as tiny rural counties. Voters in underrepresented urban areas sued, saying their ballots counted for far less.",
    who: "Alabama voters led by M.O. Sims sued state election official B.A. Reynolds over malapportioned districts.",
    rights: "The Fourteenth Amendment's Equal Protection Clause and the equal weight of every citizen's vote.",
    impact: "Both houses of every state legislature must be apportioned by population, so each vote carries equal weight. The ruling forced nationwide redistricting and shifted power toward growing cities and suburbs.",
  },
  "South Carolina v. Katzenbach": {
    background: "After the 1965 Voting Rights Act suspended literacy tests and sent federal examiners into states with a history of voter discrimination, South Carolina sued, claiming Congress had overstepped its authority.",
    who: "The state of South Carolina challenged the U.S. Attorney General, Nicholas Katzenbach, who enforced the new federal voting law.",
    rights: "The 15th Amendment's ban on denying the vote based on race, and Congress's power to enforce it with appropriate legislation.",
    impact: "It gave the landmark Voting Rights Act its constitutional footing, unleashing federal oversight that registered millions of Black voters across the South.",
  },
  "Gomillion v. Lightfoot": {
    background: "Alabama redrew Tuskegee's boundaries from a simple square into a jagged 28-sided figure, deliberately cutting nearly every Black voter out of the city while keeping white voters in.",
    who: "Charles Gomillion, a Black Tuskegee resident, sued city mayor Phil Lightfoot over the gerrymandered map.",
    rights: "The 15th Amendment's guarantee that race cannot be used to deny or take away the right to vote.",
    impact: "It established that racial gerrymandering is unconstitutional, opening the courthouse door to challenges against maps drawn to dilute minority voting power.",
  },
  "Eisner v. Macomber": {
    background: "Standard Oil of California paid shareholders a dividend in extra stock rather than cash. The government tried to tax it as income, even though shareholders had not actually cashed anything out.",
    who: "Shareholder Myrtle Macomber challenged tax collector Mark Eisner over taxing her new shares.",
    rights: "The 16th Amendment's power to tax income, and the question of what truly counts as taxable income.",
    impact: "It anchored the idea that income must be realized gain, shaping how dividends, stock splits, and unrealized profits are taxed to this day.",
  },
  "National Prohibition Cases": {
    background: "Brewers, states, and businesses challenged the newly ratified ban on alcohol and the Volstead Act enforcing it, arguing the amendment was improperly adopted and overreached.",
    who: "Liquor and brewing interests, including the state of Rhode Island, challenged the federal government over nationwide prohibition.",
    rights: "The validity of the 18th Amendment's nationwide alcohol ban and Congress's power to enforce it through the Volstead Act.",
    impact: "It locked in nationwide Prohibition until the 18th Amendment was repealed in 1933, and remains the only on-point ruling on that now-defunct amendment.",
  },
  "Tennessee Wine & Spirits Retailers Assn. v. Thomas": {
    background: "Tennessee required anyone seeking a liquor-store license to have lived in the state for two years, a rule that blocked newcomers like a national chain and an out-of-state couple from opening shops.",
    who: "An association of Tennessee liquor retailers fought to keep the residency rule against challengers backed by the state's alcohol regulator, Clayton Byrd Thomas.",
    rights: "The 21st Amendment's power over alcohol versus the Constitution's ban on states discriminating against interstate commerce.",
    impact: "It confirmed that the 21st Amendment does not let states protect local businesses by walling out competitors, expanding access to interstate alcohol sales.",
  },
  "303 Creative v. Elenis": {
    background: "Lorie Smith, a Colorado web designer, wanted to build wedding websites but not for same-sex weddings, and challenged a state anti-discrimination law before being penalized under it.",
    who: "Lorie Smith and her studio 303 Creative challenged Colorado civil-rights official Aubrey Elenis.",
    rights: "The First Amendment's free-speech protection against being compelled to create expressive work.",
    impact: "The government can't force someone who creates custom expression to voice a message they disagree with — though exactly where that line falls between protected speech and ordinary commerce remains hotly contested.",
  },
  "Tennessee v. Garner": {
    background: "A Memphis officer shot and killed Edward Garner, an unarmed 15-year-old, as he fled over a fence from a suspected house burglary.",
    who: "Edward Garner's father sued the Memphis police and the state of Tennessee over the killing.",
    rights: "The Fourth Amendment, which treats using deadly force to stop someone as a 'seizure' that must be reasonable.",
    impact: "Police can't use deadly force on a fleeing suspect unless the person poses a real threat of serious harm — a core rule in today's debates over police shootings.",
  },
  "Graham v. Connor": {
    background: "Dethorne Graham, having a diabetic emergency, was forcefully detained by officers who mistook his behavior for something suspicious, and he was injured in the encounter.",
    who: "Dethorne Graham sued Charlotte officer M.S. Connor over the rough stop.",
    rights: "The Fourth Amendment, and how courts judge whether police used excessive force.",
    impact: "Claims of police excessive force are measured by what a reasonable officer would do in the moment, not in hindsight — the standard that governs use-of-force cases nationwide.",
  },
  "Korematsu v. United States": {
    background: "During World War II, the government forced Japanese Americans on the West Coast into internment camps. Fred Korematsu, a U.S. citizen, refused to comply and was arrested.",
    who: "Fred Korematsu, an American-born citizen, challenged the United States over the wartime exclusion order.",
    rights: "Equal-protection principles and the limits on race-based government action, even in wartime.",
    impact: "The ruling upheld internment and is now widely condemned as a grave injustice, formally repudiated by the Court in 2018 — yet it introduced the 'strict scrutiny' test that today makes most race-based laws very hard to justify.",
  },
  "Bush v. Gore": {
    background: "The 2000 presidential race came down to a razor-thin Florida margin and a chaotic manual recount that used inconsistent counting standards across counties.",
    who: "Republican candidate George W. Bush sued Florida officials and his opponent, Al Gore, to stop the recount.",
    rights: "The Fourteenth Amendment's Equal Protection Clause, applied to counting ballots by uneven standards.",
    impact: "The Court halted the recount, effectively settling the presidency for Bush — a singular, much-debated ruling the majority itself said should not be treated as broad precedent.",
  },
  "Students for Fair Admissions v. Harvard": {
    background: "An advocacy group sued Harvard and the University of North Carolina, arguing their race-conscious admissions unlawfully disadvantaged Asian American applicants.",
    who: "Students for Fair Admissions challenged Harvard and the University of North Carolina.",
    rights: "The Fourteenth Amendment's Equal Protection Clause and parallel civil-rights law governing the use of race in admissions.",
    impact: "Colleges can no longer consider an applicant's race as a factor in admissions, ending decades of affirmative-action practice and reshaping how schools pursue diversity.",
  },
  "Rice v. Cayetano": {
    background: "Hawaii let only people of Native Hawaiian ancestry vote for the trustees who manage state programs for Native Hawaiians. Harold Rice, a rancher without that ancestry, was denied a ballot.",
    who: "Harold Rice sued Hawaii governor Benjamin Cayetano over the ancestry-based voting restriction.",
    rights: "The Fifteenth Amendment's bar on using race or ancestry to deny the right to vote.",
    impact: "States can't restrict voting in their elections by ancestry, even to benefit an indigenous group — showing the 15th Amendment's race-neutral command cuts in every direction.",
  },
  "Moore v. United States": {
    background: "A 2017 tax law imposed a one-time tax on Americans' shares of profits that foreign companies had earned but not paid out. Charles and Kathleen Moore challenged the tax on their stake in an overseas business.",
    who: "Charles and Kathleen Moore challenged the United States over the mandatory repatriation tax.",
    rights: "The 16th Amendment's power to tax 'income,' and whether income must be realized — actually received — to be taxed.",
    impact: "The Court upheld the tax on narrow grounds without deciding whether unrealized gains can be taxed, leaving that question — central to any future wealth tax — open.",
  },
};

// Build the canonical case list: walk every amendment, collect cases from both
// the landmark `cases[]` array and any scenario `case` refs, dedupe by name, and
// attach the amendment it belongs to plus its long-form detail.
function buildCases() {
  const byName = new Map();
  for (const a of AMENDMENTS) {
    const add = (c) => {
      if (!c || byName.has(c.name)) return;
      byName.set(c.name, {
        slug: caseSlug(c.name),
        name: c.name,
        year: c.year,
        holding: c.holding,
        n: a.n,
        short: a.short,
        title: a.title,
        detail: CASE_DETAILS[c.name] || null,
      });
    };
    (a.cases || []).forEach(add);
    (a.scenarios || []).forEach((s) => add(s.case));
  }
  return [...byName.values()].sort((x, y) => x.n - y.n || x.year - y.year);
}

export const ALL_CASES = buildCases();
export const CASE_BY_SLUG = Object.fromEntries(ALL_CASES.map((c) => [c.slug, c]));
