import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SiteComponent } from './components/site.component';
import { BlockComponent } from './components/block/block.component';
import { BannerComponent } from './components/banner/banner.component';
import { PageComponent as AboutComponent } from './components/page/about/page.component';

const routes: Routes = [
  {
    path: '',
    component: SiteComponent,
    children: [
      { path: 'block', redirectTo: '' },
      { path: 'block/:id', component: BlockComponent },
      { path: 'banner', redirectTo: '' },
      { path: 'banner/:id', component: BannerComponent },
      { path: 'about', component: AboutComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }