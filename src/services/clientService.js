import * as db from '../lib/db';
import { parseJsonArray } from '../utils/parseJsonField';
import { sheetInt, sheetFloat } from '../utils/sheetNumbers';

const CLIENTS_TABLE = 'clients';

function pickFirst(...values) {
  return values.find((value) => value != null && String(value).trim() !== '');
}

function addDerivedClient(map, source, defaults = {}) {
  if (!source || typeof source !== 'object') return;
  const code = pickFirst(
    source.ClientCode,
    source.clientCode,
    source.client_code,
    source.CustomerCode,
    source.customerCode,
    source.customer_id,
    defaults.clientCode
  );
  const name = pickFirst(
    source.ClientName,
    source.clientName,
    source.CompanyName,
    source.companyName,
    source.CustomerName,
    source.customerName,
    source.name,
    source.full_name,
    defaults.clientName,
    code
  );
  const key = String(code || name || '').trim();
  if (!key) return;

  const mapKey = key.toUpperCase();
  const products = Array.isArray(defaults.products) ? defaults.products : [];
  if (map.has(mapKey)) {
    const existing = map.get(mapKey);
    existing.Products = [...parseJsonArray(existing.Products), ...products];
    return;
  }

  map.set(mapKey, {
    ClientName: String(name || key),
    ClientCode: String(code || key),
    BusinessType: defaults.businessType || '',
    Address: source.Address || source.address || '',
    City: source.City || source.city || '',
    State: source.State || source.state || '',
    Country: source.Country || source.country || 'India',
    Contacts: source.Contacts || source.contacts || [],
    Products: products.length > 0 ? products : (source.Products || source.products || []),
    Notes: defaults.notes || `Derived from ${defaults.source || 'related data'}`,
    Status: source.Status || source.status || 'Active',
  });
}

async function getDerivedClientsFromRelatedTables() {
  const derived = new Map();
  const [products, dispatches, salesFlows, prospects, customers] = await Promise.all([
    db.getTableRows('products').catch(() => []),
    db.getTableRows('dispatches').catch(() => []),
    db.getTableRows('sales_flows').catch(() => []),
    db.getTableRows('prospects_clients').catch(() => []),
    db.getTableRows('customers').catch(() => []),
  ]);

  prospects.forEach((row) => addDerivedClient(derived, row, { source: 'prospects' }));
  customers.forEach((row) => addDerivedClient(derived, row, { source: 'customers' }));
  products.forEach((row) =>
    addDerivedClient(derived, row, {
      source: 'products',
      products: [
        {
          productCode: row.ProductCode || row.productCode || row.code || row.sku || row.id,
          productName: row.ProductName || row.productName || row.name || row.description || row.code || row.id,
          category: row.category || row.order_type || row.productCategory?.name || '',
          description: row.Description || row.description || '',
          quantity: row.quantity,
          price: row.price,
        },
      ],
    })
  );
  dispatches.forEach((row) =>
    addDerivedClient(derived, row, {
      source: 'dispatches',
      products: [
        {
          productCode: row.ProductCode || row.productCode || row.code || '',
          productName: row.ProductName || row.productName || row.name || '',
          category: row.category || '',
          description: row.description || '',
        },
      ].filter((product) => product.productCode || product.productName),
    })
  );
  salesFlows.forEach((row) =>
    addDerivedClient(derived, row, {
      source: 'sales flow',
      clientCode: row.ClientCode || row.LogId || row.id,
      clientName: row.CompanyName || row.FullName,
    })
  );

  return Array.from(derived.values());
}

// Generate unique client code sequentially (C + 5 digits, e.g., C00001)
export async function generateSequentialClientCode() {
  const data = await db.getTableRows(CLIENTS_TABLE).catch(() => []);
  const max = data.reduce((acc, row) => {
    const code = row.ClientCode || '';
    const match = code.match(/^C(\d{5})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > acc ? num : acc;
    }
    return acc;
  }, 0);
  const next = (max + 1).toString().padStart(5, '0');
  return `C${next}`;
}

