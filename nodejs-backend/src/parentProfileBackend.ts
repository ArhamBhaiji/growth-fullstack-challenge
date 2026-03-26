export interface ParentProfile {
    id: number;
    name: string;
    child: string;
}
  
export interface PaymentMethod {
    id: number;
    parentId: number;
    method: string;
    isActive: boolean;
}
  
export  interface Invoice {
    id: number;
    parentId: number;
    amount: number;
    date: string;
}

export class ParentProfileBackend {
    private readonly allParentProfiles: ParentProfile[];
    private readonly allInvoices: Invoice[];
    private readonly allPaymentMethods: PaymentMethod[];

    constructor(parentProfiles: ParentProfile[], invoices: Invoice[], paymentMethods: PaymentMethod[]) {
        this.allParentProfiles = parentProfiles;
        this.allInvoices = invoices;
        this.allPaymentMethods = paymentMethods;
    }

    parentProfile(parentId: number) {
        return this.allParentProfiles.find(parentProfile => parentProfile.id === parentId) ?? null;
    }

    createParentProfile(parent: string, child: string) {
        return new ParentProfileBackend([...this.allParentProfiles, { id: this.allParentProfiles.length + 1, name: parent, child }], this.allInvoices, this.allPaymentMethods);
    }

    invoices(parentId: number) { 
        return this.allInvoices.filter(invoice => invoice.parentId === parentId);
    }

    createInvoice(parentId: number, amount: number, date: string) {
        return new ParentProfileBackend(this.allParentProfiles, [...this.allInvoices, { id: this.allInvoices.length + 1, parentId, amount, date }], this.allPaymentMethods);
    }

    paymentMethods(parentId: number) {
        return this.allPaymentMethods.filter(paymentMethod => paymentMethod.parentId === parentId);
    }

    paymentMethod(paymentMethodId: number) {
        return this.allPaymentMethods.find(paymentMethod => paymentMethod.id === paymentMethodId);
    }

    createPaymentMethod(parentId: number, method: string, isActive: boolean) {
        return new ParentProfileBackend(this.allParentProfiles, this.allInvoices, [...this.allPaymentMethods, { id: this.allPaymentMethods.length + 1, parentId, method, isActive }]);
    }

    deletePaymentMethod(parentId: number, methodId: number) {
        return new ParentProfileBackend(this.allParentProfiles, this.allInvoices, this.allPaymentMethods.filter(paymentMethod => !(paymentMethod.parentId === parentId && paymentMethod.id === methodId)));
    }

    setActivePaymentMethod(parentId: number, paymentMethodId: number) {
        return new ParentProfileBackend(this.allParentProfiles, this.allInvoices, this.allPaymentMethods.map(paymentMethod => ({...paymentMethod, isActive: (paymentMethod.parentId === parentId && paymentMethod.id === paymentMethodId) }) ));
    }
}
