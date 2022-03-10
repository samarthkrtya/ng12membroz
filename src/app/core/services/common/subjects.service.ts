import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SubjectsService {

  constructor(
  ) {

  }

  behavioursubjects = new BehaviorSubject(null);

  behavioursubjectsArray = new BehaviorSubject(null); 

}
