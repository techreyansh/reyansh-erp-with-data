# Reyansh Factory AI - Complete System Integration Guide

## 🏭 System Overview

The Reyansh Factory AI is a comprehensive manufacturing management system built with React.js that integrates multiple business processes through a unified Google Sheets-based backend. The system manages the complete lifecycle from lead generation to product delivery.

## 🏗️ Architecture Overview

### Core Technology Stack
- **Frontend**: React 18.2.0 with Material-UI 7.1.0
- **State Management**: React Context API (AuthContext, StepStatusContext)
- **Backend**: Google Sheets API v4 as database
- **Authentication**: Google OAuth 2.0 with Google Identity Services
- **Routing**: React Router DOM 6.22.1
- **Charts**: Recharts 3.1.2, React Google Charts 4.0.1
- **PDF Generation**: jsPDF 2.5.2 with jsPDF AutoTable 3.8.4

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Auth      │  │   Context   │  │   Services  │        │
│  │   Layer     │  │   Layer     │  │   Layer     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Components │  │  Components │  │  Components │        │
│  │  (Business  │  │  (UI/Common)│  │  (Modules)  │        │
│  │   Logic)    │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE API                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Data      │  │   Auth      │  │ Storage     │        │
│  │   Storage   │  │   (OAuth)   │  │ Buckets     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 📋 System Modules

### 1. **Authentication & Authorization**
- **File**: `src/components/auth/Login.js`, `src/context/AuthContext.js`
- **Features**: Supabase Google OAuth, Role-based access control
- **Roles**: CEO, Customer Relations Manager, Store Manager, Production Supervisors, QC Manager, etc.

### 2. **Dashboard System**
- **Main Dashboard**: `src/components/dashboard/Dashboard.js`
- **Employee Dashboard**: `src/components/employeeDashboard/AdvancedEmployeeDashboard.js`
- **Client Dashboard**: `src/components/clientDashboard/ClientDashboard.js`
- **Features**: KPI cards, charts, real-time metrics, role-specific views

### 3. **Sales Flow Management** (15 Steps)
- **Main Component**: `src/components/salesFlow/SalesFlow.js`
- **Service**: `src/services/salesFlowService.js`
- **Steps**:
  1. Log and Qualify Leads
  2. Initial Call and Requirement Gathering
  3. Evaluate High Value Prospects
  4. Check Feasibility
  5. Confirm Standards and Compliance
  6. Send Quotation
  7. Approve Payment Terms
  8. Sample Submission
  9. Get Approval for Sample
  10. Approve Strategic Deals
  11. Order Booking
  12. Plan & Execute Manufacturing
  13. Pack & Dispatch Material
  14. Generate Invoice
  15. Follow-up for Feedback & Payment

### 4. **Purchase Flow Management** (21 Steps)
- **Main Component**: `src/components/purchaseFlow/PurchaseFlow.js`
- **Service**: `src/services/purchaseFlowService.js`
- **Steps**:
  1. Raise Indent
  2. Approve Indent
  3. Vendor Management
  4. Float RFQ
  5. Follow-up Quotations
  6. Comparative Statement
  7. Approve Quotation
  8. Request Sample
  9. Inspect Sample
  10. Place PO
  11. Follow-up Delivery
  12. Receive and Inspect Material
  13. Material Approval
  14. Decision on Rejection
  15. Return Rejected Material
  16. Resend Material
  17. Generate GRN
  18. Submit Invoice
  19. Schedule Payment
  20. Release Payment
  21. Sort Vendors

### 5. **Production Management**
#### Cable Production Module
- **Main Component**: `src/components/cable/CableProductionModule.js`
- **Sub-modules**:
  - Product Master (`CableProductMaster.js`)
  - Production Planning (`CableProductionPlanning.js`)
  - Machine Scheduling (`MachineScheduling.js`)
  - Material Calculator (`MaterialCalculator.js`)

#### Molding Production Module
- **Main Component**: `src/components/molding/MoldingProductionModule.js`
- **Sub-modules**:
  - Power Cord Master (`PowerCordMaster.js`)
  - Production Planning (`MoldingProductionPlanning.js`)
  - Production Management (`ProductionManagement.js`)

### 6. **Inventory Management**
- **Main Component**: `src/components/Inventory/Inventory.js`
- **Sub-modules**:
  - Stock Management (`StockManagement.js`)
  - Bill of Materials (`BillOfMaterials.js`)
  - Finished Goods (`FinishedGoodsMaster.js`)
  - Material Inward/Outward (`MaterialInwardRegister.js`, `MaterialIssueRegister.js`)

