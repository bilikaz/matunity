import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { ManagerService } from '../../../_services/manager.service';

@Component({
  selector: 'page-comp',
  templateUrl: './page.component.html'
})
export class PageComponent implements OnInit {

  public environment = environment

  constructor(
    private router: Router,
    public managerService: ManagerService,
  ) { }

  public async ngOnInit() {}


}