import { ParentProfileBackend } from "../parentProfileBackend";

describe("Parent profile backend", () => {
  const parentProfileBackend = new ParentProfileBackend([], [], [])

  describe("Parent profile", () => {
    it("When no parent profile exists yet, there should be none", () => {
      expect(parentProfileBackend.parentProfile(1)).toBe(null);
    });

    it("When the first parent is created, it should be there with the id of 1, because the id's are incremented every time a parent is created", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .parentProfile(1))
      .toEqual({ id: 1, name: "Alice", child: "Bob" })
    });

    it("When a parent is created, and there is a parent already, the new one should have an id of 2", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createParentProfile("Charlie", "David")
        .parentProfile(2))
      .toEqual({ id: 2, name: "Charlie", child: "David" })
    });
  });

  describe("Invoices", () => {
    it("When no invoices are created yet, there should be none", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .invoices(1)).toEqual([])
    });

    it("When the first invoice is created, it should be there with the id of 1, because the id's are incremented every time an invoice is created", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createInvoice(1, 100.0, "2021-10-01")
        .invoices(1))
      .toContainEqual({ id: 1, parentId: 1, amount: 100.0, date: "2021-10-01" })
    });

    it("When an invoices is created, and there is an invoice already, the new one should have an id of 2", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createInvoice(1, 100.0, "2021-10-01")
        .createInvoice(1, 200.0, "2021-11-01")
        .invoices(1))
      .toContainEqual({ id: 2, parentId: 1, amount: 200.0, date: "2021-11-01" })
    });
  });

  describe("Payment methods", () => {
    it("When no payment methods are created yet, there should be none", () => {
      expect(parentProfileBackend.paymentMethods(1)).toEqual([])
    });

    it("When the first payment method is created, it should be there with the id of 1, because the id's are incremented every time a payment method is created", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createPaymentMethod(1, "Credit Card", true)
        .paymentMethods(1))
      .toContainEqual({ id: 1, parentId: 1, method: "Credit Card", isActive: true })
    });

    it("When a payment method is created, and there is a payment method already, the new one should have an id of 2", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createPaymentMethod(1, "Credit Card", false)
        .createPaymentMethod(1, "Debit Card", true)
        .paymentMethods(1))
      .toContainEqual({ id: 2, parentId: 1, method: "Debit Card", isActive: true })
    });

    it("When a payment method is deleted it should go away, because we don't want to keep payment methods around due to privacy concerns", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createPaymentMethod(1, "Credit Card", true)
        .deletePaymentMethod(1, 1)
        .paymentMethods(1))
      .not.toContainEqual({ id: 1, parentId: 1, method: "Credit Card", isActive: true })
    });

    it("When setting a payment method active, it should deactivate the current active one and activate the new one, so that we don't have multiple active payment methods", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createPaymentMethod(1, "Credit Card", false)
        .createPaymentMethod(1, "Debit Card", true)
        .setActivePaymentMethod(1, 1)
        .paymentMethods(1))
      .toContainEqual({ id: 1, parentId: 1, method: "Credit Card", isActive: true })
    });

    it("When a payment method is added, we should be able to get it by id, so what we can show the newly added payment method", () => {
      expect(parentProfileBackend
        .createParentProfile("Alice", "Bob")
        .createParentProfile("Charlie", "David")
        .createPaymentMethod(2, "Credit Card", true)
        .paymentMethod(1))
      .toEqual({ id: 1, parentId: 2, method: "Credit Card", isActive: true })
    });
  });
});