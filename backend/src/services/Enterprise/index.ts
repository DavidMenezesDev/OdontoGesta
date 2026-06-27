import { prisma } from "../../lib/prisma.js";

export interface EnterpriseResult {
  id: string;
  cnpj: string | null;
  nome: string | null;
  phone: string | null;
  email: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  logo: string | null;
  active: boolean;
}

export interface UpdateEnterpriseParams {
  nome?: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logo?: string;
}

export async function getEnterprise(enterpriseId: string): Promise<EnterpriseResult | null> {
  const enterprise = await prisma.enterprise.findUnique({
    where: { id: enterpriseId },
  });

  if (!enterprise) return null;

  return {
    id: enterprise.id,
    cnpj: enterprise.cnpj,
    nome: enterprise.nome,
    phone: enterprise.phone,
    email: enterprise.email,
    street: enterprise.street,
    number: enterprise.number,
    complement: enterprise.complement,
    neighborhood: enterprise.neighborhood,
    city: enterprise.city,
    state: enterprise.state,
    zipCode: enterprise.zipCode,
    logo: enterprise.logo,
    active: enterprise.active,
  };
}

export async function updateEnterprise(
  enterpriseId: string,
  params: UpdateEnterpriseParams,
): Promise<EnterpriseResult> {
  const enterprise = await prisma.enterprise.update({
    where: { id: enterpriseId },
    data: {
      ...(params.nome !== undefined && { nome: params.nome }),
      ...(params.cnpj !== undefined && { cnpj: params.cnpj }),
      ...(params.phone !== undefined && { phone: params.phone }),
      ...(params.email !== undefined && { email: params.email }),
      ...(params.street !== undefined && { street: params.street }),
      ...(params.number !== undefined && { number: params.number }),
      ...(params.complement !== undefined && { complement: params.complement }),
      ...(params.neighborhood !== undefined && { neighborhood: params.neighborhood }),
      ...(params.city !== undefined && { city: params.city }),
      ...(params.state !== undefined && { state: params.state }),
      ...(params.zipCode !== undefined && { zipCode: params.zipCode }),
      ...(params.logo !== undefined && { logo: params.logo }),
    },
  });

  return {
    id: enterprise.id,
    cnpj: enterprise.cnpj,
    nome: enterprise.nome,
    phone: enterprise.phone,
    email: enterprise.email,
    street: enterprise.street,
    number: enterprise.number,
    complement: enterprise.complement,
    neighborhood: enterprise.neighborhood,
    city: enterprise.city,
    state: enterprise.state,
    zipCode: enterprise.zipCode,
    logo: enterprise.logo,
    active: enterprise.active,
  };
}
