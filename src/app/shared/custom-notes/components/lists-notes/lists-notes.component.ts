import {Component, HostBinding, EventEmitter, Output, ElementRef, OnInit} from '@angular/core'

@Component({
  selector: 'app-lists-notes',
  templateUrl: './lists-notes.component.html',
  styleUrls: ['./lists-notes.component.css']
})



export class ListsNotesComponent implements OnInit {

  recognition:any;

  @Output() dismiss = new EventEmitter();
  @Output() focusoutEvent = new EventEmitter();
  
  constructor(private el:ElementRef) {
    const {webkitSpeechRecognition} : IWindow = <IWindow><unknown>window;
     this.recognition = new webkitSpeechRecognition();
     this.recognition.onresult = (event)=> {
       this.el.nativeElement.querySelector(".content-custom-note").innerText += event.results[0][0].transcript
       console.log(event.results[0][0].transcript) 
       document.getElementById('toolbar').focus();
     };
   }

   ngOnInit(): void {
    }
   
   onDismiss(event){
     this.dismiss.emit(event);
   }
   
   onFocusOut(event){
     console.log("app-lists-notes onFocusOut called");
     this.focusoutEvent.emit(event)
   }
 
   record(event) {
     this.recognition.start();
   }

  

}


export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

