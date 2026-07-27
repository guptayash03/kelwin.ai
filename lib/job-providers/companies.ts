/**
 * @deprecated No longer used at runtime. Jobs are now synced from Fantastic.jobs API.
 */
import type { CompanyConfig } from "./types";

export const COMPANY_REGISTRY: CompanyConfig[] = [
  {
    name: "Google",
    domain: "google.com",
    platforms: { careerPortal: "careers.google.com" },
  },
  {
    name: "Microsoft",
    domain: "microsoft.com",
    platforms: { careerPortal: "careers.microsoft.com" },
  },
  {
    name: "Amazon",
    domain: "amazon.com",
    platforms: { careerPortal: "amazon.jobs" },
  },
  {
    name: "NVIDIA",
    domain: "nvidia.com",
    platforms: { careerPortal: "nvidia.wd5.myworkdayjobs.com", workday: "nvidia.wd5.myworkdayjobs.com" },
  },
  {
    name: "Adobe",
    domain: "adobe.com",
    platforms: { careerPortal: "careers.adobe.com", workday: "adobe.wd5.myworkdayjobs.com" },
  },
  {
    name: "Atlassian",
    domain: "atlassian.com",
    platforms: { careerPortal: "atlassian.com/company/careers" },
  },
  {
    name: "Databricks",
    domain: "databricks.com",
    platforms: { greenhouse: "databricks" },
  },
  {
    name: "Snowflake",
    domain: "snowflake.com",
    platforms: { greenhouse: "snowflakecomputing" },
  },
  {
    name: "Stripe",
    domain: "stripe.com",
    platforms: { greenhouse: "stripe" },
  },
  {
    name: "Cloudflare",
    domain: "cloudflare.com",
    platforms: { greenhouse: "cloudflare" },
  },
  {
    name: "Palantir",
    domain: "palantir.com",
    platforms: { greenhouse: "palantir" },
  },
  {
    name: "Oracle",
    domain: "oracle.com",
    platforms: { careerPortal: "careers.oracle.com" },
  },
  {
    name: "Cisco",
    domain: "cisco.com",
    platforms: { careerPortal: "jobs.cisco.com" },
  },
  {
    name: "Rubrik",
    domain: "rubrik.com",
    platforms: { greenhouse: "rubrik" },
  },
  {
    name: "Confluent",
    domain: "confluent.io",
    platforms: { greenhouse: "confluent" },
  },
  {
    name: "MongoDB",
    domain: "mongodb.com",
    platforms: { greenhouse: "mongodb" },
  },
  {
    name: "Razorpay",
    domain: "razorpay.com",
    platforms: { greenhouse: "razorpay" },
  },
  {
    name: "CRED",
    domain: "cred.club",
    platforms: { lever: "cred" },
  },
  {
    name: "PhonePe",
    domain: "phonepe.com",
    platforms: { lever: "phonepe" },
  },
  {
    name: "Groww",
    domain: "groww.in",
    platforms: { lever: "groww" },
  },
  {
    name: "Meesho",
    domain: "meesho.com",
    platforms: { lever: "meesho" },
  },
  {
    name: "Flipkart",
    domain: "flipkart.com",
    platforms: { careerPortal: "flipkartcareers.com" },
  },
  {
    name: "Uber",
    domain: "uber.com",
    platforms: { greenhouse: "uber" },
  },
  {
    name: "Airbnb",
    domain: "airbnb.com",
    platforms: { greenhouse: "airbnb" },
  },
  {
    name: "Salesforce",
    domain: "salesforce.com",
    platforms: { careerPortal: "careers.salesforce.com" },
  },
  {
    name: "ServiceNow",
    domain: "servicenow.com",
    platforms: { careerPortal: "careers.servicenow.com" },
  },
  {
    name: "Qualcomm",
    domain: "qualcomm.com",
    platforms: { careerPortal: "careers.qualcomm.com", workday: "qualcomm.wd5.myworkdayjobs.com" },
  },
  {
    name: "Goldman Sachs",
    domain: "goldmansachs.com",
    platforms: { careerPortal: "goldmansachs.com/careers" },
  },
  {
    name: "JP Morgan",
    domain: "jpmorgan.com",
    platforms: { careerPortal: "careers.jpmorgan.com" },
  },
  {
    name: "American Express",
    domain: "americanexpress.com",
    platforms: { careerPortal: "aexp.eightfold.ai" },
  },
  {
    name: "Autodesk",
    domain: "autodesk.com",
    platforms: { greenhouse: "autodesk" },
  },
  {
    name: "Morgan Stanley",
    domain: "morganstanley.com",
    platforms: { careerPortal: "morganstanley.com/careers" },
  },
  {
    name: "Barclays",
    domain: "barclays.com",
    platforms: { careerPortal: "search.jobs.barclays" },
  },
  {
    name: "Deutsche Bank",
    domain: "db.com",
    platforms: { careerPortal: "careers.db.com" },
  },
  {
    name: "Visa",
    domain: "visa.com",
    platforms: { careerPortal: "careers.visa.com" },
  },
  {
    name: "Mastercard",
    domain: "mastercard.com",
    platforms: { careerPortal: "careers.mastercard.com" },
  },
  {
    name: "Intel",
    domain: "intel.com",
    platforms: { careerPortal: "jobs.intel.com", workday: "intel.wd1.myworkdayjobs.com" },
  },
  {
    name: "Samsung",
    domain: "samsung.com",
    platforms: { careerPortal: "careers.samsung.com" },
  },
  {
    name: "Walmart",
    domain: "walmart.com",
    platforms: { careerPortal: "careers.walmart.com" },
  },
  {
    name: "Intuit",
    domain: "intuit.com",
    platforms: { careerPortal: "jobs.intuit.com" },
  },
  {
    name: "PayPal",
    domain: "paypal.com",
    platforms: { careerPortal: "careers.pypl.com" },
  },
  {
    name: "SAP",
    domain: "sap.com",
    platforms: { careerPortal: "jobs.sap.com" },
  },
  {
    name: "VMware",
    domain: "vmware.com",
    platforms: { careerPortal: "careers.vmware.com" },
  },
  {
    name: "Wells Fargo",
    domain: "wellsfargo.com",
    platforms: { careerPortal: "www.wellsfargojobs.com" },
  },
  {
    name: "Tower Research Capital",
    domain: "tower-research.com",
    platforms: { greenhouse: "towerresearchcapital" },
  },
  {
    name: "DE Shaw",
    domain: "deshaw.com",
    platforms: { careerPortal: "deshaw.com/careers" },
  },
  {
    name: "Sprinklr",
    domain: "sprinklr.com",
    platforms: { greenhouse: "sprinklr" },
  },
  {
    name: "Zomato",
    domain: "zomato.com",
    platforms: { careerPortal: "zomato.com/careers" },
  },
  {
    name: "Swiggy",
    domain: "swiggy.com",
    platforms: { careerPortal: "careers.swiggy.com" },
  },
];
