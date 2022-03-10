export class payrollSettingsModel{
    _id:String;
    payrollFrequencyType: String;
    closingDay: Number
    endingDay: Number
    serviceCost: Boolean
    productCost: Boolean
    includeTips: Boolean
    subDiscount: Boolean
    subMembershipDiscount: Boolean
    commisionTypes: String
    serviceCommission: String
    serviceName : String
    classesCommissionTypes: String
    productTierCommission: String
}

export class PayrollLookups{
    payrollFrequency : any[] = [
        { id: "101", name: "Daily" },
        { id: "102", name: "Weekly" },
        { id: "103", name: "Every Other Week" },
        { id: "104", name: "Twice Per Month" },
        { id: "105", name: "Monthly" },
      ]

      days : any[] = [
        { id: "0", name: "Sun" },
        { id: "1", name: "Mon" },
        { id: "2", name: "Tue" },
        { id: "3", name: "Wed" },
        { id: "4", name: "Thu" },
        { id: "5", name: "Fri" },
        { id: "6", name: "Sat" }
      ]

      selectedCommission : any = "Tiered Commission by Revenue"
      commissionType  = [
        { id: "201", name: "Tiered Commission by Revenue" },
        { id: "202", name: "Commission by Service" }
      ]

      classesCommissionType : any[] = [
        { id: "301", name: "Tiered Commission by Revenue" },
        { id: "302", name: "Tiered Commission by Attendees" }
      ]

      productCommissionType : any[] = [
        { id: "401", name: "Tiered Commission by Revenue" },
        { id: "402", name: "Commission by Product" }
      ]
}