/**
 * KYC Reference Data — Mock global databases for Jersey financial services compliance
 * 
 * In production, these would be API connections to:
 *   - OFAC SDN (US Office of Foreign Assets Control)
 *   - EU Consolidated Financial Sanctions List
 *   - UN Security Council Consolidated List  
 *   - UK HM Treasury Sanctions List (primary for Jersey as Crown Dependency)
 *   - Jersey Sanctions & Asset-Freezing (Jersey) Law 2019 local list
 *   - Refinitiv World-Check / Dow Jones Risk & Compliance
 *   - LexisNexis / Bureau van Dijk
 */

// ─────────────────────────────────────────────────────────────────────
// SANCTIONS DATABASE — Mock entries across OFAC SDN, EU, UN, UK HMT
// ─────────────────────────────────────────────────────────────────────
export const SANCTIONS_DB = [
  // OFAC SDN entries
  { id: 'SDN-001', name: 'Viktor Nikolaevich Bout', aliases: ['Victor Bout', 'Viktor But', 'Boris Boulanov'], list: 'OFAC_SDN', jurisdiction: 'RU', entityType: 'individual', reason: 'Arms trafficking', dateAdded: '2004-04-26', programs: ['SDGT', 'TCO'] },
  { id: 'SDN-002', name: 'Sergei Mikhailovich Chemezov', aliases: ['Sergey Chemezov'], list: 'OFAC_SDN', jurisdiction: 'RU', entityType: 'individual', reason: 'Senior Russian government official', dateAdded: '2014-04-28', programs: ['UKRAINE-EO13662'] },
  { id: 'SDN-003', name: 'Rostec State Corporation', aliases: ['Russian Technologies', 'Rostek'], list: 'OFAC_SDN', jurisdiction: 'RU', entityType: 'corporate', reason: 'Russian state defence conglomerate', dateAdded: '2014-09-12', programs: ['UKRAINE-EO13662'] },
  { id: 'SDN-004', name: 'Iran Petrochemical Commercial Company', aliases: ['IPCC', 'Sherkat-e Bazargani Petroshimi-e Iran'], list: 'OFAC_SDN', jurisdiction: 'IR', entityType: 'corporate', reason: 'Petrochemical sanctions', dateAdded: '2013-06-03', programs: ['IRAN', 'IFSR'] },
  { id: 'SDN-005', name: 'Ahmad Waheed', aliases: ['Ahmad Wahid', 'Abu Ahmad'], list: 'OFAC_SDN', jurisdiction: 'AF', entityType: 'individual', reason: 'Taliban senior figure', dateAdded: '2010-02-09', programs: ['SDGT'] },
  { id: 'SDN-006', name: 'Kim Yong Chol', aliases: ['Kim Yong-chol', 'Kim Young Chul'], list: 'OFAC_SDN', jurisdiction: 'KP', entityType: 'individual', reason: 'DPRK weapons programme', dateAdded: '2016-07-06', programs: ['DPRK3'] },
  { id: 'SDN-007', name: 'Banco Delta Asia SARL', aliases: ['BDA', 'Delta Asia Financial Group'], list: 'OFAC_SDN', jurisdiction: 'MO', entityType: 'corporate', reason: 'DPRK money laundering concern', dateAdded: '2005-09-15', programs: ['DPRK'] },
  { id: 'SDN-008', name: 'Converse Bank CJSC', aliases: ['Convers Bank'], list: 'OFAC_SDN', jurisdiction: 'AM', entityType: 'corporate', reason: 'Iranian financial system access', dateAdded: '2018-11-05', programs: ['IRAN'] },
  { id: 'SDN-009', name: 'Oboronprom', aliases: ['United Industrial Corporation Oboronprom'], list: 'OFAC_SDN', jurisdiction: 'RU', entityType: 'corporate', reason: 'Russian defence subsidiary', dateAdded: '2022-02-24', programs: ['RUSSIA-EO14024'] },
  { id: 'SDN-010', name: 'Alisher Burhanovich Usmanov', aliases: ['Alisher Usmanov', 'Alisher B. Usmanov'], list: 'OFAC_SDN', jurisdiction: 'RU', entityType: 'individual', reason: 'Russian oligarch', dateAdded: '2022-03-03', programs: ['RUSSIA-EO14024'] },

  // EU Consolidated Sanctions
  { id: 'EU-001', name: 'Bashar Hafez al-Assad', aliases: ['Bashar al-Assad', 'Bashar Assad'], list: 'EU_CONSOLIDATED', jurisdiction: 'SY', entityType: 'individual', reason: 'Syrian regime', dateAdded: '2011-05-23', programs: ['SYRIA'] },
  { id: 'EU-002', name: 'Belarus National Oil Company', aliases: ['Belorusneft', 'BNC'], list: 'EU_CONSOLIDATED', jurisdiction: 'BY', entityType: 'corporate', reason: 'State-owned energy company', dateAdded: '2021-06-21', programs: ['BELARUS'] },
  { id: 'EU-003', name: 'Prigozhin Yevgeniy Viktorovich', aliases: ['Yevgeny Prigozhin', 'Evgeny Prigozhin', 'Putins Chef'], list: 'EU_CONSOLIDATED', jurisdiction: 'RU', entityType: 'individual', reason: 'Wagner Group, election interference', dateAdded: '2020-10-15', programs: ['CYBER', 'RUSSIA'] },
  { id: 'EU-004', name: 'Sberbank of Russia', aliases: ['Sberbank', 'PAO Sberbank'], list: 'EU_CONSOLIDATED', jurisdiction: 'RU', entityType: 'corporate', reason: 'Russian state banking', dateAdded: '2022-03-02', programs: ['RUSSIA'] },
  { id: 'EU-005', name: 'Hadi Al-Amiri', aliases: ['Hadi al Ameri'], list: 'EU_CONSOLIDATED', jurisdiction: 'IQ', entityType: 'individual', reason: 'Militia leader', dateAdded: '2019-07-15', programs: ['IRAQ'] },

  // UN Security Council Consolidated List
  { id: 'UN-001', name: 'Islamic State in Iraq and the Levant', aliases: ['ISIL', 'ISIS', 'Daesh', 'Islamic State'], list: 'UN_SANCTIONS', jurisdiction: 'GLOBAL', entityType: 'corporate', reason: 'Terrorist organization', dateAdded: '2014-05-29', programs: ['1267/1989/2253'] },
  { id: 'UN-002', name: 'Al-Qaida in the Arabian Peninsula', aliases: ['AQAP', 'Ansar al-Sharia'], list: 'UN_SANCTIONS', jurisdiction: 'YE', entityType: 'corporate', reason: 'Terrorist organization', dateAdded: '2010-01-19', programs: ['1267/1989/2253'] },
  { id: 'UN-003', name: 'Ayman Muhammed Rabie al-Zawahiri', aliases: ['Ayman al-Zawahiri', 'Dr Ayman al Zawahiri'], list: 'UN_SANCTIONS', jurisdiction: 'GLOBAL', entityType: 'individual', reason: 'Al-Qaida leader', dateAdded: '1999-10-25', programs: ['1267/1989/2253'] },
  { id: 'UN-004', name: 'Korea Mining Development Trading Corporation', aliases: ['KOMID'], list: 'UN_SANCTIONS', jurisdiction: 'KP', entityType: 'corporate', reason: 'DPRK weapons proliferation', dateAdded: '2009-04-24', programs: ['1718'] },
  { id: 'UN-005', name: 'Ri Pyong Chol', aliases: ['Ri Pyong-chol'], list: 'UN_SANCTIONS', jurisdiction: 'KP', entityType: 'individual', reason: 'DPRK missile programme director', dateAdded: '2017-12-22', programs: ['1718'] },

  // UK HMT Sanctions (most relevant for Jersey)
  { id: 'HMT-001', name: 'Roman Arkadyevich Abramovich', aliases: ['Roman Abramovich'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'individual', reason: 'Russian oligarch, close to Putin', dateAdded: '2022-03-10', programs: ['RUSSIA'] },
  { id: 'HMT-002', name: 'VTB Bank', aliases: ['VTB Group', 'Vneshtorgbank'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'corporate', reason: 'Russian state bank', dateAdded: '2022-02-22', programs: ['RUSSIA'] },
  { id: 'HMT-003', name: 'Petr Olegovich Aven', aliases: ['Peter Aven', 'Pyotr Aven'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'individual', reason: 'Russian oligarch, Alfa Group', dateAdded: '2022-03-15', programs: ['RUSSIA'] },
  { id: 'HMT-004', name: 'Mikhail Fridman', aliases: ['Mikhail Maratovich Fridman'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'individual', reason: 'Russian oligarch, Alfa Group', dateAdded: '2022-03-15', programs: ['RUSSIA'] },
  { id: 'HMT-005', name: 'Promsvyazbank', aliases: ['PSB', 'Promsvyaz Bank'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'corporate', reason: 'Russian military bank', dateAdded: '2022-02-24', programs: ['RUSSIA'] },
  { id: 'HMT-006', name: 'Hezbollah Military Wing', aliases: ['Hizballah', 'Hizbullah', 'Party of God'], list: 'UK_HMT', jurisdiction: 'LB', entityType: 'corporate', reason: 'Proscribed terrorist organisation', dateAdded: '2001-03-29', programs: ['COUNTER-TERRORISM'] },
  { id: 'HMT-007', name: 'Gennady Timchenko', aliases: ['Gennadiy Nikolayevich Timchenko'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'individual', reason: 'Russian oligarch, Putin associate', dateAdded: '2022-03-15', programs: ['RUSSIA'] },
  { id: 'HMT-008', name: 'Igor Ivanovich Sechin', aliases: ['Igor Sechin'], list: 'UK_HMT', jurisdiction: 'RU', entityType: 'individual', reason: 'Rosneft CEO, Putin inner circle', dateAdded: '2022-03-11', programs: ['RUSSIA'] },

  // Jersey-specific sanctions (Sanctions and Asset-Freezing (Jersey) Law 2019)
  { id: 'JE-001', name: 'Phantom Trust Services Ltd', aliases: ['Phantom Trust Jersey'], list: 'JERSEY_LOCAL', jurisdiction: 'JE', entityType: 'corporate', reason: 'JFSC enforcement — unlicensed trust services', dateAdded: '2024-03-15', programs: ['JFSC-ENFORCEMENT'] },
  { id: 'JE-002', name: 'Meridian Capital Advisors', aliases: ['Meridian Capital JE', 'MCA Jersey'], list: 'JERSEY_LOCAL', jurisdiction: 'JE', entityType: 'corporate', reason: 'JFSC enforcement — AML failings', dateAdded: '2024-08-20', programs: ['JFSC-ENFORCEMENT'] },
];

// ─────────────────────────────────────────────────────────────────────
// PEP DATABASE — Politically Exposed Persons (Jersey focus)
// ─────────────────────────────────────────────────────────────────────
export const PEP_DB = [
  // Jersey Government Officials
  { id: 'PEP-JE-001', name: 'Timothy James Le Cocq', aliases: ['Sir Timothy Le Cocq'], jurisdiction: 'JE', position: 'Bailiff of Jersey', category: 'head_of_state', level: 'national', active: true },
  { id: 'PEP-JE-002', name: 'Kristina Moore', aliases: ['K. Moore'], jurisdiction: 'JE', position: 'Chief Minister of Jersey', category: 'head_of_government', level: 'national', active: true },
  { id: 'PEP-JE-003', name: 'Philip Bailhache', aliases: ['Sir Philip Bailhache'], jurisdiction: 'JE', position: 'Former Bailiff & Senator', category: 'senior_judiciary', level: 'national', active: false },
  { id: 'PEP-JE-004', name: 'Mark Sheridan', aliases: [], jurisdiction: 'JE', position: 'Attorney General of Jersey', category: 'senior_legal', level: 'national', active: true },
  { id: 'PEP-JE-005', name: 'Richard Renouf', aliases: ['Deputy Richard Renouf'], jurisdiction: 'JE', position: 'Minister for Health & Social Services', category: 'government_minister', level: 'national', active: true },
  { id: 'PEP-JE-006', name: 'Ian Gorst', aliases: ['Senator Ian Gorst'], jurisdiction: 'JE', position: 'Minister for External Relations', category: 'government_minister', level: 'national', active: true },
  { id: 'PEP-JE-007', name: 'Susie Pinel', aliases: ['Deputy Susie Pinel'], jurisdiction: 'JE', position: 'Former Minister for Treasury and Resources', category: 'government_minister', level: 'national', active: false },
  
  // Jersey Parish Connétables (heads of the 12 parishes)
  { id: 'PEP-JE-010', name: 'Simon Crowcroft', aliases: [], jurisdiction: 'JE', position: 'Connétable of St Helier', category: 'local_government', level: 'local', active: true },
  { id: 'PEP-JE-011', name: 'John Le Bailly', aliases: [], jurisdiction: 'JE', position: 'Connétable of St Mary', category: 'local_government', level: 'local', active: true },
  { id: 'PEP-JE-012', name: 'Richard Buchanan', aliases: [], jurisdiction: 'JE', position: 'Connétable of St Ouen', category: 'local_government', level: 'local', active: true },
  
  // JFSC Senior Officials
  { id: 'PEP-JE-020', name: 'Martin Moloney', aliases: [], jurisdiction: 'JE', position: 'Director General, JFSC', category: 'financial_regulator', level: 'national', active: true },
  { id: 'PEP-JE-021', name: 'Jill Britton', aliases: [], jurisdiction: 'JE', position: 'Former Director General, JFSC', category: 'financial_regulator', level: 'national', active: false },

  // UK PEPs with Jersey connections
  { id: 'PEP-UK-001', name: 'Andrew Bailey', aliases: [], jurisdiction: 'GB', position: 'Governor of the Bank of England', category: 'central_bank', level: 'national', active: true },
  { id: 'PEP-UK-002', name: 'Keir Starmer', aliases: ['Sir Keir Starmer'], jurisdiction: 'GB', position: 'Prime Minister of the United Kingdom', category: 'head_of_government', level: 'national', active: true },
  { id: 'PEP-UK-003', name: 'Rachel Reeves', aliases: [], jurisdiction: 'GB', position: 'Chancellor of the Exchequer', category: 'government_minister', level: 'national', active: true },
  
  // International PEPs commonly encountered in offshore finance
  { id: 'PEP-INT-001', name: 'Mohammed bin Salman Al Saud', aliases: ['MBS', 'Crown Prince Mohammed'], jurisdiction: 'SA', position: 'Crown Prince of Saudi Arabia', category: 'head_of_state', level: 'national', active: true },
  { id: 'PEP-INT-002', name: 'Nawaz Sharif', aliases: ['Muhammad Nawaz Sharif'], jurisdiction: 'PK', position: 'Prime Minister of Pakistan', category: 'head_of_government', level: 'national', active: true },
  { id: 'PEP-INT-003', name: 'Nana Akufo-Addo', aliases: ['Nana Addo Dankwa Akufo-Addo'], jurisdiction: 'GH', position: 'President of Ghana', category: 'head_of_state', level: 'national', active: true },
  { id: 'PEP-INT-004', name: 'Emmerson Mnangagwa', aliases: ['Emmerson Dambudzo Mnangagwa'], jurisdiction: 'ZW', position: 'President of Zimbabwe', category: 'head_of_state', level: 'national', active: true },
  { id: 'PEP-INT-005', name: 'Yoweri Museveni', aliases: ['Yoweri Kaguta Museveni'], jurisdiction: 'UG', position: 'President of Uganda', category: 'head_of_state', level: 'national', active: true },

  // Family members / close associates (RCA - Relatives and Close Associates)
  { id: 'RCA-001', name: 'Igor Shuvalov', aliases: ['Igor Ivanovich Shuvalov'], jurisdiction: 'RU', position: 'Former First Deputy PM, VEB Chairman', category: 'close_associate', level: 'national', active: true },
  { id: 'RCA-002', name: 'Gulnara Karimova', aliases: ['Googoosha'], jurisdiction: 'UZ', position: 'Daughter of former President Karimov', category: 'family_member', level: 'national', active: false },
];

// ─────────────────────────────────────────────────────────────────────
// ADVERSE MEDIA DATABASE — Mock negative news / intelligence
// ─────────────────────────────────────────────────────────────────────
export const ADVERSE_MEDIA_DB = [
  // Jersey-specific cases
  { id: 'AM-JE-001', name: 'Meridian Capital Advisors', aliases: ['Meridian Capital JE'], category: 'regulatory_action', source: 'JFSC Public Statement', date: '2024-08-20', jurisdiction: 'JE', summary: 'JFSC issued public statement on AML compliance failings, imposed £250,000 fine for inadequate CDD procedures.' },
  { id: 'AM-JE-002', name: 'Robert Norman', aliases: ['R. Norman', 'Bob Norman'], category: 'fraud', source: 'Jersey Evening Post', date: '2024-05-12', jurisdiction: 'JE', summary: 'Jersey businessman charged with £3.2 million investment fraud targeting elderly investors through unlicensed fund.' },
  { id: 'AM-JE-003', name: 'Oceanic Trust Company', aliases: ['Oceanic Trust'], category: 'money_laundering', source: 'BBC News', date: '2023-11-03', jurisdiction: 'JE', summary: 'Jersey trust company under investigation for alleged facilitation of money laundering through shell company structures.' },
  { id: 'AM-JE-004', name: 'Gerald Mitchell', aliases: ['G. Mitchell', 'Gerry Mitchell'], category: 'tax_evasion', source: 'Financial Times', date: '2024-01-15', jurisdiction: 'JE', summary: 'Former Jersey fund administrator sentenced to 4 years for facilitating tax evasion through false documentation.' },
  { id: 'AM-JE-005', name: 'Channel Islands Property Fund', aliases: ['CIPF', 'CI Property'], category: 'fraud', source: 'Jersey Evening Post', date: '2024-03-20', jurisdiction: 'JE', summary: 'Investors file class action over £15 million property fund alleged to have misrepresented asset valuations.' },

  // International with offshore/Jersey relevance
  { id: 'AM-INT-001', name: 'Leonid Mikhailovich Nevzlin', aliases: ['Leonid Nevzlin'], category: 'organized_crime', source: 'Reuters', date: '2023-09-15', jurisdiction: 'RU', summary: 'Russian businessman linked to alleged offshore laundering through Jersey and Guernsey trusts.' },
  { id: 'AM-INT-002', name: 'Platinum Investment Holdings', aliases: ['Platinum Holdings', 'PIH'], category: 'sanctions_evasion', source: 'Wall Street Journal', date: '2024-02-28', jurisdiction: 'CY', summary: 'Cyprus-based firm allegedly used Channel Islands structures to evade Russian sanctions.' },
  { id: 'AM-INT-003', name: 'Mohammed Al-Rashidi', aliases: ['M. Al-Rashidi', 'Mohamed Rashidi'], category: 'corruption', source: 'The Guardian', date: '2024-04-10', jurisdiction: 'KW', summary: 'Kuwaiti government official under investigation for £50 million in unexplained wealth held in Crown Dependencies.' },
  { id: 'AM-INT-004', name: 'Victoria Greenfield', aliases: ['V. Greenfield'], category: 'money_laundering', source: 'Times', date: '2023-07-22', jurisdiction: 'GB', summary: 'UK national arrested for operating a money laundering network through Jersey nominee companies.' },
  { id: 'AM-INT-005', name: 'Pacific Rim Trading Corp', aliases: ['Pacific Rim', 'PRT Corp'], category: 'sanctions_evasion', source: 'FCA Enforcement Notice', date: '2024-06-01', jurisdiction: 'HK', summary: 'Hong Kong trading company identified in UK financial sanctions evasion case involving Jersey accounts.' },
  { id: 'AM-INT-006', name: 'Alexander Petrov', aliases: ['Alex Petrov', 'A. Petrov', 'Aleksandr Petrov'], category: 'fraud', source: 'Interpol Red Notice', date: '2023-12-10', jurisdiction: 'RU', summary: 'Wanted for multijurisdictional investment fraud totalling $180 million; assets frozen in Jersey and Isle of Man.' },
  { id: 'AM-INT-007', name: 'Global Mining Solutions Ltd', aliases: ['GMS', 'Global Mining'], category: 'corruption', source: 'Serious Fraud Office', date: '2024-01-30', jurisdiction: 'GB', summary: 'Under SFO investigation for alleged bribery of African government officials; Jersey trust used for payments.' },
  { id: 'AM-INT-008', name: 'Chen Wei', aliases: ['Chen Wei-Ming', 'David Chen'], category: 'money_laundering', source: 'South China Morning Post', date: '2024-03-05', jurisdiction: 'CN', summary: 'Chinese national linked to underground banking operation moving $500 million through offshore jurisdictions.' },
];

// ─────────────────────────────────────────────────────────────────────
// HIGH-RISK JURISDICTIONS (FATF / JFSC guidance)
// ─────────────────────────────────────────────────────────────────────
export const HIGH_RISK_JURISDICTIONS = {
  blacklist: ['AF', 'IR', 'KP', 'SY', 'YE', 'MM'], // FATF Black List — call for action
  greylist: ['BY', 'BG', 'BF', 'CM', 'CD', 'HR', 'HT', 'KE', 'ML', 'MZ', 'NG', 'PH', 'SN', 'SS', 'TZ', 'TR', 'UG', 'VE', 'VN'], // FATF Grey List — increased monitoring
  sanctioned: ['RU', 'CU', 'BY', 'IR', 'KP', 'SY', 'VE', 'MM', 'LY', 'SO', 'SD', 'SS'], // Comprehensive sanctions
};

// ─────────────────────────────────────────────────────────────────────
// HIGH-RISK INDUSTRIES (JFSC AML/CFT Handbook guidance)
// ─────────────────────────────────────────────────────────────────────
export const HIGH_RISK_INDUSTRIES = [
  'gambling', 'crypto', 'weapons', 'cannabis', 'adult_entertainment',
  'money_service_business', 'precious_metals', 'real_estate_agency',
  'cash_intensive_retail', 'art_dealing', 'shell_company_formation',
  'virtual_assets', 'correspondent_banking',
];

// ─────────────────────────────────────────────────────────────────────
// JERSEY-SPECIFIC DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────────────
export const JERSEY_DOC_TYPES = {
  passport: { issuer: 'HM Passport Office / Jersey', validityYears: 10, fields: ['fullName', 'dateOfBirth', 'nationality', 'passportNumber', 'placeOfBirth', 'issueDate', 'expiryDate', 'mrz'] },
  national_id: { issuer: 'Jersey ID Card Office', validityYears: 10, fields: ['fullName', 'dateOfBirth', 'address', 'idNumber', 'parish', 'issueDate', 'expiryDate'] },
  driving_license: { issuer: 'Driver and Vehicle Standards (Jersey)', validityYears: 10, fields: ['fullName', 'dateOfBirth', 'address', 'licenseNumber', 'categories', 'issueDate', 'expiryDate', 'parish'] },
  utility_bill: { issuer: 'JE (Jersey Electricity) / Jersey Water / JT (Jersey Telecom)', validityMonths: 3, fields: ['fullName', 'address', 'accountNumber', 'billingDate', 'parish'] },
  bank_statement: { issuer: 'Local Banks (HSBC Jersey, RBS International, Lloyds)', validityMonths: 3, fields: ['fullName', 'address', 'accountNumber', 'statementDate', 'bankName'] },
  tax_return: { issuer: 'Revenue Jersey', validityYears: 1, fields: ['fullName', 'taxRefNumber', 'assessmentYear', 'income', 'taxPaid'] },
  incorporation_cert: { issuer: 'Jersey Companies Registry (JFSC)', validityYears: null, fields: ['companyName', 'registrationNumber', 'dateIncorporated', 'registeredAddress', 'companyType'] },
  shareholder_register: { issuer: 'Company', validityYears: null, fields: ['companyName', 'shareholders', 'shareholdings', 'dateOfRegister'] },
  trust_deed: { issuer: 'Legal Firm', validityYears: null, fields: ['trustName', 'settlor', 'trustees', 'beneficiaries', 'dateEstablished', 'purposeOfTrust', 'governingLaw'] },
  financial_statement: { issuer: 'Auditor', validityYears: 1, fields: ['entityName', 'periodEnd', 'totalAssets', 'totalLiabilities', 'revenue', 'netIncome', 'auditor'] },
};

// ─────────────────────────────────────────────────────────────────────
// JERSEY PARISHES (for address verification)
// ─────────────────────────────────────────────────────────────────────
export const JERSEY_PARISHES = [
  'St Helier', 'St Saviour', 'St Brelade', 'Grouville', 'St Peter',
  'St Clement', 'St Lawrence', 'Trinity', 'St John', 'St Mary',
  'St Ouen', 'St Martin',
];

// ─────────────────────────────────────────────────────────────────────
// JFSC CDD REPORT TEMPLATE SECTIONS
// ─────────────────────────────────────────────────────────────────────
export const CDD_REPORT_SECTIONS = [
  { key: 'client_identification', title: '1. Client Identification & Verification', jfscRef: 'AML/CFT Handbook 4.3' },
  { key: 'business_relationship', title: '2. Nature & Purpose of Business Relationship', jfscRef: 'AML/CFT Handbook 4.4' },
  { key: 'risk_assessment', title: '3. Risk Assessment & Customer Risk Rating', jfscRef: 'AML/CFT Handbook 3.2' },
  { key: 'screening_results', title: '4. Screening Results (Sanctions, PEP, Adverse Media)', jfscRef: 'AML/CFT Handbook 5.1' },
  { key: 'document_verification', title: '5. Document Verification Summary', jfscRef: 'AML/CFT Handbook 4.3.3' },
  { key: 'source_of_wealth', title: '6. Source of Wealth & Funds Assessment', jfscRef: 'AML/CFT Handbook 4.5' },
  { key: 'ongoing_monitoring', title: '7. Ongoing Monitoring Requirements', jfscRef: 'AML/CFT Handbook 6.1' },
  { key: 'approval', title: '8. Approval & Escalation Decision', jfscRef: 'AML/CFT Handbook 4.8' },
];
