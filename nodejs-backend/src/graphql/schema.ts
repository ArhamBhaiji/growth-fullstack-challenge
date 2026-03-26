import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Long

  type ParentProfile {
    id: Long!
    name: String!
    child: String!
  }

  type PaymentMethod {
    id: Long!
    parentId: Int!
    method: String!
    isActive: Boolean!
  }

  type Invoice {
    id: Long!
    parentId: Int!
    amount: Float!
    date: String!
  }

  type Query {
    parentProfile(parentId: Long!): ParentProfile
    paymentMethods(parentId: Long!): [PaymentMethod]
    invoices(parentId: Long!): [Invoice]
  }

  type Mutation {
    addPaymentMethod(parentId: Long!, method: String!): PaymentMethod
    setActivePaymentMethod(parentId: Long!, methodId: Long!): PaymentMethod
    deletePaymentMethod(parentId: Long!, methodId: Long!): Boolean
  }
`;
