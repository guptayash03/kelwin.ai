export interface PortalCredential {
  portal: string;
  email: string;
  encryptedPassword: string;
  iv: string;
  authTag: string;
  connected: boolean;
  updatedAt: unknown;
}

export interface PortalCredentialPublic {
  portal: string;
  email: string;
  connected: boolean;
  updatedAt: unknown;
}

export const SUPPORTED_PORTALS = [
  { id: "greenhouse", name: "Greenhouse", domain: "greenhouse.io" },
  { id: "lever", name: "Lever", domain: "lever.co" },
  { id: "workday", name: "Workday", domain: "workday.com" },
  { id: "ashby", name: "Ashby", domain: "ashbyhq.com" },
  { id: "icims", name: "iCIMS", domain: "icims.com" },
  { id: "smartrecruiters", name: "SmartRecruiters", domain: "smartrecruiters.com" },
  { id: "oracle", name: "Oracle", domain: "oracle.com" },
  { id: "taleo", name: "Taleo", domain: "oracle.com" },
  { id: "successfactors", name: "SAP SuccessFactors", domain: "sap.com" },
  { id: "eightfold", name: "Eightfold", domain: "eightfold.ai" },
] as const;

export type PortalId = (typeof SUPPORTED_PORTALS)[number]["id"];

export const PORTALS_REQUIRING_LOGIN: PortalId[] = [
  "workday",
  "oracle",
  "taleo",
  "successfactors",
  "icims",
  "eightfold",
  "smartrecruiters",
];

export const PORTALS_NO_LOGIN_NEEDED: PortalId[] = [
  "greenhouse",
  "lever",
  "ashby",
];
