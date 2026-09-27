import { useCallback } from "react";
import { useStore } from "./DemoStore";
import { customerById } from "../data/customers";
import { equipment } from "../data/equipment";
import { technicians } from "../data/technicians";
import { DEMO_NOW } from "../data/tickets";
import { analyzeRequest, findBestTechnician } from "../services/aiService";

/** Executa análise + matching de um chamado e guarda o resultado no estado. */
export function useDispatchFlow() {
  const { state, dispatch, techStatus } = useStore();

  return useCallback(
    async (ticketId: string, latency = { analyze: 600, match: 1250 }) => {
      const ticket = state.tickets.find((t) => t.id === ticketId);
      if (!ticket) return;
      const customer = customerById(ticket.customerId)!;
      const analysis = await analyzeRequest(
        {
          ticketId,
          text: ticket.messages?.map((m) => m.text).join("\n") ?? ticket.title,
          customer,
          knownEquipment: equipment
            .filter((e) => e.customer === customer.name)
            .map((e) => ({ id: e.id, brand: e.brand, capacity: e.capacity, type: e.type })),
        },
        { latencyMs: latency.analyze },
      );
      const result = await findBestTechnician(
        analysis,
        customer,
        {
          technicians: technicians.map((t) => ({ ...t, status: techStatus(t.id) })),
          appointments: state.appointments,
          now: DEMO_NOW,
        },
        { latencyMs: latency.match },
      );
      dispatch({ type: "saveAnalysis", analysis });
      dispatch({ type: "saveDispatch", result });
      return { analysis, result };
    },
    [state.tickets, state.appointments, dispatch, techStatus],
  );
}
