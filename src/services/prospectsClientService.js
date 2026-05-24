import * as db from '../lib/db';
import config from '../config/config';
import { parseJsonArray } from '../utils/parseJsonField';
import { sheetInt, sheetFloat } from '../utils/sheetNumbers';

// Generate unique client code (PC + 4 digits starting from PC0001 for Prospects Clients)
function pickFirst(...values) {
  return values.find((value) => value != null && String(value).trim() !== '');
}

function pickField(source, ...keys) {
  if (!source || typeof source !== 'object') return undefined;
  return pickFirst(...keys.map((key) => source[key]));
}

function getClientCode(row) {
  return pickField(row, 'ClientCode', 'clientCode', 'clientcode', 'client_code');
}

function getClientName(row) {
  return pickField(row, 'ClientName', 'clientName', 'clientname', 'name', 'CompanyName', 'companyName', 'company');
}

async function generateClientCode() {
  const data = await db.getTableRows(db.getTableName(config.sheets.prospectsClients));
  const max = data.reduce((acc, row) => {
    const code = getClientCode(row);
    const match = code && code.match(/^PC(\d{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > acc ? num : acc;
    }
    return acc;
  }, 0); // Start from 0 so next will be 1
  const next = (max + 1).toString().padStart(4, '0');
  return `PC${next}`;
}

export async function checkClientCodeExists(clientCode) {
  const data = await db.getTableRows(db.getTableName(config.sheets.prospectsClients));
  return data.some(row => getClientCode(row) === clientCode);
}

export async function getAllClients(forceRefresh = false) {
  const data = await db.getTableRows(db.getTableName(config.sheets.prospectsClients));
  // data is array of objects with keys from header
  return data.map(row => ({
    id: row.id,
    ...row,
    // Basic Information
    clientName: getClientName(row) || '',
    clientCode: getClientCode(row) || '',
    businessType: pickField(row, 'BusinessType', 'businessType', 'businesstype') || '',
    
    // Contact Information
    address: pickField(row, 'Address', 'address') || '',
    city: pickField(row, 'City', 'city') || '',
    state: pickField(row, 'State', 'state') || '',
    stateCode: pickField(row, 'StateCode', 'stateCode', 'statecode', 'state_code') || '',
    pincode: pickField(row, 'Pincode', 'pincode') || '',
    country: pickField(row, 'Country', 'country') || 'India',
    
    // Business Details
    gstin: pickField(row, 'GSTIN', 'gstin') || '',
    panNumber: pickField(row, 'PANNumber', 'panNumber', 'pannumber', 'pan_number') || '',
    accountCode: pickField(row, 'AccountCode', 'accountCode', 'accountcode', 'account_code') || '',
    website: pickField(row, 'Website', 'website') || '',
    
    // Contact Management
    contacts: parseJsonArray(pickField(row, 'Contacts', 'contacts')),
    
    // Business Terms
    paymentTerms: pickField(row, 'PaymentTerms', 'paymentTerms', 'paymentterms', 'payment_terms') || '',
    creditLimit: pickField(row, 'CreditLimit', 'creditLimit', 'creditlimit', 'credit_limit') || '',
    creditPeriod: pickField(row, 'CreditPeriod', 'creditPeriod', 'creditperiod', 'credit_period') || '',
    deliveryTerms: pickField(row, 'DeliveryTerms', 'deliveryTerms', 'deliveryterms', 'delivery_terms') || '',
    
    // Product Information
    products: parseJsonArray(pickField(row, 'Products', 'products')),
    
    // Additional Information
    notes: pickField(row, 'Notes', 'notes') || '',
    status: pickField(row, 'Status', 'status') || 'Active',
    rating: parseInt(pickField(row, 'Rating', 'rating'), 10) || 0,
    lastContactDate: pickField(row, 'LastContactDate', 'lastContactDate', 'lastcontactdate', 'last_contact_date') || '',
    totalOrders: parseInt(pickField(row, 'TotalOrders', 'totalOrders', 'totalorders', 'total_orders'), 10) || 0,
    totalValue: parseFloat(pickField(row, 'TotalValue', 'totalValue', 'totalvalue', 'total_value')) || 0
  }));
}

export async function addClient(client) {
  // Check if client code already exists
  if (client.clientCode && await checkClientCodeExists(client.clientCode)) {
    throw new Error('Client code already exists. Please use a different client code.');
  }
  
  const row = {
    // Basic Information
    ClientName: client.clientName || '',
    ClientCode: client.clientCode || '',
    BusinessType: client.businessType || '',
    
    // Contact Information
    Address: client.address || '',
    City: client.city || '',
    State: client.state || '',
    StateCode: client.stateCode || '',
    Pincode: client.pincode || '',
    Country: client.country || 'India',
    
    // Business Details
    GSTIN: client.gstin || '',
    PANNumber: client.panNumber || '',
    AccountCode: client.accountCode || '',
    Website: client.website || '',
    
    // Contact Management
    Contacts: JSON.stringify(client.contacts || []),
    
    // Business Terms
    PaymentTerms: client.paymentTerms || '',
    CreditLimit: sheetFloat(client.creditLimit, 0),
    CreditPeriod: sheetInt(client.creditPeriod, 0),
    DeliveryTerms: client.deliveryTerms || '',
    
    // Product Information
    Products: JSON.stringify(client.products || []),
    
    // Additional Information
    Notes: client.notes || '',
    Status: client.status || 'Active',
    Rating: sheetInt(client.rating, 0),
    LastContactDate: client.lastContactDate || '',
    TotalOrders: sheetInt(client.totalOrders, 0),
    TotalValue: sheetFloat(client.totalValue, 0)
  };
  await db.insertTableRow(db.getTableName(config.sheets.prospectsClients), row);
}

export async function updateClient(client, originalClientCode = null) {
  // Check if the new client code already exists (and it's not the same as the original)
  if (client.clientCode && originalClientCode && client.clientCode !== originalClientCode) {
    if (await checkClientCodeExists(client.clientCode)) {
      throw new Error('Client code already exists. Please use a different client code.');
    }
  }
  
  // Find the row index by original client code (if provided) or current client code
  const data = await db.getTableRows(db.getTableName(config.sheets.prospectsClients));
  const searchCode = originalClientCode || client.clientCode;
  const idx = data.findIndex(row => getClientCode(row) === searchCode);
  if (idx === -1) throw new Error('Client not found');
  const row = {
    // Basic Information
    ClientName: client.clientName || '',
    ClientCode: client.clientCode || '',
    BusinessType: client.businessType || '',
    
    // Contact Information
    Address: client.address || '',
    City: client.city || '',
    State: client.state || '',
    StateCode: client.stateCode || '',
    Pincode: client.pincode || '',
    Country: client.country || 'India',
    
    // Business Details
    GSTIN: client.gstin || '',
    PANNumber: client.panNumber || '',
    AccountCode: client.accountCode || '',
    Website: client.website || '',
    
    // Contact Management
    Contacts: JSON.stringify(client.contacts || []),
    
    // Business Terms
    PaymentTerms: client.paymentTerms || '',
    CreditLimit: sheetFloat(client.creditLimit, 0),
    CreditPeriod: sheetInt(client.creditPeriod, 0),
    DeliveryTerms: client.deliveryTerms || '',
    
    // Product Information
    Products: JSON.stringify(client.products || []),
    
    // Additional Information
    Notes: client.notes || '',
    Status: client.status || 'Active',
    Rating: sheetInt(client.rating, 0),
    LastContactDate: client.lastContactDate || '',
    TotalOrders: sheetInt(client.totalOrders, 0),
    TotalValue: sheetFloat(client.totalValue, 0)
  };
  // Row index in sheet = idx + 2 (header + 1-based)
  await db.updateRowByIndex(db.getTableName(config.sheets.prospectsClients), idx + 2, row);
}

export async function deleteClient(clientCode) {
  // Find the row index by clientCode
  const data = await db.getTableRows(db.getTableName(config.sheets.prospectsClients));
  const idx = data.findIndex(row => getClientCode(row) === clientCode);
  if (idx === -1) throw new Error('Client not found');
  
  // Delete the row from the sheet
  await db.deleteRowByIndex(db.getTableName(config.sheets.prospectsClients), idx + 2);
}