### 7. **Client Management**
- **Client Manager**: `src/components/common/ClientManager.js`
- **Client Orders**: `src/components/clientOrders/EnhancedClientOrderTakingSheet.js`
- **Client Dashboard**: `src/components/clientDashboard/ClientDashboard.js`

### 8. **Flow Management & Task Tracking**
- **Main Component**: `src/components/flowManagement/FlowManagement.js`
- **My Tasks**: `src/components/flowManagement/MyTasks.js`
- **Service**: `src/services/flowService.js`

### 9. **Costing & Financial Management**
- **Costing Module**: `src/components/Costing/Costing.js`
- **Service**: `src/services/costingService.js`

### 10. **Dispatch Management**
- **Dispatch Form**: `src/components/dispatch/DispatchForm.js`
- **Service**: `src/services/dispatchService.js`

## 🔄 Data Flow Architecture

### 1. **Authentication Flow**
```
User Login → Google OAuth → Token Validation → User Profile → Role Assignment → Context Update
```

### 2. **Data Flow Pattern**
```
Component → Service Layer → Google Sheets API → Data Processing → UI Update
```

### 3. **State Management Flow**
```
AuthContext (User State) → StepStatusContext (Workflow State) → Component State → UI Rendering
```

## 🗄️ Data Storage Structure

### Google Sheets Configuration
The system uses a single Google Spreadsheet with multiple sheets:

#### Core Business Sheets
- `PO_Master` - Purchase orders and production tracking
- `CLIENT` - Client information
- `Client_Orders` - Client order management
- `Client_Payments` - Payment tracking
- `Client_Quotations` - Quotation management

#### Sales Flow Sheets
- `SalesFlow` - Main sales flow tracking
- `SalesFlowSteps` - Individual step details
- `LogAndQualifyLeads` - Lead management
- `InitialCall` - Initial call records
- `SendQuotation` - Quotation data

#### Purchase Flow Sheets
- `PurchaseFlow` - Main purchase flow tracking
- `PurchaseFlowSteps` - Individual step details
- `PurchaseFlowVendors` - Vendor management
- `PurchaseFlowApprovals` - Approval tracking
- `PurchaseFlowPayments` - Payment management

#### Production Sheets
- `Cable Products` - Cable product specifications
- `Cable Production Plans` - Production planning
- `Machine Schedules` - Machine scheduling
- `Production Orders` - Production order management

#### Employee Management Sheets
- `Employees` - Employee information
- `Performance` - Performance tracking
- `Attendance` - Attendance records
- `EmployeeTasks` - Task assignments
- `Notifications` - System notifications

#### Inventory Sheets
- `Stock` - Stock management
- `Finished Goods` - Finished goods inventory
- `Bill of Materials` - BOM management
- `Material Issue` - Material issue tracking
- `Dispatches` - Dispatch records

## 🔧 Integration Points

### 1. **Supabase API Integration**
- **Service**: `src/services/sheetService.js`
- **Features**: CRUD operations against Supabase-backed entity tables
- **Authentication**: Supabase Auth with Google OAuth redirect

### 2. **OAuth Configuration**
- **Provider**: Supabase Auth Google provider
- **Redirect**: `window.location.origin`
- **Environments**: Vercel Production, Preview, and Development use the same `REACT_APP_*` variables

### 3. **Service Layer Architecture**
Each business module has its own service:
- `salesFlowService.js` - Sales process
- `purchaseFlowService.js` - Purchase process
- `flowService.js` - Task management
- `employeeService.js` - Employee management
- `clientDashboardService.js` - Client dashboard
- `dashboardService.js` - Main dashboard
- `costingService.js` - Costing calculations

## 🚀 Deployment & Integration

### 1. **Environment Setup**
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### 2. **Supabase Setup**
1. Create or open the Supabase project
2. Apply migrations under `supabase/migrations/`
3. Enable the Supabase Google provider with the Google Web Client ID and secret
4. Add the production Vercel URL to Supabase Redirect URLs

### 3. **OAuth Configuration**
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Configure these variables in Vercel for Production, Preview, and Development

### 4. **Sheet Initialization**
- Use `src/components/admin/SheetInitializer.js` to set up required sheets
- Use `src/components/admin/SheetsTroubleshooting.js` for debugging

