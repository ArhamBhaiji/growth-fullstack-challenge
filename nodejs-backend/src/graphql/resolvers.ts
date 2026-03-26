import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend, PaymentMethod } from "../parentProfileBackend";

const profileRepository = new ProfileRepository();

const canDeletePaymentMethod = (paymentMethods: any[], methodId: number): boolean => {
  let methodToDelete: PaymentMethod | undefined;
  let activeCount = 0;

  for (const m of paymentMethods) {
    if (m.id === methodId) methodToDelete = m;
    if (m.isActive) activeCount++;

    if (activeCount > 1 && methodToDelete) return true;
  }

  return !(methodToDelete?.isActive && activeCount === 1);
};

export const resolvers = {
  Long: GraphQLLong,
  Query: {
    parentProfile: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend(await profileRepository.retrieveParentProfiles(parentId), [], []).parentProfile(parentId);
    },
    paymentMethods: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).paymentMethods(parentId);
    },
    invoices: async (_: any, { parentId }: { parentId: number }) => {
      return new ParentProfileBackend([], await profileRepository.retrieveInvoices(parentId), []).invoices(parentId);
    },
  },
  Mutation: {
    addPaymentMethod: async (
      _: any,
      { parentId, method }: { parentId: number; method: string },
    ) => {
      const paymentMethod = await profileRepository.createPaymentMethod({ id: 0, parentId, method, isActive: false });
      await profileRepository.logAudit(parentId, "ADD", paymentMethod.id, { method, isActive: false });
      return new ParentProfileBackend([], [], [paymentMethod]).paymentMethod(paymentMethod.id);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const paymentMethods = await profileRepository.retrievePaymentMethods(parentId);

      let oldActive: PaymentMethod | undefined;
      let newActive: PaymentMethod | undefined;

      for (const m of paymentMethods) {
        if (m.isActive) oldActive = m;
        if (m.id === methodId) newActive = m;
      }

      if (!newActive) return null;

      const updates: PaymentMethod[] = [];

      if (oldActive) {
        oldActive.isActive = false;
        updates.push(oldActive);
      }

      newActive.isActive = true;
      updates.push(newActive);

      await Promise.all([
        profileRepository.updatePaymentMethods(updates),
        profileRepository.logAudit(parentId, "ACTIVATE", methodId, { isActive: true }),
      ]);

      return newActive;
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const paymentMethods = await profileRepository.retrievePaymentMethods(parentId);
      const methodToDelete = paymentMethods.find(m => m.id === methodId);

      if (!canDeletePaymentMethod(paymentMethods, methodId)) {
        throw new Error("Cannot delete the last active payment method. There must always be at least one active payment method.");
      }

      await profileRepository.deletePaymentMethod(methodId);
      await profileRepository.logAudit(parentId, "DELETE", methodId, { method: methodToDelete?.method, isActive: methodToDelete?.isActive });

      return true;
    },
  },
};
