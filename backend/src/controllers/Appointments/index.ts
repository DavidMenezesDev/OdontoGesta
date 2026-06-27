import type { Request, Response } from "express";
import {
  createAppointment as createAppointmentService,
  listAppointments as listAppointmentsService,
  getAppointmentById as getAppointmentByIdService,
  updateAppointment as updateAppointmentService,
  deleteAppointment as deleteAppointmentService,
  createFollowUp as createFollowUpService,
} from "../../services/Appointments/index.js";

export async function create(req: Request, res: Response) {
  const { date, endTime, patientId, dentistId, notes } = req.body;

  if (!date || !patientId || !dentistId) {
    res.status(400).json({ error: "Os campos date, patientId e dentistId são obrigatórios." });
    return;
  }

  if (typeof date !== "string" || typeof patientId !== "string" || typeof dentistId !== "string") {
    res.status(400).json({ error: "date, patientId e dentistId devem ser textos." });
    return;
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    res.status(400).json({ error: "Data inválida." });
    return;
  }

  if (endTime !== undefined && endTime !== null) {
    if (typeof endTime !== "string") {
      res.status(400).json({ error: "endTime deve ser uma string." });
      return;
    }
    const parsedEndTime = new Date(endTime);
    if (isNaN(parsedEndTime.getTime())) {
      res.status(400).json({ error: "Horário de término inválido." });
      return;
    }
  }

  try {
    const enterpriseId = req.user!.enterpriseId;
    const result = await createAppointmentService({ date, endTime, patientId, dentistId, notes }, enterpriseId);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("não encontrado")) {
      res.status(404).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const date = typeof req.query["date"] === "string" ? req.query["date"] : undefined;
    const year = typeof req.query["year"] === "string" ? req.query["year"] : undefined;
    const month = typeof req.query["month"] === "string" ? req.query["month"] : undefined;

    const result = await listAppointmentsService(enterpriseId, { date, year, month }, req.user?.id, req.user?.role);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do agendamento não informado." });
      return;
    }

    const result = await getAppointmentByIdService(id, enterpriseId, req.user?.id, req.user?.role);
    if (!result) {
      res.status(404).json({ error: "Agendamento não encontrado." });
      return;
    }

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    res.status(500).json({ error: message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do agendamento não informado." });
      return;
    }

    const { date, endTime, patientId, dentistId, status, notes } = req.body;

    if (date !== undefined && typeof date !== "string") {
      res.status(400).json({ error: "date deve ser uma string." });
      return;
    }
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        res.status(400).json({ error: "Data inválida." });
        return;
      }
    }

    if (endTime !== undefined && endTime !== null && typeof endTime !== "string") {
      res.status(400).json({ error: "endTime deve ser uma string." });
      return;
    }
    if (endTime !== undefined && endTime !== null) {
      const parsedEndTime = new Date(endTime);
      if (isNaN(parsedEndTime.getTime())) {
        res.status(400).json({ error: "Horário de término inválido." });
        return;
      }
    }

    if (status !== undefined && typeof status !== "string") {
      res.status(400).json({ error: "status deve ser uma string." });
      return;
    }

    const result = await updateAppointmentService(id, { date, endTime, patientId, dentistId, status, notes }, enterpriseId);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("não encontrado")) {
      res.status(404).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do agendamento não informado." });
      return;
    }

    await deleteAppointmentService(id, enterpriseId);
    res.json({ message: "Agendamento removido com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("não encontrado")) {
      res.status(404).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}

export async function followUp(req: Request, res: Response) {
  try {
    const enterpriseId = req.user!.enterpriseId;
    const id = req.params["id"] as string;
    if (!id) {
      res.status(400).json({ error: "ID do agendamento não informado." });
      return;
    }

    const { months, specificDate } = req.body;

    if (months !== undefined && specificDate !== undefined) {
      res.status(400).json({ error: "Informe apenas meses ou apenas uma data específica." });
      return;
    }

    if (months === undefined && specificDate === undefined) {
      res.status(400).json({ error: "Informe os meses ou uma data específica para o retorno." });
      return;
    }

    if (months !== undefined) {
      if (typeof months !== "number" || months <= 0 || !Number.isInteger(months)) {
        res.status(400).json({ error: "months deve ser um número inteiro positivo." });
        return;
      }
    }

    if (specificDate !== undefined) {
      if (typeof specificDate !== "string") {
        res.status(400).json({ error: "specificDate deve ser uma string." });
        return;
      }
      const parsed = new Date(specificDate);
      if (isNaN(parsed.getTime())) {
        res.status(400).json({ error: "Data inválida." });
        return;
      }
    }

    const result = await createFollowUpService({ appointmentId: id, months, specificDate }, enterpriseId);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";

    if (message.includes("não encontrado")) {
      res.status(404).json({ error: message });
      return;
    }

    res.status(500).json({ error: message });
  }
}