## 🔐 Security & Access Control

### 1. **Authentication**
- Google OAuth 2.0 with PKCE
- JWT token validation
- Session management with sessionStorage

### 2. **Authorization**
- Role-based access control (RBAC)
- Component-level permission checks
- Service-level authorization

### 3. **Data Security**
- HTTPS for all communications
- OAuth scopes for minimal permissions
- Input validation and sanitization

## 📊 Key Features

### 1. **Real-time Data Sync**
- Google Sheets as single source of truth
- Automatic data refresh
- Conflict resolution

### 2. **Responsive Design**
- Mobile-first approach
- Material-UI components
- Adaptive layouts

### 3. **Role-based Dashboards**
- Employee Dashboard - Task management
- Client Dashboard - Self-service portal

### 4. **Workflow Management**
- Step-by-step process tracking
- SLA monitoring
- Escalation handling

### 5. **Document Management**
- PDF generation
- Document storage in Google Drive
- Version control

## 🔄 Integration Patterns

### 1. **Service Integration Pattern**
```javascript
// Example: Adding a new service
class NewService {
  constructor() {
    this.sheetName = config.sheets.newSheet;
  }
  
  async getData() {
    return await sheetService.getSheetData(this.sheetName);
  }
  
  async updateData(data) {
    return await sheetService.updateSheetData(this.sheetName, data);
  }
}
```

### 2. **Component Integration Pattern**
```javascript
// Example: Adding a new component
const NewComponent = () => {
  const [data, setData] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const result = await newService.getData();
    setData(result);
  };
  
  return (
    <Box>
      {/* Component UI */}
    </Box>
  );
};
```

### 3. **Route Integration Pattern**
```javascript
// Example: Adding a new route
<Route path="/new-module" element={
  <PrivateRouteComponent>
    <NewComponent />
  </PrivateRouteComponent>
} />
```

## 📈 Performance Optimization

### 1. **Data Loading**
- Lazy loading of components
- Pagination for large datasets
- Caching of frequently accessed data

### 2. **Rendering Optimization**
- React.memo for component memoization
- useMemo and useCallback for expensive operations
- Virtual scrolling for large lists

### 3. **Bundle Optimization**
- Code splitting by routes
- Dynamic imports for heavy components
- Tree shaking for unused code

## 🧪 Testing Strategy

### 1. **Unit Testing**
- Service layer testing
- Utility function testing
- Component testing with React Testing Library

### 2. **Integration Testing**
- API integration testing
- OAuth flow testing
- Data flow testing

### 3. **End-to-End Testing**
- User workflow testing
- Cross-browser testing
- Mobile responsiveness testing

## 🔧 Maintenance & Monitoring

### 1. **Error Handling**
- Global error boundary
- Service-level error handling
- User-friendly error messages

### 2. **Logging**
- Console logging for development
- Error tracking
- Performance monitoring

### 3. **Backup & Recovery**
- Google Sheets version history
- Data export capabilities
- Disaster recovery procedures

## 📱 Mobile Integration

### 1. **Progressive Web App (PWA)**
- Service worker for offline functionality
- App manifest for installation
- Push notifications

### 2. **Responsive Design**
- Mobile-first CSS
- Touch-friendly interfaces
- Adaptive layouts

## 🔮 Future Enhancements

### 1. **Planned Features**
- WhatsApp integration
- Advanced analytics
- Machine learning insights
- Mobile app development

### 2. **Scalability Improvements**
- Database migration from Google Sheets
- Microservices architecture
- Real-time collaboration

### 3. **Integration Opportunities**
- ERP system integration
- Third-party API integrations
- IoT device connectivity

## 📞 Support & Documentation

### 1. **Documentation Files**
- `README.md` - Basic setup
- `OAUTH_SETUP.md` - OAuth configuration
- `EMPLOYEE_DASHBOARD_DOCUMENTATION.md` - Employee features
- `CLIENT_DASHBOARD_PDP.md` - Client dashboard design

### 2. **Troubleshooting**
- `src/components/admin/SheetsTroubleshooting.js`
- `src/components/dev/StorageDebugger.js`
- Console logging and error tracking

This comprehensive integration guide provides a complete overview of the Reyansh Factory AI system architecture, modules, data flow, and integration patterns. The system is designed to be modular, scalable, and maintainable, with clear separation of concerns and robust error handling.