function parseClientRow(row, header) {
  const obj = {};
  header.forEach((h, i) => {
    obj[h] = row[i] || '';
  });
  obj.contacts = obj.Contacts ? JSON.parse(obj.Contacts) : [];
  obj.products = obj.Products ? JSON.parse(obj.Products) : [];
  // Normalize keys for frontend
  obj.clientName = obj.ClientName;
  obj.clientCode = obj.ClientCode;
  obj.address = obj.Address;
  return obj;
}

export async function checkClientCodeExists(clientCode) {
  const data = await db.getTableRows(CLIENTS_TABLE);
  return data.some(row => row.ClientCode === clientCode);
}

export async function getAllClients(forceRefresh = false) {
  try {
    console.log("[getAllClients] START", { forceRefresh, table: CLIENTS_TABLE });

    const data = await db.getTableRows(CLIENTS_TABLE);

    console.log("[getAllClients] RAW DATA:", data);

    let rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
      rows = await getDerivedClientsFromRelatedTables();
      console.log("[getAllClients] DERIVED DATA:", { count: rows.length });
    }
    const mapped = rows.map((row) => ({
      ...row,
      // Basic Information
      clientName: row.ClientName || '',
      clientCode: row.ClientCode || '',
      businessType: row.BusinessType || '',

      // Contact Information
      address: row.Address || '',
      city: row.City || '',
      state: row.State || '',
      stateCode: row.StateCode || '',
      pincode: row.Pincode || '',
      country: row.Country || 'India',

      // Business Details
      gstin: row.GSTIN || '',
      panNumber: row.PANNumber || '',
      accountCode: row.AccountCode || '',
      website: row.Website || '',

      // Contact Management
      contacts: parseJsonArray(row.Contacts),

      // Business Terms
      paymentTerms: row.PaymentTerms || '',
      creditLimit: row.CreditLimit || '',
      creditPeriod: row.CreditPeriod || '',
      deliveryTerms: row.DeliveryTerms || '',

      // Product Information
      products: parseJsonArray(row.Products),

      // Additional Information
      notes: row.Notes || '',
      status: row.Status || 'Active',
      rating: parseInt(row.Rating, 10) || 0,
      lastContactDate: row.LastContactDate || '',
      totalOrders: parseInt(row.TotalOrders, 10) || 0,
      totalValue: parseFloat(row.TotalValue) || 0,
    }));

    console.log("[getAllClients] SUCCESS", { count: mapped.length });
    return mapped;
  } catch (error) {
    console.error("[getAllClients] ERROR:", error);
    throw error;
  }
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
  await db.insertTableRow(CLIENTS_TABLE, row);
}

export async function updateClient(client, originalClientCode = null) {
  // Check if the new client code already exists (and it's not the same as the original)
  if (client.clientCode && originalClientCode && client.clientCode !== originalClientCode) {
    if (await checkClientCodeExists(client.clientCode)) {
      throw new Error('Client code already exists. Please use a different client code.');
    }
  }
  
  const data = await db.getTableRows(CLIENTS_TABLE);
  const searchCode = originalClientCode || client.clientCode;
  const existing = data.find(row => row.ClientCode === searchCode);
  if (!existing || !existing.id) throw new Error('Client not found');
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
  await db.updateTableRowById(CLIENTS_TABLE, existing.id, row);
}

export async function deleteClient(clientCode) {
  const data = await db.getTableRows(CLIENTS_TABLE);
  const row = data.find(r => r.ClientCode === clientCode);
  if (!row || !row.id) throw new Error('Client not found');
  await db.deleteTableRowById(CLIENTS_TABLE, row.id);
}

