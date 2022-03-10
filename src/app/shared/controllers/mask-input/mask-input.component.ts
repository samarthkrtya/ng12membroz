import { Component, forwardRef, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Subject } from "rxjs";

@Component({
  selector: "mask-input",
  templateUrl: "./mask-input.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskInputComponent),
      multi: true
    }
  ]
})

export class MaskInputComponent implements OnInit ,ControlValueAccessor {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() formControlName;
  @Input() maskFormat: string;
  @Input() placeHolder: string;
  

  val = new FormControl();

  constructor() {}

  ngOnInit() {
  }

  inputChange() {
    if(this.val) {
      this.value = this.val.value
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  onChange: any = () => {};
  onTouch: any = () => {};

  set value(val) {
    if(val !== undefined){
      this.val.setValue(val);
      this.onChange(val)
      this.onTouch(val)
    }
  }

  writeValue(value: any){
    this.value = value;
  }

  registerOnChange(fn: any){
    this.onChange = fn
  }

  registerOnTouched(fn: any){
    this.onTouch = fn
  }
 

}
