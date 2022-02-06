

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  public spin_stack: any = []
  public is_loading: boolean = false;

  constructor() {}

  public start_loading() {
    this.spin_stack.push(1) 
  }

  public stop_loading() {
    this.spin_stack.shift()
  }

}