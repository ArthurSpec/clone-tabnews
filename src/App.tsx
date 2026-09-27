import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { DemoStoreProvider } from "./store/DemoStore";
import { ToastProvider } from "./components/ui/Toast";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import NewTicket from "./pages/NewTicket";
import DispatchQueue from "./pages/DispatchQueue";
import AIDispatch from "./pages/AIDispatch";
import WorkOrders from "./pages/WorkOrders";
import WorkOrderDetail from "./pages/WorkOrderDetail";
import WorkOrderResult from "./pages/WorkOrderResult";
import Agenda from "./pages/Agenda";
import Technicians from "./pages/Technicians";
import TechnicianProfile from "./pages/TechnicianProfile";
import Customers from "./pages/Customers";
import EquipmentPage from "./pages/Equipment";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <DemoStoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="chamados" element={<Tickets />} />
              <Route path="chamados/novo" element={<NewTicket />} />
              <Route path="despacho" element={<DispatchQueue />} />
              <Route path="despacho/:ticketId" element={<AIDispatch />} />
              <Route path="ordens" element={<WorkOrders />} />
              <Route path="ordens/:number" element={<WorkOrderDetail />} />
              <Route path="ordens/:number/resultado" element={<WorkOrderResult />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="tecnicos" element={<Technicians />} />
              <Route path="tecnicos/:id" element={<TechnicianProfile />} />
              <Route path="clientes" element={<Customers />} />
              <Route path="equipamentos" element={<EquipmentPage />} />
              <Route path="relatorios" element={<Reports />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </DemoStoreProvider>
  );
}
