import { Directive } from "@angular/core";
import { MAT_DATE_FORMATS } from "@angular/material/core";

export const YEAR_FORMAT = {
  parse: {
    dateInput: "YYYY",
  },
  display: {
    dateInput: "YYYY",
    monthYearLabel: "YYYY",
    monthYearA11yLabel: "YYYY",
  },
};

export const MONTH_FORMAT = {
  parse: {
    dateInput: "MMM-YYYY",
  },
  display: {
    dateInput: "MMM-YYYY",
    monthYearLabel: "MMM",
    monthYearA11yLabel: "MMM",
  },
};

@Directive({
  selector: "[yearFormat]",
  providers: [{ provide: MAT_DATE_FORMATS, useValue: YEAR_FORMAT }],
})
export class YearFormat {}

@Directive({
  selector: "[monthFormat]",
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MONTH_FORMAT }],
})
export class MonthFormat {}
