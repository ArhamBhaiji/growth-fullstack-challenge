import { GraphQLLong } from "graphql-scalars";
import { ProfileRepository } from "../repository/profileRepository";
import { ParentProfileBackend } from "../parentProfileBackend";

const profileRepository = new ProfileRepository();

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
      return new ParentProfileBackend([], [], [paymentMethod]).paymentMethod(paymentMethod.id);
    },
    setActivePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const parentProfileBackend = new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId)).setActivePaymentMethod(parentId, methodId);

      await profileRepository.updatePaymentMethods(parentProfileBackend.paymentMethods(parentId))

      return parentProfileBackend.paymentMethod(methodId);
    },
    deletePaymentMethod: async (
      _: any,
      { parentId, methodId }: { parentId: number; methodId: number },
    ) => {
      const initialParentProfileBackend = new ParentProfileBackend([], [], await profileRepository.retrievePaymentMethods(parentId));
      const parentProfileBackend = initialParentProfileBackend.deletePaymentMethod(parentId, methodId);

      await Promise.all(initialParentProfileBackend.paymentMethods(parentId)
        .filter(paymentMethod => !parentProfileBackend.paymentMethods(parentId).includes(paymentMethod))
        .map(paymentMethod => profileRepository.deletePaymentMethod(paymentMethod.id)))

      return true;
    },
  },
};
