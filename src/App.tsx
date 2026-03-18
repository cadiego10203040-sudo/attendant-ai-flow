import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CompanyProvider } from "@/hooks/useCompany";
import { ExternalCompanyProvider } from "@/hooks/useExternalCompany";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import DashboardConversations from "./pages/DashboardConversations";
import DashboardMetrics from "./pages/DashboardMetrics";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardSettings from "./pages/DashboardSettings";
import DashboardAILive from "./pages/DashboardAILive";
import DashboardLiveChat from "./pages/DashboardLiveChat";
import DashboardBroadcast from "./pages/DashboardBroadcast";
import DashboardAudience from "./pages/DashboardAudience";
import DashboardFlows from "./pages/DashboardFlows";
import DashboardLabels from "./pages/DashboardLabels";
import DashboardQuickReplies from "./pages/DashboardQuickReplies";
import DashboardHours from "./pages/DashboardHours";
import DashboardConnections from "./pages/DashboardConnections";
import DashboardAPI from "./pages/DashboardAPI";
import DashboardAutomation from "./pages/DashboardAutomation";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataDeletion from "./pages/DataDeletion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CompanyProvider>
          <ExternalCompanyProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardConversations /></ProtectedRoute>} />
              <Route path="/dashboard/metrics" element={<ProtectedRoute><DashboardMetrics /></ProtectedRoute>} />
              <Route path="/dashboard/orders" element={<ProtectedRoute><DashboardOrders /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardSettings /></ProtectedRoute>} />
              <Route path="/dashboard/ai-live" element={<ProtectedRoute><DashboardAILive /></ProtectedRoute>} />
              <Route path="/dashboard/live-chat" element={<ProtectedRoute><DashboardLiveChat /></ProtectedRoute>} />
              <Route path="/dashboard/broadcast" element={<ProtectedRoute><DashboardBroadcast /></ProtectedRoute>} />
              <Route path="/dashboard/audience" element={<ProtectedRoute><DashboardAudience /></ProtectedRoute>} />
              <Route path="/dashboard/flows" element={<ProtectedRoute><DashboardFlows /></ProtectedRoute>} />
              <Route path="/dashboard/labels" element={<ProtectedRoute><DashboardLabels /></ProtectedRoute>} />
              <Route path="/dashboard/quick-replies" element={<ProtectedRoute><DashboardQuickReplies /></ProtectedRoute>} />
              <Route path="/dashboard/hours" element={<ProtectedRoute><DashboardHours /></ProtectedRoute>} />
              <Route path="/dashboard/connections" element={<ProtectedRoute><DashboardConnections /></ProtectedRoute>} />
              <Route path="/dashboard/api" element={<ProtectedRoute><DashboardAPI /></ProtectedRoute>} />
              <Route path="/dashboard/automation" element={<ProtectedRoute><DashboardAutomation /></ProtectedRoute>} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/termos" element={<TermsOfService />} />
              <Route path="/exclusao-dados" element={<DataDeletion />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
