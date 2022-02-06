import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageCropperModule } from 'ngx-image-cropper';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { LinkHttpPipe } from '../_helpers/http.pipe';

import { SiteComponent } from './site.component';
import { SidebarRightComponent } from './sidebar-r/sidebar.component';
import { SidebarLeftComponent } from './sidebar-l/sidebar.component';
import { BlockComponent } from './block/block.component';
import { BannerComponent } from './banner/banner.component';

import { PageComponent as AboutComponent } from './page/about/page.component';


@NgModule({
  declarations: [
    SiteComponent,
    SidebarRightComponent,
    SidebarLeftComponent,
    BlockComponent,
    BannerComponent,
    AboutComponent,
    LinkHttpPipe,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    ImageCropperModule,
    FormsModule, 
    ReactiveFormsModule,
  ],
  providers: [LinkHttpPipe],
})
export class SiteModule { }