// Get all unique products from all clients
export async function getAllProductsFromClients(forceRefresh = false) {
  try {
    const clients = await getAllClients(forceRefresh);
    const productMap = new Map(); // Use Map to ensure uniqueness by productCode
    
    for (const client of clients) {

      if (client.products && Array.isArray(client.products)) {
        client.products.forEach((product, index) => {
          if (product.productCode) {
            // If product code already exists, keep the first occurrence
            if (!productMap.has(product.productCode)) {
              productMap.set(product.productCode, {
                productCode: product.productCode,
                productName: product.productName || '',
                category: product.category || '',
                description: product.description || '',
                // Technical specifications
                conductorSize: product.conductorSize || '',
                strandCount: product.strandCount || '',
                numberOfCore: product.numberOfCore || '',
                coreColors: product.coreColors || [],
                // Also include the colour field directly
                colour: product.colour || '',
                coreOD: product.coreOD || '',
                corePVC: product.corePVC || '',
                sheathOD: product.sheathOD || '',
                sheathInnerPVC: product.sheathInnerPVC || '',
                sheathOuterPVC: product.sheathOuterPVC || '',
                printingMaterial: product.printingMaterial || '',
                totalLength: product.totalLength || '',
                colour: product.colour || '',
                // Stock-related fields
                currentStock: product.currentStock || '',
                minLevel: product.minLevel || '',
                maxLevel: product.maxLevel || '',
                reorderPoint: product.reorderPoint || '',
                unit: product.unit || '',
                location: product.location || '',
                lastUpdated: product.lastUpdated || '',
                status: product.status || 'Active',
                clientCode: client.clientCode,
                clientName: client.clientName,
                // Store reference to client for traceability
                sourceClient: {
                  clientCode: client.clientCode,
                  clientName: client.clientName
                }
              });
            } else {
            }
          } else {
          }
        });
      } else {
      }
    }
    
    // Convert Map to array and sort by product code
    const result = Array.from(productMap.values()).sort((a, b) => 
      a.productCode.localeCompare(b.productCode)
    );

    return result;
  } catch (error) {
    console.error('=== GET ALL PRODUCTS FROM CLIENTS ERROR ===');
    console.error('Error getting products from clients:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

// Create a new client from sales flow data
export async function createClientFromSalesFlow(salesFlowData, leadDetails) {
  try {
    // Generate unique client code sequentially
    const clientCode = await generateSequentialClientCode();
    
    // Extract contact information from lead details
    const contacts = [];
    if (leadDetails?.ContactPerson) {
      contacts.push({
        name: leadDetails.ContactPerson,
        email: leadDetails.EmailId || salesFlowData.Email,
        number: leadDetails.MobileNumber || salesFlowData.PhoneNumber,
        department: leadDetails.Department || 'General'
      });
    }
    
    // Extract products interested
    const products = [];
    if (leadDetails?.ProductsInterested) {
      try {
        const productsInterested = typeof leadDetails.ProductsInterested === 'string' 
          ? JSON.parse(leadDetails.ProductsInterested) 
          : leadDetails.ProductsInterested;
        
        if (Array.isArray(productsInterested)) {
          productsInterested.forEach(product => {
            // Handle both object format and string format
            if (typeof product === 'object' && (product.productCode || product.ProductCode)) {
              products.push({
                productCode: product.productCode || product.ProductCode
              });
            } else if (typeof product === 'string') {
              products.push({
                productCode: product
              });
            }
          });
        }
      } catch (err) {
        console.error('Error parsing products interested:', err);
      }
    }
    
    // Create client object
    const client = {
      clientName: leadDetails?.CompanyName || salesFlowData.CompanyName || salesFlowData.FullName,
      clientCode: clientCode,
      address: leadDetails?.CustomerLocation || salesFlowData.CustomerLocation || '',
      contacts: contacts,
      products: products
    };
    
    // Add to CLIENT sheet
    await addClient(client);
    
    return {
      success: true,
      client: client,
      message: 'Client created successfully'
    };
  } catch (error) {
    console.error('Error creating client from sales flow:', error);
    throw error;
  }
}
