import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TenderManagement from "@/pages/TenderManagement";
import ClientManagement from "@/pages/ClientManagement";
import Settings from "@/pages/Settings";
import Reports from "@/pages/Reports";
import CompaniesPage from "@/pages/CompaniesPage";
import OEMsPage from "@/pages/OEMsPage";
import CustomersPage from "@/pages/CustomersPage";
import LeadsPage from "@/pages/LeadsPage";
import DocumentManagementPage from "@/pages/DocumentManagementPage";
import UserManagementPage from "@/pages/UserManagementPage";

// Placeholder component for pages under development
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-medium text-text-primary">{title}</h2>
    </div>
    <p>This page is under development. Coming soon!</p>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/companies" component={CompaniesPage} />
      <Route path="/oems" component={OEMsPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/user-management" component={UserManagementPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/document-management" component={DocumentManagementPage} />
      <Route path="/tender-management" component={TenderManagement} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
