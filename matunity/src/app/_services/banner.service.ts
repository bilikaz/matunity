import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  constructor(
    private http: HttpClient
  ) { }

  get(block_id:number): Observable<any> {
    return this.http.get(environment.api_url + '/banners/' + block_id, httpOptions)
  }

  getAll(filters:any = {}): Observable<any> {

    let query_string = '?'
    Object.keys(filters).map(function(key, index) {
      if ( filters[key] != null ) {
        query_string += key + '=' + filters[key] + '&'
      }
    })
    query_string = query_string.slice(0, -1)

    return this.http.get(environment.api_url + '/banners' + query_string, httpOptions)

  } 

}